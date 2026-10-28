#!/usr/bin/env python3
"""Injects extra files (e.g. the generated coin sprites) into assets.js without needing the original assets/ folder.

Usage:  python3 tools/add_assets.py <dir> [assets.js]
Every file below <dir> is added under its relative path (images/ui/coin_sheet.png, ...). Re-running replaces them.
"""
import base64, json, os, sys

src_dir = sys.argv[1]
target = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets.js')
txt = open(target, encoding='utf-8').read()
head = 'window.__ASSETS='
assert txt.startswith(head), 'unexpected assets.js format'
data = json.loads(txt[len(head):txt.rindex(';')])
added = 0
for root, _, files in os.walk(src_dir):
    for f in files:
        p = os.path.join(root, f)
        rel = os.path.relpath(p, src_dir).replace(os.sep, '/')
        data[rel] = base64.b64encode(open(p, 'rb').read()).decode()
        added += 1
        print('  +', rel)
with open(target, 'w', encoding='utf-8') as fh:
    fh.write(head + json.dumps(data, separators=(',', ':')) + ';\n')
print('assets.js now has', len(data), 'entries (%d added/replaced)' % added)
