"""Preflight before PDF generation. No third-party packages required."""
from pathlib import Path
import json,re,hashlib,struct,zlib
from build_tokens import generate
ROOT=Path(__file__).resolve().parents[1]
def lum(h):
    vals=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    vals=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in vals]
    return sum(a*b for a,b in zip(vals,[.2126,.7152,.0722]))
def ratio(a,b):
    x,y=sorted([lum(a),lum(b)]);return (y+.05)/(x+.05)
def interp(a,b,t):return '#'+''.join(f'{round(int(a[i:i+2],16)*(1-t)+int(b[i:i+2],16)*t):02X}' for i in (1,3,5))
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def check():
    result={'edition':'1.4','stage':'pre-render source validation','checks':[]};checks=result['checks']
    def require(name,ok,detail=''):
        checks.append({'check':name,'passed':bool(ok),'detail':detail});assert ok,name+': '+detail
    requested=json.loads((ROOT/'verification/requested-files.json').read_text(encoding='utf-8'))
    require('All 18 requested paths updated',len(requested)==18 and all((ROOT/f).is_file() for f in requested))
    t=json.loads((ROOT/'tokens.json').read_text(encoding='utf-8'))
    require('Current edition and layout status',t['edition']=='1.4' and t['governance']['website_layout_status']=='pending_user_selection')
    require('Exact generated CSS parity',(ROOT/'tokens.css').read_text(encoding='utf-8')==generate(t))
    official={'Deep Teal':'#134143','Growth Teal':'#20BFA8','Bridge Blue':'#0D77A9','Harbor':'#2C526E','Fog':'#F3F6F6','White':'#FFFFFF','Proof Amber':'#F5B041'}
    require('Official palette unchanged',t['official']==official)
    require('Same primary gradient on all themes',t['primary']['states']['default']==['#0F8272','#0B6B98'] and t['primary']['label']=='#FFFFFF')
    css='\n'.join((ROOT/n).read_text(encoding='utf-8') for n in ['tokens.css','components.css','fonts.css','components/bundle.css'])
    defs=set(re.findall(r'(--[\w-]+)\s*:',css));uses=set(re.findall(r'var\((--[\w-]+)',css))
    require('Every CSS variable reference resolves',not (uses-defs-{'--logo-width','--logo-size'}),str(sorted(uses-defs-{'--logo-width','--logo-size'})))
    require('Retired flat-button variables removed',not any(re.search(r'--'+n+r'\s*:',css) for n in ['accent','on-accent','accent-hover','danger','glow-accent']))
    require('Reduced motion cancels press transform','transform: none' in css and 'prefers-reduced-motion' in css)
    require('Disabled controls retain explicit labels','opacity: 1' in css and 'background: var(--disabled-bg)' in css and 'pointer-events: none' not in css)
    allmd=list(ROOT.glob('*.md'))+list((ROOT/'components').glob('*.md'));broken=[]
    for p in allmd:
        for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)',p.read_text(encoding='utf-8')):
            if re.match(r'https?://|#|mailto:',target):continue
            resolved=p.parent/target.split('#')[0]
            if not resolved.exists() and resolved!=ROOT/'verification/preflight.json':broken.append(str(p.relative_to(ROOT))+' -> '+target)
    require('All internal Markdown links resolve',not broken,str(broken))
    missing=[]
    for p in [ROOT/'fonts.css',ROOT/'components/bundle.css']:
        for target in re.findall(r'url\("([^"]+)"\)',p.read_text(encoding='utf-8')):
            if not (p.parent/target).exists():missing.append(target)
    require('Local CSS and font assets resolve',not missing,str(missing))
    require('Four font families and readable body floor',len(t['typography']['roles'])==4 and t['typography']['mobile_paragraph_min_px']==16 and len(t['typography']['default_scale'])==16)
    fonts=list((ROOT/'assets/fonts').glob('*.ttf'))
    require('Nine real font resources bundled',len(fonts)==9 and all(p.read_bytes()[:4] in [b'\x00\x01\x00\x00',b'OTTO'] for p in fonts))
    require('Font license texts bundled',len(list((ROOT/'assets/fonts').glob('*OFL*')))+len(list((ROOT/'assets/fonts').glob('*license*')))>=4)
    assets=json.loads((ROOT/'verification/expected-asset-sha256.json').read_text(encoding='utf-8'))
    require('Approved logo file bytes preserved',all(sha(ROOT/p)==expected for p,expected in assets.items()))
    active='\n'.join(p.read_text(encoding='utf-8') for p in allmd if p.name not in ['08-3d-experience.md','10-applications.md','MIGRATION.md','12-changelog.md'])+'\n'+css+'\n'+json.dumps(t)
    forbidden=['#070d10','three.js','The Build','glow-accent','70/15/8/5/2','up to three Fog','No gradients on buttons','40% opacity','3D hero','MeshPhysicalMaterial']
    hits=[s for s in forbidden if s.lower() in active.lower()]
    require('No obsolete active rules',not hits,str(hits))
    require('Both retired paths are notices',all('**Status: retired;' in (ROOT/f).read_text(encoding='utf-8') for f in ['08-3d-experience.md','10-applications.md']))
    pairs=[]
    for key in ['deep_teal','fog']:
        for role in ['text','text-muted','accent-text','link']:
            for bg in ['bg','surface','surface-2']:
                fg=t[key]['link-raised'] if role=='link' and bg=='surface-2' else t[key][role]
                pairs.append({'theme':key,'role':role,'fg':fg,'bg':t[key][bg],'ratio':ratio(fg,t[key][bg])})
    require('24 semantic text pairs meet 4.5:1',len(pairs)==24 and all(p['ratio']>=4.5 for p in pairs))
    gradients=[]
    for state,(a,b) in t['primary']['states'].items():
        vals=[ratio('#FFFFFF',interp(a,b,i/1000)) for i in range(1001)]
        gradients.append({'state':state,'samples':1001,'minimum':min(vals),'passed':min(vals)>=4.5})
    require('All active gradients pass sampled contrast',all(p['passed'] for p in gradients))
    boundaries=[]
    for key in ['deep_teal','fog']:
        for role in ['line-strong','focus']:
            for bg in ['bg','surface','surface-2']:boundaries.append(ratio(t[key][role],t[key][bg]))
    require('Strong boundaries and focus pass 3:1',min(boundaries)>=3)
    audit=json.loads((ROOT/'verification/original-file-audit.json').read_text(encoding='utf-8'))
    require('Every requested source changed',all(sha(ROOT/r['file'])!=r['original_sha256'] for r in audit))
    result.update(passed=True,text_pairs=pairs,gradients=gradients,minimum_boundary_ratio=min(boundaries),source_sha256={str(p.relative_to(ROOT)).replace('\\','/'):sha(p) for p in [*allmd,ROOT/'tokens.json',ROOT/'tokens.css',ROOT/'components.css',ROOT/'fonts.css',ROOT/'components/bundle.css']})
    (ROOT/'verification/preflight.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print('SOURCE PREFLIGHT PASSED:',len(checks),'checks')
if __name__=='__main__':check()
