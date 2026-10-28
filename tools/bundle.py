import os, base64, json, io
from fontTools import subset
from fontTools.ttLib import TTFont
SRC='/home/claude/up/assets'
out={}
for root,_,fs in os.walk(SRC):
    for f in fs:
        p=os.path.join(root,f); rel=os.path.relpath(p,SRC).replace(os.sep,'/')
        if f.endswith('.py') or rel.startswith('bonus/src/') or rel=='bonus/README.txt' or rel.startswith('models/x/'): continue
        out[rel]=base64.b64encode(open(p,'rb').read()).decode()
# subset fonts
uni=list(range(0x20,0x250))+list(range(0x370,0x400))+list(range(0x400,0x530))+list(range(0x2000,0x2070))+[0x20AC,0x2190,0x2191,0x2192,0x2193,0x2122]
for name,src in (('mono.woff','DejaVuSansMono.ttf'),('mono-bold.woff','DejaVuSansMono-Bold.ttf')):
    opt=subset.Options(); opt.flavor='woff'; opt.layout_features=['kern']
    font=TTFont('/usr/share/fonts/truetype/dejavu/'+src)
    s=subset.Subsetter(opt); s.populate(unicodes=uni); s.subset(font)
    b=io.BytesIO(); font.flavor='woff'; font.save(b)
    out['fonts/'+name]=base64.b64encode(b.getvalue()).decode()
with open('site/assets.js','w') as f:
    f.write('window.__ASSETS='+json.dumps(out,separators=(',',':'))+';\n')
print(len(out), os.path.getsize('site/assets.js'))
