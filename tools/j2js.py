#!/usr/bin/env python3
"""Type-aware Java(subset) -> JavaScript transpiler for the OpenCityBloxx sources."""
import re, sys, os, json

# ------------------------------------------------------------------ lexer
TOKEN_RE = re.compile(r'''
  (?P<ws>\s+)
 |(?P<lc>//[^\n]*)
 |(?P<bc>/\*.*?\*/)
 |(?P<str>"(?:\\.|[^"\\])*")
 |(?P<chr>'(?:\\.|[^'\\])+')
 |(?P<num>0[xX][0-9a-fA-F]+[lL]?|(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?[fFdDlL]?)
 |(?P<id>[A-Za-z_$][A-Za-z_$0-9]*)
 |(?P<op>>>>=|<<=|>>=|>>>|\.\.\.|\+\+|--|&&|\|\||==|!=|<=|>=|\+=|-=|\*=|/=|%=|&=|\|=|\^=|<<|>>|->|[{}()\[\];,.<>=!~?:+\-*/&|^%@])
''', re.X | re.S)

def lex(src):
    pos = 0; toks = []
    while pos < len(src):
        m = TOKEN_RE.match(src, pos)
        if not m:
            raise SyntaxError('lex error at %d: %r' % (pos, src[pos:pos+30]))
        pos = m.end()
        k = m.lastgroup
        if k in ('ws', 'lc', 'bc'): continue
        toks.append((k, m.group(k)))
    toks.append(('eof', ''))
    return toks

PRIMS = {'int', 'short', 'byte', 'char', 'long', 'float', 'double', 'boolean', 'void'}
MODS = {'public', 'private', 'protected', 'static', 'final', 'abstract', 'synchronized', 'native', 'transient', 'volatile', 'strictfp'}
INTEGRAL = {'int', 'short', 'byte', 'char'}
FLOATING = {'float', 'double'}
JS_RESERVED = {'in', 'function', 'let', 'var', 'delete', 'typeof', 'with', 'yield', 'await', 'arguments', 'eval', 'export', 'debugger', 'undefined', 'NaN', 'Infinity', 'of', 'async', 'static_', 'name_'}
JS_RESERVED -= {'of', 'async', 'static_', 'name_'}

WARN = []
def warn(msg):
    WARN.append(msg)

