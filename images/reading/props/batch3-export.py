"""Export T005's built-in generated masters; authorized crop/resize/palette finishing.

Original PNGs stay at the recorded generated_images paths. No artwork is drawn here.
Run: python images/reading/props/batch3-export.py
"""
from pathlib import Path
import hashlib
import json
import math
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
BG = np.array([179., 169., 148.])
INK = np.array([30., 27., 23.])
ACCENTS = {'sea-sun': [201,130,106], 'tahiti-hut': [200,164,106],
           'sun-desert': [227,211,166], 'study-objects': [184,67,47]}
NIGHT = {'night-clouds', 'moon-night'}


def background_surface(a, name):
    """Fit background drift from the nominally empty exterior, rejecting ink outliers."""
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h:12, 0:w:12]
    x, y = xx / max(1,w-1), yy / max(1,h-1)
    safe = (x < .06) | (x > .94) | (y < .06) | (y > .94)
    if name.startswith('foreground-'): safe &= y < .85
    if name == 'dusk-mountain': safe &= x < .85
    if name == 'dawn-mountain': safe &= x > .15
    q = a[yy[safe], xx[safe]].astype(float)
    xs, ys = x[safe], y[safe]
    X = np.stack([np.ones_like(xs), xs, ys, xs*ys, xs*xs, ys*ys],axis=1)
    keep = np.max(np.abs(q-np.median(q,axis=0)),axis=1) < 12
    for _ in range(4):
        coef = np.linalg.lstsq(X[keep],q[keep],rcond=None)[0]
        err = np.max(np.abs(q-X@coef),axis=1)
        keep = err < max(2.,float(np.median(err[keep]))*3)
    yf, xf = np.mgrid[:h,:w].astype(np.float32)
    xf /= max(1,w-1); yf /= max(1,h-1)
    return (coef[0] + xf[:,:,None]*coef[1] + yf[:,:,None]*coef[2] +
            (xf*yf)[:,:,None]*coef[3] + (xf*xf)[:,:,None]*coef[4] + (yf*yf)[:,:,None]*coef[5])


def palette(a, name):
    if name in NIGHT:
        white = np.array([230.,220.,196.])
        alpha = np.clip((a@white)/(white@white),0,1)
        alpha[alpha < .008] = 0
        return alpha[:,:,None]*white, alpha
    surface = background_surface(a,name)
    delta = a-surface
    v = INK-BG
    if name in ACCENTS:
        c = np.array(ACCENTS[name],dtype=float)-BG
        A = np.stack([v,c],axis=1)
        ab = delta@np.linalg.pinv(A).T
        # Nonnegative projection onto the allowed paper/ink/accent triangle.
        ai = np.maximum(ab[:,:,0],0); ac = np.maximum(ab[:,:,1],0)
        ac = np.where(ab[:,:,0] < 0, np.maximum((delta@c)/(c@c),0),ac)
        ai = np.where(ab[:,:,1] < 0, np.maximum((delta@v)/(v@v),0),ai)
        total = np.maximum(1.,ai+ac); ai/=total; ac/=total
        ai[ai < .014]=0; ac[ac < .018]=0
        return BG + ai[:,:,None]*v + ac[:,:,None]*c, np.maximum(ai,ac)
    alpha = np.clip((delta@v)/(v@v),0,1)
    alpha[alpha < .014]=0
    cap = .3 if name=='far-ridge-loess' else .35 if name.startswith('far-ridge-') or name=='cloud-sea' else .2 if name=='mist-band' else .12 if name=='moon-pale' else 1.
    alpha=np.minimum(alpha,cap)
    return BG+alpha[:,:,None]*v, alpha


