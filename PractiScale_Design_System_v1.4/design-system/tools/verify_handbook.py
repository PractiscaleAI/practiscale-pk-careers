"""Render every handbook page and check exported structure, text, fonts, and bounds."""
from pathlib import Path
import json,hashlib,argparse,re,math,collections
from pypdf import PdfReader
import pypdfium2 as pdfium
import pdfplumber
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1];PACKAGE=ROOT.parent
def verify(render_dir):
    render_dir.mkdir(parents=True,exist_ok=True)
    pdf=PACKAGE/'PractiScale_Design_System_Complete.pdf';reader=PdfReader(pdf,strict=True);doc=pdfium.PdfDocument(pdf)
    mapping=json.loads((ROOT/'verification/handbook-source-map.json').read_text(encoding='utf-8'))
    requested=json.loads((ROOT/'verification/requested-files.json').read_text(encoding='utf-8'))
    text=[p.extract_text() for p in reader.pages];fonts={};outside=[]
    for p in reader.pages:
        for f in p['/Resources'].get('/Font',{}).values():
            f=f.get_object();fd=f.get('/FontDescriptor');fd=fd.get_object() if fd else {}
            fonts[str(f.get('/BaseFont'))]=any(k in fd for k in ['/FontFile','/FontFile2','/FontFile3'])
        for im in p.images:im.image.load()
    with pdfplumber.open(pdf) as pl:
        for i,p in enumerate(pl.pages,1):
            for ch in p.chars:
                if ch['text'].strip() and (ch['x0']<50 or ch['x1']>910 or ch['top']<12 or ch['bottom']>666):outside.append({'page':i,'text':ch['text'],'bbox':[ch['x0'],ch['top'],ch['x1'],ch['bottom']]})
    assert all(fonts.values()),fonts
    assert not outside,outside[:15]
    assert not reader.is_encrypted
    assert all(tuple(float(x) for x in p.mediabox)==(0,0,960,680) for p in reader.pages)
    assert '\ufffd' not in ''.join(text) and '\x00' not in ''.join(text)
    blank_pages=[]
    for pn,txt in enumerate(text,1):
        body=[ln for ln in txt.splitlines() if ln.strip() and not ln.startswith(('PRACTISCALE /','EDITION 1.4 /')) and not re.fullmatch(r'\d+',ln.strip())]
        if not body:blank_pages.append(pn)
    assert not blank_pages,('Unexpected blank pages',blank_pages)
    assert all(n in mapping['included_files'] for n in requested)
    for name,pn in mapping['file_start_pages'].items():assert name in text[pn-1],name
    contents=reader.pages[1]['/Annots']
    assert len(contents)==len(mapping['included_files'])
    for a,name in zip(contents,mapping['included_files']):
        assert a.get_object()['/Dest'][0]==reader.pages[mapping['file_start_pages'][name]-1].indirect_reference,name
    for name,digest in mapping['source_sha256'].items():assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest,name
    # Check source listings as whitespace-independent streams after visual line wrapping.
    code_coverage={};files=mapping['included_files']
    for name in [n for n in files if n.endswith(('.css','.json'))]:
        lo=mapping['file_start_pages'][name]-1;idx=files.index(name);hi=mapping['file_start_pages'][files[idx+1]]-1 if idx+1<len(files) else len(text)
        joined=''.join(text[lo:hi]);clean=re.sub(r'\s+','',joined);raw=re.sub(r'\s+','',(ROOT/name).read_text(encoding='utf-8'))
        # Repeated running headers/page numbers interrupt streams at page breaks.
        source_lines=[re.sub(r'\s+','',ln) for ln in (ROOT/name).read_text(encoding='utf-8').splitlines() if ln.strip()]
        # Long CSS lines wrap, but all their tokens must appear in the correct source section.
        pattern=r'#[0-9A-Fa-f]{6}|--[\w-]+|[A-Za-z_][A-Za-z0-9_-]*|\d+(?:\.\d+)?'
        expected=collections.Counter(re.findall(pattern,(ROOT/name).read_text(encoding='utf-8')))
        actual=collections.Counter(re.findall(pattern,joined))
        missing={tok:n-actual[tok] for tok,n in expected.items() if actual[tok]<n}
        assert not missing,(name,missing)
        code_coverage[name]={'pages':[lo+1,hi],'source_nonempty_lines':len(source_lines),'missing_source_tokens':missing}
    for i in range(len(doc)):
        path=render_dir/f'page-{i+1:03}.png';doc[i].render(scale=2.5).to_pil().convert('RGB').save(path)
        print('Rendered',i+1,flush=True)
    sheet=Image.new('RGB',(2560,math.ceil(len(doc)/4)*480),'#DEE7E7');d=ImageDraw.Draw(sheet)
    for i in range(len(doc)):
        im=Image.open(render_dir/f'page-{i+1:03}.png');im.thumbnail((610,433));x=i%4*640+15;y=i//4*480+12;sheet.paste(im,(x,y));d.text((x,y+440),f'Page {i+1:02}',fill='#134143')
    sheet.save(PACKAGE/'PractiScale_Design_System_Contact_Sheet.png')
    for start in range(0,len(doc),6):
        s=Image.new('RGB',(1920,2148),'#DEE7E7');d=ImageDraw.Draw(s)
        for i in range(start,min(start+6,len(doc))):
            im=Image.open(render_dir/f'page-{i+1:03}.png');im.thumbnail((920,652));x=(i-start)%2*960+20;y=(i-start)//2*716+12;s.paste(im,(x,y));d.text((x,y+661),f'Page {i+1:02}',fill='#134143')
        s.save(render_dir/f'contact-{start//6+1:02}.jpg',quality=94)
    result={'pages':len(doc),'dimensions':[960,680],'every_page_rendered':True,'resolution':'180dpi / 2400 x 1700px','fonts_embedded':fonts,'outside_page_characters':outside,'unexpected_blank_pages':blank_pages,'null_or_replacement_characters':0,'all_18_requested_files_included':True,'source_hashes_match':True,'code_listing_coverage':code_coverage,'encrypted':False,'pdf_sha256':hashlib.sha256(pdf.read_bytes()).hexdigest(),'visual_review':'Pending inspection of all rendered pages.'}
    (ROOT/'verification/pdf-checks.json').write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result,indent=2))
if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--render-dir',type=Path,default=ROOT/'verification/renders');args=ap.parse_args();verify(args.render_dir)