# ------------------------------------------------------------------ parser
class P:
    def __init__(self, toks, fname):
        self.t = toks; self.i = 0; self.f = fname
    def pk(self, n=0): return self.t[min(self.i + n, len(self.t) - 1)]
    def nx(self):
        r = self.t[self.i]; self.i += 1; return r
    def is_op(self, s, n=0):
        k, v = self.pk(n); return k == 'op' and v == s
    def is_id(self, s, n=0):
        k, v = self.pk(n); return k == 'id' and v == s
    def eat_op(self, s):
        if self.is_op(s): self.i += 1; return True
        return False
    def eat_id(self, s):
        if self.is_id(s): self.i += 1; return True
        return False
    def expect_op(self, s):
        if not self.eat_op(s):
            raise SyntaxError('%s: expected %r got %r near token %d (%s)' % (self.f, s, self.pk(), self.i, ' '.join(v for _, v in self.t[max(0, self.i-8):self.i+4])))
    def ident(self):
        k, v = self.nx()
        if k != 'id': raise SyntaxError('%s: expected identifier got %r (%s)' % (self.f, v, ' '.join(v for _, v in self.t[max(0, self.i-8):self.i+4])))
        return v

    # ---- types
    def try_type(self):
        s = self.i
        k, v = self.pk()
        if k != 'id': return None
        self.i += 1
        name = v
        if v in PRIMS: pass
        else:
            while self.is_op('.') and self.pk(1)[0] == 'id':
                self.i += 1; name = self.nx()[1]
            if self.is_op('<'):
                if not self.skip_generics():
                    self.i = s; return None
        while self.is_op('[') and self.is_op(']', 1):
            self.i += 2; name += '[]'
        return name

    def skip_generics(self):
        depth = 0
        while True:
            k, v = self.pk()
            if k == 'op' and v == '<': depth += 1
            elif k == 'op' and v == '>': depth -= 1
            elif k == 'op' and v == '>>': depth -= 2
            elif k == 'op' and v == '>>>': depth -= 3
            elif k == 'id' or (k == 'op' and v in (',', '?', '.', '[', ']', '&')): pass
            else: return False
            self.i += 1
            if depth <= 0: return depth == 0

    # ---- compilation unit
    def parse_unit(self):
        classes = []
        while self.pk()[0] != 'eof':
            if self.is_id('package') or self.is_id('import'):
                while not self.eat_op(';'): self.nx()
                continue
            if self.eat_op(';'): continue
            classes.append(self.parse_class())
        return classes

    def parse_mods(self):
        mods = set()
        while True:
            if self.is_op('@'):
                self.nx(); self.ident()
                if self.is_op('('):
                    d = 0
                    while True:
                        k, v = self.nx()
                        if v == '(' and k == 'op': d += 1
                        if v == ')' and k == 'op':
                            d -= 1
                            if d == 0: break
                continue
            k, v = self.pk()
            if k == 'id' and v in MODS: mods.add(v); self.nx(); continue
            break
        return mods

    def parse_class(self):
        mods = self.parse_mods()
        kind = self.ident()
        if kind not in ('class', 'interface', 'enum'): raise SyntaxError('class expected, got ' + kind)
        name = self.ident()
        sup = None; ifaces = []
        if self.eat_id('extends'):
            sup = self.try_type()
            while self.eat_op(','): ifaces.append(self.try_type())
        if self.eat_id('implements'):
            ifaces.append(self.try_type())
            while self.eat_op(','): ifaces.append(self.try_type())
        cls = dict(kind=kind, name=name, sup=sup, ifaces=ifaces, mods=mods, fields=[], methods=[], ctors=[], inits=[], inner=[])
        self.expect_op('{')
        while not self.eat_op('}'):
            self.parse_member(cls)
        return cls

    def parse_member(self, cls):
        if self.eat_op(';'): return
        # static init
        if self.is_id('static') and self.is_op('{', 1):
            self.nx(); cls['inits'].append(('static', self.parse_block())); return
        if self.is_op('{'):
            cls['inits'].append(('inst', self.parse_block())); return
        mods = self.parse_mods()
        if self.is_id('class') or self.is_id('interface') or self.is_id('enum'):
            self.i -= 0
            # push back mods is unnecessary
            kind = self.ident(); name = self.ident()
            raise SyntaxError('nested class %s unsupported in %s' % (name, self.f))
        # constructor
        if self.pk()[0] == 'id' and self.pk()[1] == cls['name'] and self.is_op('(', 1):
            self.nx()
            params = self.parse_params()
            if self.eat_id('throws'):
                self.try_type()
                while self.eat_op(','): self.try_type()
            body = self.parse_block()
            cls['ctors'].append(dict(params=params, body=body, mods=mods)); return
        rtype = self.try_type()
        if rtype is None: raise SyntaxError('%s: bad member at %r' % (self.f, self.pk()))
        name = self.ident()
        if self.is_op('('):
            params = self.parse_params()
            while self.is_op('[') : self.nx(); self.expect_op(']'); rtype += '[]'
            if self.eat_id('throws'):
                self.try_type()
                while self.eat_op(','): self.try_type()
            body = None
            if self.is_op('{'): body = self.parse_block()
            else: self.expect_op(';')
            cls['methods'].append(dict(name=name, ret=rtype, params=params, body=body, static='static' in mods, mods=mods))
            return
        # field(s)
        while True:
            t = rtype
            while self.is_op('['): self.nx(); self.expect_op(']'); t += '[]'
            init = None
            if self.eat_op('='): init = self.parse_var_init(t)
            cls['fields'].append(dict(name=name, type=t, init=init, static='static' in mods, mods=mods))
            if self.eat_op(','): name = self.ident(); continue
            self.expect_op(';'); break

    def parse_params(self):
        self.expect_op('(')
        ps = []
        while not self.eat_op(')'):
            self.parse_mods()
            t = self.try_type()
            if self.eat_op('...'): t += '[]'
            n = self.ident()
            while self.is_op('['): self.nx(); self.expect_op(']'); t += '[]'
            ps.append((t, n))
            self.eat_op(',')
        return ps

    # ---- statements
    def parse_block(self):
        self.expect_op('{')
        sts = []
        while not self.eat_op('}'): sts.append(self.parse_stmt())
        return ('block', sts)

    def looks_like_decl(self):
        s = self.i
        self.parse_mods()
        t = self.try_type()
        ok = False
        if t is not None and self.pk()[0] == 'id' and self.pk()[1] not in ('instanceof',):
            n1 = self.pk(1)
            if n1[0] == 'op' and n1[1] in ('=', ';', ',', ':', '['): ok = True
        self.i = s
        return ok

    def parse_decl(self):
        self.parse_mods()
        t = self.try_type()
        decls = []
        while True:
            n = self.ident(); tt = t
            while self.is_op('['): self.nx(); self.expect_op(']'); tt += '[]'
            init = None
            if self.eat_op('='): init = self.parse_var_init(tt)
            decls.append((tt, n, init))
            if not self.eat_op(','): break
        return ('decl', decls)

    def parse_var_init(self, t):
        if self.is_op('{'): return self.parse_array_init(t)
        return self.parse_expr()

    def parse_array_init(self, t):
        et = t[:-2] if t.endswith('[]') else '?'
        self.expect_op('{')
        elems = []
        while not self.eat_op('}'):
            if self.is_op('{'): elems.append(self.parse_array_init(et))
            else: elems.append(self.parse_expr())
            self.eat_op(',')
        return ('arrinit', t, elems)

    def parse_stmt(self):
        k, v = self.pk()
        if k == 'op':
            if v == '{': return self.parse_block()
            if v == ';': self.nx(); return ('empty',)
        if k == 'id':
            if v == 'if':
                self.nx(); self.expect_op('('); c = self.parse_expr(); self.expect_op(')')
                th = self.parse_stmt(); el = None
                if self.eat_id('else'): el = self.parse_stmt()
                return ('if', c, th, el)
            if v == 'while':
                self.nx(); self.expect_op('('); c = self.parse_expr(); self.expect_op(')')
                return ('while', c, self.parse_stmt())
            if v == 'do':
                self.nx(); b = self.parse_stmt()
                if not self.eat_id('while'): raise SyntaxError('while expected')
                self.expect_op('('); c = self.parse_expr(); self.expect_op(')'); self.expect_op(';')
                return ('dowhile', b, c)
            if v == 'for':
                self.nx(); self.expect_op('(')
                init = []
                if not self.is_op(';'):
                    if self.looks_like_decl():
                        d = self.parse_decl()
                        if self.is_op(':'):
                            self.nx(); it = self.parse_expr(); self.expect_op(')')
                            return ('foreach', d[1][0][0], d[1][0][1], it, self.parse_stmt())
                        init = [d]
                    else:
                        init = [('expr', self.parse_expr())]
                        while self.eat_op(','): init.append(('expr', self.parse_expr()))
                self.expect_op(';')
                cond = None if self.is_op(';') else self.parse_expr()
                self.expect_op(';')
                upd = []
                if not self.is_op(')'):
                    upd.append(self.parse_expr())
                    while self.eat_op(','): upd.append(self.parse_expr())
                self.expect_op(')')
                return ('for', init, cond, upd, self.parse_stmt())
            if v == 'return':
                self.nx(); e = None
                if not self.is_op(';'): e = self.parse_expr()
                self.expect_op(';'); return ('return', e)
            if v == 'break':
                self.nx(); lab = None
                if self.pk()[0] == 'id': lab = self.nx()[1]
                self.expect_op(';'); return ('break', lab)
            if v == 'continue':
                self.nx(); lab = None
                if self.pk()[0] == 'id': lab = self.nx()[1]
                self.expect_op(';'); return ('continue', lab)
            if v == 'throw':
                self.nx(); e = self.parse_expr(); self.expect_op(';'); return ('throw', e)
            if v == 'switch':
                self.nx(); self.expect_op('('); e = self.parse_expr(); self.expect_op(')'); self.expect_op('{')
                cases = []
                while not self.eat_op('}'):
                    labels = []
                    while True:
                        if self.eat_id('case'):
                            labels.append(self.parse_expr()); self.expect_op(':')
                        elif self.eat_id('default'):
                            labels.append(None); self.expect_op(':')
                        else: break
                    body = []
                    while not (self.is_id('case') or self.is_id('default') or self.is_op('}')):
                        body.append(self.parse_stmt())
                    cases.append((labels, body))
                return ('switch', e, cases)
            if v == 'try':
                self.nx()
                res = None
                body = self.parse_block(); catches = []; fin = None
                while self.eat_id('catch'):
                    self.expect_op('(')
                    self.parse_mods()
                    t = self.try_type()
                    while self.eat_op('|'): self.try_type()
                    n = self.ident(); self.expect_op(')')
                    catches.append((t, n, self.parse_block()))
                if self.eat_id('finally'): fin = self.parse_block()
                return ('try', body, catches, fin)
            if v == 'synchronized' and self.is_op('(', 1):
                self.nx(); self.expect_op('('); self.parse_expr(); self.expect_op(')')
                return self.parse_block()
            if v == 'assert':
                self.nx(); self.parse_expr()
                if self.eat_op(':'): self.parse_expr()
                self.expect_op(';'); return ('empty',)
            if self.pk(1)[0] == 'op' and self.pk(1)[1] == ':' and v not in ('default', 'case'):
                self.nx(); self.nx()
                return ('label', v, self.parse_stmt())
            if v == 'final' or self.looks_like_decl():
                d = self.parse_decl(); self.expect_op(';'); return d
        e = self.parse_expr(); self.expect_op(';')
        return ('expr', e)

    # ---- expressions
    ASSIGN = {'=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>=', '>>>='}
    BIN = [['||'], ['&&'], ['|'], ['^'], ['&'], ['==', '!='], ['<', '>', '<=', '>=', 'instanceof'], ['<<', '>>', '>>>'], ['+', '-'], ['*', '/', '%']]

    def parse_expr(self):
        lhs = self.parse_ternary()
        k, v = self.pk()
        if k == 'op' and v in self.ASSIGN:
            self.nx(); rhs = self.parse_expr()
            return ('assign', v, lhs, rhs)
        return lhs

    def parse_ternary(self):
        c = self.parse_bin(0)
        if self.eat_op('?'):
            a = self.parse_expr(); self.expect_op(':'); b = self.parse_ternary_or_assign()
            return ('cond', c, a, b)
        return c

    def parse_ternary_or_assign(self):
        return self.parse_expr()

    def parse_bin(self, lvl):
        if lvl >= len(self.BIN): return self.parse_unary()
        l = self.parse_bin(lvl + 1)
        while True:
            k, v = self.pk()
            if (k == 'op' or (k == 'id' and v == 'instanceof')) and v in self.BIN[lvl]:
                self.nx()
                if v == 'instanceof':
                    t = self.try_type(); l = ('instanceof', l, t); continue
                r = self.parse_bin(lvl + 1)
                l = ('bin', v, l, r)
            else: return l

    def is_cast(self):
        # at '('
        s = self.i
        self.nx()
        k, v = self.pk()
        res = False
        if k == 'id':
            t = self.try_type()
            if t is not None and self.is_op(')'):
                if t in PRIMS or t.rstrip('[]') in PRIMS:
                    res = True
                else:
                    nk, nv = self.pk(1)
                    if nk in ('id', 'str', 'num', 'chr') or (nk == 'op' and nv in ('(', '!', '~')):
                        if not (nk == 'id' and nv == 'instanceof'): res = True
        self.i = s
        return res

    def parse_unary(self):
        k, v = self.pk()
        if k == 'op':
            if v in ('+', '-', '!', '~'):
                self.nx(); e = self.parse_unary()
                if v == '-' and e[0] == 'lit' and e[1] in ('int', 'long', 'float', 'double') and not e[2].startswith('-'):
                    return ('lit', e[1], '-' + e[2])
                return ('un', v, e)
            if v in ('++', '--'):
                self.nx(); return ('preinc', v, self.parse_unary())
            if v == '(' and self.is_cast():
                self.nx(); t = self.try_type(); self.expect_op(')')
                return ('cast', t, self.parse_unary())
        return self.parse_postfix()

    def parse_args(self):
        self.expect_op('(')
        a = []
        while not self.eat_op(')'):
            a.append(self.parse_expr()); self.eat_op(',')
        return a

    def parse_postfix(self):
        e = self.parse_primary()
        while True:
            k, v = self.pk()
            if k != 'op': break
            if v == '.':
                self.nx()
                if self.is_id('class'):
                    self.nx(); e = ('classlit', e); continue
                n = self.ident()
                if self.is_op('('): e = ('call', e, n, self.parse_args())
                else: e = ('field', e, n)
            elif v == '[':
                self.nx(); idx = self.parse_expr(); self.expect_op(']'); e = ('index', e, idx)
            elif v in ('++', '--'):
                self.nx(); e = ('postinc', v, e)
            else: break
        return e

    def parse_primary(self):
        k, v = self.nx()
        if k == 'num': return ('lit',) + num_kind(v)
        if k == 'str': return ('lit', 'String', v)
        if k == 'chr': return ('lit', 'char', v)
        if k == 'op' and v == '(':
            e = self.parse_expr(); self.expect_op(')'); return ('paren', e)
        if k == 'id':
            if v == 'true' or v == 'false': return ('lit', 'boolean', v)
            if v == 'null': return ('lit', 'null', 'null')
            if v == 'this':
                if self.is_op('('): return ('call', None, 'this', self.parse_args())
                return ('this',)
            if v == 'super':
                if self.is_op('('): return ('call', None, 'super', self.parse_args())
                return ('super',)
            if v == 'new': return self.parse_new()
            if v in PRIMS:
                # e.g. int.class or int[].class
                while self.is_op('[') and self.is_op(']', 1): self.i += 2
                return ('name', v)
            if self.is_op('('): return ('call', None, v, self.parse_args())
            return ('name', v)
        raise SyntaxError('%s: unexpected token %r (%s)' % (self.f, (k, v), ' '.join(x for _, x in self.t[max(0, self.i-10):self.i+5])))

    def parse_new(self):
        k, v = self.nx()
        name = v
        while self.is_op('.'): self.nx(); name = self.ident()
        if self.is_op('<'): self.skip_generics()
        if self.is_op('('):
            args = self.parse_args()
            if self.is_op('{'):
                # anonymous class
                body = self.parse_anon_body(name)
                return ('anon', name, args, body)
            return ('new', name, args)
        dims = []; extra = 0
        while self.is_op('['):
            self.nx()
            if self.is_op(']'): self.nx(); extra += 1
            else:
                dims.append(self.parse_expr()); self.expect_op(']')
        t = name + '[]' * (len(dims) + extra)
        init = None
        if self.is_op('{'): init = self.parse_array_init(t)
        return ('newarr', name, dims, extra, init)

    def parse_anon_body(self, name):
        cls = dict(kind='class', name=name, sup=None, ifaces=[], mods=set(), fields=[], methods=[], ctors=[], inits=[], inner=[])
        self.expect_op('{')
        while not self.eat_op('}'): self.parse_member(cls)
        return cls