def export(rec):
    name=rec['name']; size=tuple(rec['size'])
    source=Image.open(rec['source']).convert('RGB')
    a=np.asarray(source,dtype=np.float32)
    if name=='brocade-tile':
        out=source.resize(size,Image.Resampling.LANCZOS)
        bbox=[0,0,*source.size]; base=None
    else:
        corrected, coverage=palette(a,name)
        corrected=np.rint(np.clip(corrected,0,255)).astype('uint8')
        yy,xx=np.where(coverage > (.015 if name=='moon-pale' else .022))
        if not len(xx): raise ValueError(f'{name}: no visible artwork')
        bbox=[max(0,int(xx.min())-3),max(0,int(yy.min())-3),min(source.width,int(xx.max())+4),min(source.height,int(yy.max())+4)]
        image=Image.fromarray(corrected)
        base=(0,0,0) if name in NIGHT else (179,169,148)
        out=Image.new('RGB',size,base)
        if name in {'moon-night','moon-pale','sun-desert'}:
            image.thumbnail(size,Image.Resampling.LANCZOS)
            out.paste(image,((size[0]-image.width)//2,(size[1]-image.height)//2))
        else:
            art=image.crop(bbox)
            maxw=math.floor(size[0]*.74); maxh=math.floor(size[1]*.74)
            if name.startswith('foreground-'): maxh=math.floor(size[1]*.86)
            if name in {'dusk-mountain','dawn-mountain'}: maxw=math.floor(size[0]*.87)
            factor=min(maxw/art.width,maxh/art.height)
            art=art.resize((max(1,round(art.width*factor)),max(1,round(art.height*factor))),Image.Resampling.LANCZOS)
            x=(size[0]-art.width)//2; y=(size[1]-art.height)//2
            if name.startswith('foreground-'): y=size[1]-art.height
            if name=='dusk-mountain': x=size[0]-art.width
            if name=='dawn-mountain': x=0
            out.paste(art,(x,y))
        # Exact flat empty borders; respect dedicated touching-edge exceptions.
        arr=np.asarray(out).copy(); h,w=arr.shape[:2]
        # Resampling can overshoot a capped wash; enforce its final-pixel ink limit.
        if name.startswith('far-ridge-') or name in {'cloud-sea','mist-band','moon-pale'}:
            cap=.3 if name=='far-ridge-loess' else .2 if name=='mist-band' else .12 if name=='moon-pale' else .35
            v=INK-BG
            opacity=np.clip(((arr.astype(float)-BG)@v)/(v@v),0,cap)
            arr=np.rint(BG+opacity[:,:,None]*v).astype('uint8')
        bx=math.ceil(w*.12); by=math.ceil(h*.12)
        if name!='dawn-mountain': arr[:,:bx]=base
        if name!='dusk-mountain': arr[:,-bx:]=base
        arr[:by]=base
        if not name.startswith('foreground-'): arr[-by:]=base
        out=Image.fromarray(arr)
    target=ROOT/(name+'.webp')
    if target.exists() and name not in EXPECTED: raise ValueError('refuse to overwrite an existing asset')
    # Lossless preserves the exact background; quality controls lossless encoder effort.
    out.save(target,'WEBP',lossless=True,quality=90,method=6)
    decoded=Image.open(target); b=np.asarray(decoded)
    checks={'size':list(decoded.size),'rgb':decoded.mode=='RGB','opaque':decoded.mode=='RGB','nonempty':bool(np.ptp(b.astype(float),axis=(0,1)).max()>1)}
    if base is not None:
        h,w=b.shape[:2];bx=math.ceil(w*.12);by=math.ceil(h*.12)
        checks['borders']={}
        for edge,region in [('left',b[:,:bx]),('right',b[:,-bx:]),('top',b[:by]),('bottom',b[-by:])]:
            exempt=(edge=='bottom' and name.startswith('foreground-')) or (edge=='right' and name=='dusk-mountain') or (edge=='left' and name=='dawn-mountain')
            checks['borders'][edge]='dedicated edge exception' if exempt else bool(np.all(region==base))
    assert tuple(checks['size'])==size and checks['nonempty'] and checks['rgb']
    assert all(v is not False for v in checks.get('borders',{}).values())
    return {'name':name,'sourceSize':list(source.size),'sourceCrop':bbox,'size':list(size),
            'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'checks':checks}


if __name__=='__main__':
    data=json.loads((ROOT/'batch3-prompts.json').read_text(encoding='utf-8'))
    EXPECTED={r['name'] for r in data['records']}
    assert len(EXPECTED)==30
    selected=set(sys.argv[1:])
    previous={r['name']:r for r in json.loads((ROOT/'batch3-checks.json').read_text(encoding='utf-8'))['assets']} if selected else {}
    assert selected <= EXPECTED
    report=[]
    for r in data['records']:
        report.append(export(r) if not selected or r['name'] in selected else previous[r['name']])
        print(r['name'],report[-1]['bytes'],flush=True)
    (ROOT/'batch3-checks.json').write_text(json.dumps({'agent':'codex','task':'T005','mode':'built-in imagegen plus authorized crop/resize/palette export','encoding':'lossless WebP','assets':report},indent=2)+'\n',encoding='utf-8')
    # Review at intended on-scroll scale (export dimensions /5), and larger contact sheet.
    for mode in ['contact','actual-size']:
        cw,ch=(460,330) if mode=='contact' else (940,510)
        cols=4 if mode=='contact' else 2;rows=math.ceil(len(report)/cols)
        sheet=Image.new('RGB',(cw*cols,ch*rows),(235,232,224));draw=ImageDraw.Draw(sheet)
        for i,r in enumerate(report):
            im=Image.open(ROOT/(r['name']+'.webp')).convert('RGB')
            bounds=(cw-24,ch-45) if mode=='contact' else (r['size'][0]//5,r['size'][1]//5)
            im.thumbnail(bounds,Image.Resampling.LANCZOS)
            x=(i%cols)*cw+(cw-im.width)//2;y=(i//cols)*ch+32+(ch-45-im.height)//2
            sheet.paste(im,(x,y));draw.text(((i%cols)*cw+12,(i//cols)*ch+10),r['name'],fill=(35,30,25))
        sheet.save(ROOT/f'batch3-{mode}.jpg',quality=92)
    tile=Image.open(ROOT/'brocade-tile.webp');repeat=Image.new('RGB',(tile.width*3,tile.height*3))
    for y in range(3):
        for x in range(3):repeat.paste(tile,(x*tile.width,y*tile.height))
    repeat.save(ROOT/'batch3-brocade-repeat.jpg',quality=95)
    print('30 exports checked; bytes',sum(r['bytes'] for r in report))
