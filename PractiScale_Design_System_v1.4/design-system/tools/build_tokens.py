"""Generate CSS from the single canonical Edition 1.4 token source."""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1]
def generate(t):
    out=['/* GENERATED from tokens.json / Edition '+t['edition']+'. Run python tools/build_tokens.py. */',
         '/* Identity is fixed. Type sizes and layout values are adaptable defaults. No website layout is approved. */']
    for theme,key,alias in [('deep-teal','deep_teal','night'),('fog','fog','day')]:
        selector=(':root, ' if theme=='deep-teal' else '')+f'[data-theme="{theme}"], [data-theme="{alias}"]'
        props={'color-scheme':'dark' if theme=='deep-teal' else 'light'}
        props.update({'--'+k:v for k,v in t[key].items()})
        props.update({'--primary-border':t['primary']['dark_border'] if theme=='deep-teal' else t['primary']['light_border'],
                      '--disabled-bg':t['primary']['dark_disabled_bg'] if theme=='deep-teal' else t['primary']['light_disabled_bg'],
                      '--disabled-text':t[key]['text-muted'],
                      '--harbor':t['official']['Harbor'],'--on-harbor':t['official']['White'],
                      '--proof':t['official']['Proof Amber'],'--on-proof':t['official']['Deep Teal']})
        out.append(selector+' {');out.extend('  '+k+': '+v+';' for k,v in props.items());out.append('}')
    props={}
    for name,pair in t['primary']['states'].items():
        stem='--primary-' if name=='default' else '--primary-'+name+'-'
        props[stem+'start']=pair[0];props[stem+'end']=pair[1]
    props['--on-primary']=t['primary']['label'];props['--radius-primary']=str(t['primary']['radius_px'])+'px'
    for k,v in t['typography']['families'].items():props['--font-'+k]=v
    for k,v in t['defaults']['spacing_px'].items():props['--'+k]=str(v)+'px'
    for k,v in t['defaults']['radii_px'].items():props['--'+k]=str(v)+'px'
    for k,v in t['defaults']['duration_ms'].items():props['--'+k]=str(v)+'ms'
    for k,v in t['defaults']['easing'].items():props['--'+k]=v
    for k,v in t['ramps'].items():props['--'+k]=v
    out+=[':root {']+['  '+k+': '+v+';' for k,v in props.items()]+['}']
    family={'Sora':'display','Manrope':'sans','JetBrains Mono':'mono','Noto Nastaliq Urdu':'urdu'}
    def track(s):return ('0' if s=='0' else str(float(s.strip('%'))/100).rstrip('0').rstrip('.')+'em')
    out.append('/* Default type scale. Preserve roles; adapt sizes to the selected design. */')
    for row in t['typography']['default_scale']:
        size,line=[int(x.strip()) for x in row['desktop_size_line_px'].split('/')]
        extra=(' text-transform: uppercase;' if row['style']=='overline' else '')+(' font-variant-numeric: tabular-nums;' if row['style']=='data' else '')
        out.append('.'+row['style']+' { '+f'font-family: var(--font-{family[row["family"]]}); font-size: {size}px; line-height: {line}px; font-weight: {row["weight"]}; letter-spacing: {track(row["tracking"])};'+extra+' }')
    out.append('@media (max-width: '+str(t['defaults']['mobile_type_max_width_px'])+'px) {')
    for row in t['typography']['default_scale']:
        size,line=[int(x.strip()) for x in row['mobile_size_line_px'].split('/')]
        out.append('  .'+row['style']+' { '+f'font-size: {size}px; line-height: {line}px;'+' }')
    out.append('}')
    return '\n\n'.join(out)+'\n'
if __name__=='__main__':
    t=json.loads((ROOT/'tokens.json').read_text(encoding='utf-8'))
    (ROOT/'tokens.css').write_text(generate(t),encoding='utf-8')
    print('Generated tokens.css from tokens.json')