def num_kind(v):
    lv = v.lower()
    if lv.startswith('0x'):
        if lv.endswith('l'): return ('long', v[:-1])
        return ('int', v)
    if lv.endswith('l'): return ('long', v[:-1])
    if lv.endswith('f'): return ('float', v[:-1])
    if lv.endswith('d'): return ('double', v[:-1])
    if '.' in v or 'e' in lv: return ('double', v)
    return ('int', v)

# ------------------------------------------------------------------ class table
CLASSES = {}   # name -> class dict (project classes)
EXT_CLASSES = {'Canvas', 'Graphics', 'Image', 'Font', 'Command', 'Form', 'TextField', 'Display', 'Assets', 'Player', 'RecordStore', 'Model',
                'Graphics3D', 'MIDlet', 'Displayable', 'CommandListener', 'Vector', 'Hashtable', 'Random', 'StringBuffer', 'StringBuilder',
                'DataInputStream', 'DataOutputStream', 'ByteArrayInputStream', 'ByteArrayOutputStream', 'InputStream', 'Math', 'Integer', 'System',
                'Array', 'String', 'Thread', 'Locale', 'Character', 'Float', 'Long', 'Byte', 'Short', 'Boolean', 'Double', 'Object', 'HashMap', 'Map', 'PrintStream',
                'RecordStoreException', 'Runnable', 'CustomTops', 'Option', 'BufferedReader', 'InputStreamReader', 'IOException', 'Exception', 'Throwable', 'RuntimeException'}

RET_BY_NAME = {
    # jme / runtime method return types, by method name
    'getWidth': 'int', 'getHeight': 'int', 'stringWidth': 'int', 'substringWidth': 'int', 'charWidth': 'int', 'getBaselinePosition': 'int',
    'getClipX': 'int', 'getClipY': 'int', 'getClipWidth': 'int', 'getClipHeight': 'int', 'getGameAction': 'int', 'getKeyName': 'String',
    'readInt': 'int', 'readUnsignedShort': 'int', 'readUnsignedByte': 'int', 'readByte': 'byte', 'readShort': 'short', 'readBoolean': 'boolean',
    'readUTF': 'String', 'readLine': 'String', 'skipBytes': 'int', 'available': 'int', 'getNumRecords': 'int', 'getRecord': 'byte[]',
    'toByteArray': 'byte[]', 'getCommandType': 'int', 'getLabel': 'String', 'getString': 'String', 'getCaretPosition': 'int', 'size': 'int',
    'getMaxSize': 'int', 'nextInt': 'int', 'getLevel': 'int', 'elementAt': 'Object', 'getAppProperty': 'String', 'getPriority': 'int',
    'getMessage': 'String', 'toString': 'String', 'getFont': 'Font', 'readBytes': 'byte[]', 'open': 'InputStream', 'getBytes': 'byte[]',
    'identity': 'float[]', 'mul': 'float[]', 'invert': 'float[]', 'translation': 'float[]', 'rotation': 'float[]', 'perspective': 'float[]',
    'getGraphics': 'Graphics', 'getDisplay': 'Display', 'find': 'Model', 'createImage': 'Image', 'createRGBImage': 'Image',
    'getModel': 'Mesh3D', 'getImage': 'Image', 'openRead': 'DataInputStream', 'openWrite': 'DataOutputStream', 'openStream': 'DataInputStream',
    'indexOf': 'int', 'lastIndexOf': 'int', 'length': 'int', 'compareTo': 'int', 'charAt': 'char', 'substring': 'String', 'trim': 'String',
    'valueOf': 'String', 'parseInt': 'int', 'currentTimeMillis': 'long', 'nanoTime': 'long', 'intValue': 'int', 'toLowerCase': 'String', 'toUpperCase': 'String',
}

def fieldjs(cname, fname):
    c = CLASSES.get(cname)
    if c is None: return fname
    mnames = {m['name'] for m in c['methods']}
    if fname in mnames: return fname + '_f'
    if fname in JS_RESERVED: return fname + '_'
    return fname

def build_table(classes):
    for c in classes:
        CLASSES[c['name']] = c
    for c in classes:
        meths = {}
        for m in c['methods']:
            meths.setdefault(m['name'], []).append(m)
        c['mtab'] = meths
        c['ftab'] = {f['name']: f for f in c['fields']}
        for name, ms in meths.items():
            if len(ms) > 1:
                arities = [len(m['params']) for m in ms]
                for m in ms:
                    if len(set(arities)) == len(arities): m['js'] = '%s$%d' % (name, len(m['params']))
                    else: m['js'] = name + '$' + '_'.join(t.replace('[]', 'A') for t, _ in m['params'])
            else:
                ms[0]['js'] = name
        for m in c['methods']:
            if m['name'] in c['ftab']:
                pass

def class_chain(cname):
    out = []
    while cname and cname in CLASSES:
        out.append(cname); cname = CLASSES[cname]['sup']
    return out

def find_field(cname, fname):
    for cn in class_chain(cname):
        f = CLASSES[cn]['ftab'].get(fname)
        if f: return cn, f
    return None, None

def find_methods(cname, mname):
    for cn in class_chain(cname):
        ms = CLASSES[cn]['mtab'].get(mname)
        if ms: return cn, ms
    return None, []

def is_assignable(argt, pt):
    if argt == pt: return True
    if argt == '?' or pt == '?': return True
    num = ['byte', 'short', 'char', 'int', 'long', 'float', 'double']
    if argt in num and pt in num: return num.index(argt) <= num.index(pt) or (argt == 'char' and pt == 'int')
    if argt == 'null': return pt not in PRIMS
    if pt in PRIMS or argt in PRIMS: return False
    if pt == 'Object': return True
    return True

def pick_overload(ms, argts):
    cands = [m for m in ms if len(m['params']) == len(argts)]
    if len(cands) == 1: return cands[0]
    if not cands: return ms[0] if ms else None
    # exact, then assignable
    for m in cands:
        if all(pt == at for (pt, _), at in zip(m['params'], argts)): return m
    for m in cands:
        if all(is_assignable(at, pt) for (pt, _), at in zip(m['params'], argts)): return m
    return cands[0]

# ------------------------------------------------------------------ emitter
def jsstr(raw):
    return raw   # java string literal syntax is a subset of JS (except octal escapes)

def char_code(raw):
    body = raw[1:-1]
    if body.startswith('\\'):
        c = body[1:]
        m = {'n': 10, 't': 9, 'r': 13, 'b': 8, 'f': 12, '0': 0, '\\': 92, "'": 39, '"': 34}
        if c in m: return m[c]
        if c.startswith('u'): return int(c[1:], 16)
        if c.isdigit(): return int(c, 8)
    return ord(body)

def default_for(t):
    if t in ('boolean',): return 'false'
    if t in INTEGRAL or t in ('long', 'float', 'double'): return '0'
    return 'null'

TYPED = {'int': 'Int32Array', 'short': 'Int16Array', 'byte': 'Int8Array', 'char': 'Uint16Array', 'float': 'Float32Array', 'double': 'Float64Array', 'long': 'Float64Array'}

class Ctx:
    def __init__(self, cls, static, ret='void'):
        self.cls = cls; self.static = static; self.scopes = [{}]; self.ret = ret
        self.labels = []
    def push(self): self.scopes.append({})
    def pop(self): self.scopes.pop()
    def decl(self, n, t): self.scopes[-1][n] = t
    def lookup(self, n):
        for s in reversed(self.scopes):
            if n in s: return s[n]
        return None

def promote(a, b):
    if a == 'double' or b == 'double': return 'double'
    if a == 'float' or b == 'float': return 'float'
    if a == 'long' or b == 'long': return 'long'
    if a in INTEGRAL and b in INTEGRAL: return 'int'
    return '?'

def isint(t): return t in INTEGRAL
def isnum(t): return t in INTEGRAL or t in FLOATING or t == 'long'

class Emitter:
    def __init__(self, cls):
        self.c = cls; self.cname = cls['name']
        self.ctx = None
        self.out = []

    def W(self, s, ind=0): self.out.append('  ' * ind + s)

    def vname(self, n):
        return n + '_' if n in JS_RESERVED else n

    def jsarr(self, et, dims_code, extra):
        """array creation: et element base type, dims list of code strings, extra trailing unspecified dims."""
        if len(dims_code) == 1 and extra == 0:
            n = dims_code[0]
            if et in TYPED: return 'new %s(%s)' % (TYPED[et], n)
            if et == 'boolean': return 'new Array(%s).fill(false)' % n
            return 'new Array(%s).fill(null)' % n
        if extra > 0 and len(dims_code) == 1:
            return 'new Array(%s).fill(null)' % dims_code[0]
        # multi-dim fully specified or with trailing
        base = et if extra == 0 else 'null'
        return 'mkArr(%r, [%s], %d)' % (base, ', '.join(dims_code), extra)

    # ---------------------------------------------------------- expressions: returns (code, type)
    def ex(self, e):
        k = e[0]
        return getattr(self, 'x_' + k)(e)

    def x_paren(self, e):
        c, t = self.ex(e[1]); return '(' + c + ')', t

    def x_lit(self, e):
        _, t, v = e
        if t == 'String': return v, 'String'
        if t == 'char': return str(char_code(v)), 'char'
        if t == 'boolean': return v, 'boolean'
        if t == 'null': return 'null', 'null'
        if t == 'int':
            if v.lower().startswith('0x'):
                n = int(v, 16)
                if n > 0x7fffffff: n -= 1 << 32
                return str(n), 'int'
            if len(v) > 1 and v.startswith('0') and v.isdigit(): warn('octal literal ' + v); return str(int(v, 8)), 'int'
            return v, 'int'
        if t == 'long':
            if v.lower().startswith('0x'): return str(int(v, 16)), 'long'
            return v, 'long'
        if t in ('float', 'double'):
            return (v if not v.endswith('.') else v + '0'), t
        return v, t

    def x_this(self, e): return 'this', self.cname
    def x_super(self, e): return 'super', self.c['sup'] or '?'
    def x_classlit(self, e): return 'null', 'Class'

    def x_name(self, e):
        n = e[1]
        t = self.ctx.lookup(n)
        if t is not None: return self.vname(n), t
        owner, f = find_field(self.cname, n)
        if f:
            js = fieldjs(owner, n)
            if f['static']: return '%s.%s' % (owner, js), f['type']
            return 'this.' + js, f['type']
        if n in CLASSES or n in EXT_CLASSES: return n, 'class:' + n
        if n in PRIMS: return n, 'class:' + n
        warn('%s: unresolved name %s in %s' % (self.cname, n, getattr(self, 'curm', '?')))
        return n, '?'

    def x_field(self, e):
        _, obj, n = e
        if n == 'this': return 'this', obj[1] if obj[0] == 'name' else '?'
        oc, ot = self.ex(obj)
        if ot.startswith('class:'):
            cn = ot[6:]
            if cn in CLASSES:
                owner, f = find_field(cn, n)
                if f: return '%s.%s' % (owner, fieldjs(owner, n)), f['type']
                warn('%s: no static field %s.%s' % (self.cname, cn, n))
                return '%s.%s' % (cn, n), '?'
            sp = {('Integer', 'MAX_VALUE'): ('2147483647', 'int'), ('Integer', 'MIN_VALUE'): ('-2147483648', 'int'),
                  ('Integer', 'TYPE'): ("'int'", '?'), ('Byte', 'TYPE'): ("'byte'", '?'), ('Short', 'TYPE'): ("'short'", '?'),
                  ('Boolean', 'TYPE'): ("'boolean'", '?'), ('Float', 'TYPE'): ("'float'", '?'), ('Character', 'TYPE'): ("'char'", '?'),
                  ('Long', 'TYPE'): ("'long'", '?'), ('Math', 'PI'): ('Math.PI', 'double'), ('Float', 'MAX_VALUE'): ('3.4028234663852886e38', 'float'), ('System', 'out'): ('System.out', 'PrintStream'), ('System', 'err'): ('System.err', 'PrintStream')}
            if (cn, n) in sp: return sp[(cn, n)]
            if cn == 'Canvas' and n in ('UP', 'DOWN', 'LEFT', 'RIGHT', 'FIRE', 'LOGICAL_W', 'LOGICAL_H'): return 'Canvas.' + n, 'int'
            if cn in ('Graphics', 'Font', 'Command', 'Model'): return '%s.%s' % (cn, n), 'int'
            return '%s.%s' % (cn, n), '?'
        if n == 'length' and ot.endswith('[]'): return oc + '.length', 'int'
        if ot in CLASSES:
            owner, f = find_field(ot, n)
            if f:
                js = fieldjs(owner, n)
                if f['static']: return '%s.%s' % (owner, js), f['type']
                return '%s.%s' % (oc, js), f['type']
        if n == 'length': return oc + '.length', 'int'
        return '%s.%s' % (oc, n), '?'

    def x_index(self, e):
        oc, ot = self.ex(e[1]); ic, it = self.ex(e[2])
        et = ot[:-2] if ot.endswith('[]') else '?'
        return '%s[%s]' % (oc, ic), et

    def x_cond(self, e):
        c, ct = self.ex(e[1]); a, at = self.ex(e[2]); b, bt = self.ex(e[3])
        if isnum(at) and isnum(bt): t = promote(at, bt) if at != bt else at
        elif at == 'null': t = bt
        else: t = at
        return '(%s ? %s : %s)' % (c, a, b), t

    def x_instanceof(self, e):
        c, t = self.ex(e[1])
        tn = e[2]
        if tn in CLASSES and CLASSES[tn]['kind'] == 'class': return '(%s instanceof %s)' % (c, tn), 'boolean'
        return '(%s != null)' % c, 'boolean'

    def x_cast(self, e):
        _, t, inner = e
        c, it = self.ex(inner)
        if t in ('int',):
            if it in INTEGRAL: return c, 'int'
            return '(%s | 0)' % c, 'int'
        if t == 'short':
            return '((%s) << 16 >> 16)' % c, 'short'
        if t == 'byte':
            return '((%s) << 24 >> 24)' % c, 'byte'
        if t == 'char':
            return '((%s) & 65535)' % c, 'char'
        if t == 'long':
            if isint(it) or it == 'long': return c, 'long'
            return 'Math.trunc(%s)' % c, 'long'
        if t in ('float', 'double'): return c, t
        if t == 'boolean': return c, 'boolean'
        return c, t

    def x_un(self, e):
        _, op, x = e
        c, t = self.ex(x)
        if op == '!': return '!%s' % c, 'boolean'
        if op == '-': return '(-%s)' % c, ('int' if t in INTEGRAL else t)
        if op == '+': return c, ('int' if t in INTEGRAL else t)
        if op == '~': return '(~%s)' % c, ('int' if t in INTEGRAL else t)
        raise Exception(op)

    def x_preinc(self, e):
        c, t = self.ex(e[2]); return '(%s%s)' % (e[1], c), t
    def x_postinc(self, e):
        c, t = self.ex(e[2]); return '(%s%s)' % (c, e[1]), t

    def strconv(self, c, t):
        if t == 'char': return 'String.fromCharCode(%s)' % c
        if t in FLOATING: return 'fstr(%s)' % c
        return c

    def x_bin(self, e):
        _, op, l, r = e
        lc, lt = self.ex(l); rc, rt = self.ex(r)
        if op == '+' and (lt == 'String' or rt == 'String'):
            return '(%s + %s)' % (self.strconv(lc, lt), self.strconv(rc, rt)), 'String'
        if op in ('==', '!='):
            js = '===' if op == '==' else '!=='
            if lt == 'null' or rt == 'null': js = '==' if op == '==' else '!='
            return '(%s %s %s)' % (lc, js, rc), 'boolean'
        if op in ('<', '>', '<=', '>='): return '(%s %s %s)' % (lc, op, rc), 'boolean'
        if op in ('&&', '||'): return '(%s %s %s)' % (lc, op, rc), 'boolean'
        if op in ('&', '|', '^') and lt == 'boolean' and rt == 'boolean':
            if op == '^': return '(%s !== %s)' % (lc, rc), 'boolean'
            return '!!(%s %s %s)' % (lc, op, rc), 'boolean'
        t = promote(lt, rt)
        if op in ('<<', '>>', '>>>'):
            t = 'int' if lt in INTEGRAL else lt
            if lt == 'long':
                if op == '>>': return 'Math.floor(%s / Math.pow(2, %s))' % (lc, rc), 'long'
                if op == '<<': return '(%s * Math.pow(2, %s))' % (lc, rc), 'long'
                warn('%s: long >>> unsupported' % self.cname)
            return '(%s %s %s)' % (lc, op, rc), t
        if op in ('&', '|', '^'):
            if t == 'long': warn('%s: long bitop %s in %s' % (self.cname, op, getattr(self, 'curm', '?')))
            return '(%s %s %s)' % (lc, op, rc), t
        if t == '?':
            if op in ('*', '/'): warn('%s.%s: untyped operands for %s: %s %s %s' % (self.cname, getattr(self, 'curm', '?'), op, lc, lt, rt))
            return '(%s %s %s)' % (lc, op, rc), '?'
        if op == '*':
            if t == 'int': return 'Math.imul(%s, %s)' % (lc, rc), 'int'
            return '(%s * %s)' % (lc, rc), t
        if op == '/':
            if t == 'int': return '((%s / %s) | 0)' % (lc, rc), 'int'
            if t == 'long': return 'Math.trunc(%s / %s)' % (lc, rc), 'long'
            return '(%s / %s)' % (lc, rc), t
        return '(%s %s %s)' % (lc, op, rc), t

    def x_assign(self, e):
        _, op, l, r = e
        lc, lt = self.ex(l)
        if r[0] == 'arrinit': rc, rt = self.arrinit(r), r[1]
        else: rc, rt = self.ex(r)
        if op == '=':
            return '%s = %s' % (lc, rc), lt
        bop = op[:-1]
        if lt == 'String' and bop == '+':
            return '%s += %s' % (lc, self.strconv(rc, rt)), 'String'
        if lt in INTEGRAL or lt == 'long':
            if bop == '/':
                if lt == 'long': return '%s = Math.trunc(%s / %s)' % (lc, lc, rc), lt
                return '%s = ((%s / %s) | 0)' % (lc, lc, rc), lt
            if bop == '*':
                if lt == 'int' and rt in INTEGRAL: return '%s = Math.imul(%s, %s)' % (lc, lc, rc), lt
                if lt == 'long' and rt in INTEGRAL or rt == 'long': return '%s *= %s' % (lc, rc), lt
                return '%s = ((%s * %s) | 0)' % (lc, lc, rc), lt
            if bop in ('+', '-') and rt in FLOATING:
                return '%s = ((%s %s %s) | 0)' % (lc, lc, bop, rc), lt
            if lt in ('short', 'byte', 'char') and bop in ('+', '-', '|', '&', '^', '<<', '>>', '>>>'):
                sh = {'short': '<< 16 >> 16', 'byte': '<< 24 >> 24', 'char': '& 65535'}[lt]
                return '%s = ((%s %s %s) %s)' % (lc, lc, bop, rc, sh), lt
            if lt == 'long' and bop in ('>>', '<<'):
                return '%s = %s' % (lc, self.x_bin(('bin', bop, l, r))[0]), lt
            if lt == 'long' and bop in ('&', '|', '^', '>>>'): warn('%s: long compound %s' % (self.cname, op))
        if lt == 'boolean' and bop in ('&', '|', '^'):
            return '%s = !!(%s %s %s)' % (lc, lc, bop, rc), lt
        if lt == '?' and bop in ('*', '/'): warn('%s.%s: untyped compound %s' % (self.cname, getattr(self, 'curm', '?'), op))
        return '%s %s %s' % (lc, op, rc), lt

    def arrinit(self, a):
        _, t, elems = a
        et = t[:-2]
        parts = []
        for x in elems:
            if x[0] == 'arrinit': parts.append(self.arrinit(x))
            else:
                c, _t = self.ex(x); parts.append(c)
        body = '[%s]' % ', '.join(parts)
        if et in TYPED: return 'new %s(%s)' % (TYPED[et], body)
        return body

    def x_newarr(self, e):
        _, name, dims, extra, init = e
        if init is not None:
            return self.arrinit(init), name + '[]' * (len(dims) + extra)
        dcs = [self.ex(d)[0] for d in dims]
        return self.jsarr(name, dcs, extra), name + '[]' * (len(dims) + extra)

    def x_new(self, e):
        _, name, args = e
        acs = [self.ex(a) for a in args]
        argc = ', '.join(c for c, _ in acs)
        if name == 'Object': return '{}', 'Object'
        if name == 'Random': return 'new JRandom()', 'Random'
        if name == 'Exception' or name.endswith('Exception') or name == 'Throwable' or name == 'Error':
            return 'new Error(%s)' % argc, name
        if name == 'String':
            return 'S.newString(%s)' % argc, 'String'
        if name in CLASSES:
            return 'new %s(%s)' % (name, argc), name
        return 'new %s(%s)' % (name, argc), name

    def x_anon(self, e):
        _, name, args, cls = e
        saved = self.out; self.out = []
        parts = []
        for m in cls['methods']:
            if m['body'] is None: continue
            self.ctx.push()
            for t, n in m['params']: self.ctx.decl(n, t)
            saved_ret = self.ctx.ret
            self.out = []
            self.body(m['body'], 0)
            body = '\n'.join(self.out)
            self.ctx.pop()
            parts.append('%s: (%s) => {\n%s\n}' % (m['name'], ', '.join(self.vname(n) for _, n in m['params']), body))
        self.out = saved
        return '{\n%s\n}' % ',\n'.join(parts), name

    def x_call(self, e):
        _, obj, name, args = e
        acs = [self.ex(a) for a in args]
        argc = ', '.join(c for c, _ in acs)
        argts = [t for _, t in acs]
        if obj is None:
            if name == 'super': return 'super(%s)' % argc, 'void'
            if name == 'this': return 'this_ctor(%s)' % argc, 'void'
            cn, ms = find_methods(self.cname, name)
            if ms:
                m = pick_overload(ms, argts)
                js = m['js']
                if m['static']: return '%s.%s(%s)' % (cn, js, argc), m['ret']
                return 'this.%s(%s)' % (js, argc), m['ret']
            # inherited from ext superclass (Canvas/MIDlet...) or unknown
            ret = RET_BY_NAME.get(name, '?')
            if self.c['sup'] in EXT_CLASSES or self.c['sup'] is None: pass
            return 'this.%s(%s)' % (name, argc), ret
        # super.method(...)
        if obj[0] == 'super':
            sup = self.c['sup']
            if sup in CLASSES:
                cn, ms = find_methods(sup, name)
                if ms:
                    m = pick_overload(ms, argts); return 'super.%s(%s)' % (m['js'], argc), m['ret']
            return 'super.%s(%s)' % (name, argc), RET_BY_NAME.get(name, '?')
        oc, ot = self.ex(obj)
        if ot.startswith('class:'):
            cn = ot[6:]
            if cn in CLASSES:
                owner, ms = find_methods(cn, name)
                if ms:
                    m = pick_overload(ms, argts); return '%s.%s(%s)' % (owner, m['js'], argc), m['ret']
                warn('%s: no static method %s.%s' % (self.cname, cn, name))
                return '%s.%s(%s)' % (cn, name, argc), '?'
            return self.builtin_static(cn, name, acs)
        if ot == 'String': return self.string_call(oc, name, acs)
        if ot.endswith('[]'):
            if name == 'clone': return '%s.slice()' % oc, ot
            return '%s.%s(%s)' % (oc, name, argc), '?'
        if ot in ('StringBuffer', 'StringBuilder'):
            if name == 'append' and argts and argts[0] == 'char':
                return '%s.append(String.fromCharCode(%s))' % (oc, argc), ot
            if name == 'append' and argts and argts[0] in FLOATING:
                return '%s.append(fstr(%s))' % (oc, argc), ot
            if name == 'append': return '%s.append(%s)' % (oc, argc), ot
            if name == 'insert' and len(argts) == 2 and argts[1] == 'char':
                return '%s.insert(%s, String.fromCharCode(%s))' % (oc, acs[0][0], acs[1][0]), ot
            if name == 'charAt': return '%s.charAt(%s)' % (oc, argc), 'char'
            return '%s.%s(%s)' % (oc, name, argc), RET_BY_NAME.get(name, '?')
        if ot in CLASSES:
            owner, ms = find_methods(ot, name)
            if ms:
                m = pick_overload(ms, argts)
                if m['static']: return '%s.%s(%s)' % (owner, m['js'], argc), m['ret']
                return '%s.%s(%s)' % (oc, m['js'], argc), m['ret']
        # generic builtin instance methods
        if name == 'getMessage': return '(%s).message' % oc, 'String'
        if name == 'printStackTrace': return 'console.error(%s)' % oc, 'void'
        if name == 'intValue': return oc, 'int'
        if name == 'equals': return '(%s === %s)' % (oc, argc), 'boolean'
        if name == 'getClass': return '%s.constructor' % oc, 'Class'
        if name == 'hashCode': return 'hashCode(%s)' % oc, 'int'
        ret = RET_BY_NAME.get(name, '?')
        if ot == 'Vector' and name in ('elementAt', 'firstElement', 'lastElement', 'get'): ret = 'Object'
        return '%s.%s(%s)' % (oc, name, argc), ret

    def string_call(self, oc, name, acs):
        argc = ', '.join(c for c, _ in acs)
        ts = [t for _, t in acs]
        def sc(i):  # arg as string-or-char->string
            c, t = acs[i]
            return 'String.fromCharCode(%s)' % c if t in INTEGRAL and t != 'String' else c
        if name == 'length': return '%s.length' % oc, 'int'
        if name == 'charAt': return '%s.charCodeAt(%s)' % (oc, argc), 'char'
        if name == 'equals': return '(%s === %s)' % (oc, argc), 'boolean'
        if name == 'equalsIgnoreCase': return '(%s.toLowerCase() === %s.toLowerCase())' % (oc, argc), 'boolean'
        if name == 'compareTo': return 'S.compare(%s, %s)' % (oc, argc), 'int'
        if name in ('indexOf', 'lastIndexOf'):
            rest = ''.join(', ' + acs[i][0] for i in range(1, len(acs)))
            return '%s.%s(%s%s)' % (oc, name, sc(0), rest), 'int'
        if name == 'replace':
            return '%s.split(%s).join(%s)' % (oc, sc(0), sc(1)), 'String'
        if name == 'toCharArray': return 'S.toCharArray(%s)' % oc, 'char[]'
        if name == 'getBytes': return 'S.getBytes(%s)' % oc, 'byte[]'
        if name == 'isEmpty': return '(%s.length === 0)' % oc, 'boolean'
        if name in ('substring', 'trim', 'toLowerCase', 'toUpperCase'): return '%s.%s(%s)' % (oc, name, argc), 'String'
        if name in ('startsWith', 'endsWith'): return '%s.%s(%s)' % (oc, name, argc), 'boolean'
        if name == 'contains': return '%s.includes(%s)' % (oc, argc), 'boolean'
        if name == 'concat': return '(%s + %s)' % (oc, argc), 'String'
        if name == 'intern' or name == 'toString': return oc, 'String'
        if name == 'hashCode': return 'hashCode(%s)' % oc, 'int'
        warn('%s: unknown String method %s' % (self.cname, name))
        return '%s.%s(%s)' % (oc, name, argc), '?'

    def builtin_static(self, cn, name, acs):
        argc = ', '.join(c for c, _ in acs)
        ts = [t for _, t in acs]
        if cn == 'Math':
            if name in ('abs', 'max', 'min'):
                t = ts[0] if len(ts) == 1 else promote(ts[0], ts[1])
                return 'Math.%s(%s)' % (name, argc), t
            if name == 'round':
                return 'Math.round(%s)' % argc, ('int' if ts[0] == 'float' else 'long')
            if name == 'toRadians': return '(%s * Math.PI / 180)' % argc, 'double'
            if name == 'toDegrees': return '(%s * 180 / Math.PI)' % argc, 'double'
            if name == 'signum': return 'Math.sign(%s)' % argc, 'double'
            return 'Math.%s(%s)' % (name, argc), 'double'
        if cn == 'String' and name == 'valueOf':
            if ts and ts[0] == 'char': return 'String.fromCharCode(%s)' % argc, 'String'
            if ts and ts[0] in FLOATING: return 'fstr(%s)' % argc, 'String'
            return 'String(%s)' % argc, 'String'
        if cn == 'Integer':
            if name == 'valueOf': return argc, 'int'
            if name == 'parseInt': return 'Integer.parseInt(%s)' % argc, 'int'
            if name == 'toString': return 'String(%s)' % argc, 'String'
            return 'Integer.%s(%s)' % (name, argc), '?'
        if cn == 'System':
            ret = {'currentTimeMillis': 'long', 'nanoTime': 'long'}.get(name, 'void')
            return 'System.%s(%s)' % (name, argc), ret
        if cn == 'Array' and name == 'newInstance':
            return 'newInstanceArr(%s)' % argc, '?'
        if cn == 'Character':
            return 'Character.%s(%s)' % (name, argc), '?'
        if cn == 'Thread':
            return 'Thread.%s(%s)' % (name, argc), '?'
        if cn == 'Font' and name == 'getFont': return 'Font.getFont(%s)' % argc, 'Font'
        if cn == 'Image': return 'Image.%s(%s)' % (name, argc), 'Image'
        if cn == 'Graphics3D':
            r = RET_BY_NAME.get(name, 'void')
            return 'Graphics3D.%s(%s)' % (name, argc), r
        return '%s.%s(%s)' % (cn, name, argc), RET_BY_NAME.get(name, '?')

    # ---------------------------------------------------------- statements
    def stmt(self, s, ind):
        getattr(self, 's_' + s[0])(s, ind)

    def body(self, s, ind):
        # emit a statement as a braced body
        if s[0] == 'block':
            self.ctx.push()
            for x in s[1]: self.stmt(x, ind + 1)
            self.ctx.pop()
        else:
            self.ctx.push(); self.stmt(s, ind + 1); self.ctx.pop()

    def s_block(self, s, ind):
        self.W('{', ind); self.body(s, ind); self.W('}', ind)
    def s_empty(self, s, ind): self.W(';', ind)

    def decl_code(self, decls, kw='let'):
        parts = []
        for t, n, init in decls:
            self.ctx.decl(n, t)
            if init is None: parts.append(self.vname(n))
            elif init[0] == 'arrinit': parts.append('%s = %s' % (self.vname(n), self.arrinit(init)))
            else:
                c, it = self.ex(init)
                parts.append('%s = %s' % (self.vname(n), c))
        return '%s %s' % (kw, ', '.join(parts))

    def s_decl(self, s, ind): self.W(self.decl_code(s[1]) + ';', ind)

    def strip(self, c):
        while c.startswith('(') and c.endswith(')') and self.balanced(c[1:-1]): c = c[1:-1]
        return c
    def balanced(self, c):
        d = 0; instr = None; i = 0
        while i < len(c):
            ch = c[i]
            if instr:
                if ch == '\\': i += 1
                elif ch == instr: instr = None
            elif ch in '"\'': instr = ch
            elif ch in '([{': d += 1
            elif ch in ')]}':
                d -= 1
                if d < 0: return False
            i += 1
        return d == 0

    def s_expr(self, s, ind):
        c, t = self.ex(s[1]); self.W(self.strip(c) + ';', ind)

    def s_if(self, s, ind):
        _, c, th, el = s
        cc, _t = self.ex(c)
        self.W('if (%s) {' % self.strip(cc), ind); self.body(th, ind)
        while el is not None and el[0] == 'if':
            cc, _t = self.ex(el[1])
            self.W('} else if (%s) {' % self.strip(cc), ind); self.body(el[2], ind); el = el[3]
        if el is not None:
            self.W('} else {', ind); self.body(el, ind)
        self.W('}', ind)

    def s_while(self, s, ind):
        cc, _t = self.ex(s[1]); self.W('while (%s) {' % self.strip(cc), ind); self.body(s[2], ind); self.W('}', ind)
    def s_dowhile(self, s, ind):
        self.W('do {', ind); self.body(s[1], ind)
        cc, _t = self.ex(s[2]); self.W('} while (%s);' % self.strip(cc), ind)

    def s_for(self, s, ind):
        _, init, cond, upd, body = s
        self.ctx.push()
        ic = ''
        if init:
            if init[0][0] == 'decl': ic = self.decl_code(init[0][1])
            else: ic = ', '.join(self.strip(self.ex(x[1])[0]) for x in init)
        cc = self.strip(self.ex(cond)[0]) if cond else ''
        uc = ', '.join(self.strip(self.ex(u)[0]) for u in upd)
        self.W('for (%s; %s; %s) {' % (ic, cc, uc), ind)
        self.body(body, ind); self.W('}', ind)
        self.ctx.pop()

    def s_foreach(self, s, ind):
        _, t, n, it, body = s
        ic, itt = self.ex(it)
        self.ctx.push(); self.ctx.decl(n, t)
        self.W('for (const %s of %s) {' % (self.vname(n), ic), ind); self.body(body, ind); self.W('}', ind)
        self.ctx.pop()

    def s_return(self, s, ind):
        if s[1] is None: self.W('return;', ind)
        else:
            if s[1][0] == 'arrinit': c = self.arrinit(s[1])
            else: c, _t = self.ex(s[1])
            self.W('return %s;' % self.strip(c), ind)
    def s_break(self, s, ind): self.W('break%s;' % (' ' + s[1] if s[1] else ''), ind)
    def s_continue(self, s, ind): self.W('continue%s;' % (' ' + s[1] if s[1] else ''), ind)
    def s_throw(self, s, ind):
        c, _t = self.ex(s[1]); self.W('throw %s;' % c, ind)
    def s_label(self, s, ind):
        self.W('%s:' % s[1], ind); self.stmt(s[2], ind)

    def s_switch(self, s, ind):
        _, e, cases = s
        c, t = self.ex(e)
        self.W('switch (%s) {' % self.strip(c), ind)
        self.ctx.push()
        for labels, body in cases:
            for l in labels:
                if l is None: self.W('default:', ind + 1)
                else:
                    lc, _t = self.ex(l); self.W('case %s:' % self.strip(lc), ind + 1)
            for b in body: self.stmt(b, ind + 2)
        self.ctx.pop()
        self.W('}', ind)

    def s_try(self, s, ind):
        _, body, catches, fin = s
        self.W('try {', ind); self.body(body, ind)
        for t, n, blk in catches:
            self.ctx.push(); self.ctx.decl(n, t)
            self.W('} catch (%s) {' % self.vname(n), ind); self.body(blk, ind); self.ctx.pop()
        if not catches and fin is None: self.W('} catch (_e) {', ind)
        if fin is not None:
            self.W('} finally {', ind); self.body(fin, ind)
        self.W('}', ind)

    # ---------------------------------------------------------- class
    def emit_class(self):
        c = self.c; name = c['name']
        if c['kind'] == 'interface': return []
        ext = ''
        if c['sup']: ext = ' extends ' + c['sup']
        self.W('class %s%s {' % (name, ext))
        # methods
        for m in c['methods']:
            if m['body'] is None: continue
            self.curm = m['name']
            self.ctx = Ctx(c, m['static'], m['ret'])
            for t, n in m['params']: self.ctx.decl(n, t)
            sig = ', '.join(self.vname(n) for _, n in m['params'])
            self.W('%s%s(%s) {' % ('static ' if m['static'] else '', m['js'], sig), 1)
            self.body(m['body'], 1)
            self.W('}', 1)
        # constructor
        inst_fields = [f for f in c['fields'] if not f['static']]
        inst_inits = [b for k, b in c['inits'] if k == 'inst']
        if c['ctors'] or inst_fields or inst_inits:
            if len(c['ctors']) > 1: warn('%s: multiple constructors' % name)
            ctor = c['ctors'][0] if c['ctors'] else dict(params=[], body=('block', []), mods=set())
            self.curm = '<init>'
            self.ctx = Ctx(c, False)
            for t, n in ctor['params']: self.ctx.decl(n, t)
            sig = ', '.join(self.vname(n) for _, n in ctor['params'])
            self.W('constructor(%s) {' % sig, 1)
            stmts = ctor['body'][1]
            first_super = None
            if stmts and stmts[0][0] == 'expr' and stmts[0][1][0] == 'call' and stmts[0][1][1] is None and stmts[0][1][2] == 'super':
                first_super = stmts[0]; stmts = stmts[1:]
            if c['sup']:
                if first_super: self.W(self.ex(first_super[1])[0] + ';', 2)
                else: self.W('super();', 2)
            for f in inst_fields:
                if f['init'] is None: v = default_for(f['type'])
                elif f['init'][0] == 'arrinit': v = self.arrinit(f['init'])
                else: v = self.ex(f['init'])[0]
                self.W('this.%s = %s;' % (fieldjs(name, f['name']), v), 2)
            for b in inst_inits:
                self.W('{', 2); self.body(b, 2); self.W('}', 2)
            self.ctx.push()
            for x in stmts: self.stmt(x, 2)
            self.ctx.pop()
            self.W('}', 1)
        self.W('}')
        return self.out

    def emit_statics(self):
        c = self.c; name = c['name']
        out = []
        self.out = out
        self.curm = '<clinit>'
        self.ctx = Ctx(c, True)
        for f in c['fields']:
            if not f['static']: continue
            if f['init'] is None: v = default_for(f['type'])
            elif f['init'][0] == 'arrinit': v = self.arrinit(f['init'])
            else: v = self.ex(f['init'])[0]
            self.W('%s.%s = %s;' % (name, fieldjs(name, f['name']), v))
        for k, b in c['inits']:
            if k == 'static':
                self.W('{'); self.body(b, 0); self.W('}')
        return out

def main():
    srcdir, outdir = sys.argv[1], sys.argv[2]
    files = sys.argv[3:]
    units = {}
    allc = []
    for f in files:
        src = open(os.path.join(srcdir, f), encoding='utf-8').read().replace('\r', '')
        p = P(lex(src), f)
        cs = p.parse_unit()
        units[f] = cs; allc += cs
    build_table(allc)
    # dependency order by superclass
    order = []
    def visit(c):
        if c['name'] in [x['name'] for x in order]: return
        if c['sup'] in CLASSES: visit(CLASSES[c['sup']])
        order.append(c)
    for c in allc: visit(c)
    names = []
    for c in order:
        if c['kind'] == 'interface': continue
        em = Emitter(c); em.out = []
        code = em.emit_class()
        em2 = Emitter(c)
        st = em2.emit_statics()
        body = '\n'.join(code) + '\n\n%s.$clinit = function () {\n%s\n};\n' % (c['name'], '\n'.join('  ' + l for l in st))
        open(os.path.join(outdir, c['name'] + '.js'), 'w').write(body)
        names.append(c['name'])
    open(os.path.join(outdir, '_order.json'), 'w').write(json.dumps(names))
    sys.stderr.write('\n'.join(sorted(set(WARN))) + '\n')
    sys.stderr.write('%d warnings\n' % len(set(WARN)))

if __name__ == '__main__':
    main()
