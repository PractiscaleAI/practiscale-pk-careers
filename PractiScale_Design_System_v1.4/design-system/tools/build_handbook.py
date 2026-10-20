"""Consolidate every requested file, gated on successful source/browser preflight."""
from pathlib import Path
import json,re,html,hashlib,math
from reportlab.pdfgen import canvas
from reportlab.platypus import BaseDocTemplate,PageTemplate,Frame,Paragraph,Spacer,PageBreak,Table,TableStyle,Preformatted,Flowable,Image
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT=Path(__file__).resolve().parents[1];PACKAGE=ROOT.parent
FILES=['README.md','00-read-first.md']+[f'{i:02}-{s}.md' for i,s in enumerate(['brand-essence','brand-story','voice-and-tone','logo','color','typography','imagery-and-iconography','3d-experience','layout-and-interface','applications','sources','changelog'],1)]+['components/Button.md','components/Logo.md','MIGRATION.md','tokens.json','tokens.css','components.css','fonts.css','components/bundle.css']
W,H=960,680;M=54;CW=W-2*M
INK=HexColor('#134143');MUTED=HexColor('#46565B');FOG=HexColor('#F3F6F6');LINE=HexColor('#CFD8DA')
def fonts():
    for name,file in [('Manrope','Manrope400.ttf'),('Manrope-Bold','Manrope700.ttf'),('Sora','Sora600.ttf'),('Mono','Mono400.ttf')]:pdfmetrics.registerFont(TTFont(name,str(ROOT/'assets/fonts'/file)))
    pdfmetrics.registerFontFamily('Manrope',normal='Manrope',bold='Manrope-Bold',italic='Manrope',boldItalic='Manrope-Bold')
    pdfmetrics.registerFontFamily('Mono',normal='Mono',bold='Mono',italic='Mono',boldItalic='Mono')

styles={}
def setup_styles():
    styles['body']=ParagraphStyle('body',fontName='Manrope',fontSize=11,leading=16.8,textColor=INK,spaceAfter=9)
    styles['h1']=ParagraphStyle('h1',fontName='Sora',fontSize=25,leading=32,textColor=INK,spaceAfter=17,keepWithNext=True)
    styles['h2']=ParagraphStyle('h2',fontName='Sora',fontSize=17,leading=24,textColor=INK,spaceBefore=13,spaceAfter=9,keepWithNext=True)
    styles['h3']=ParagraphStyle('h3',fontName='Manrope-Bold',fontSize=12.5,leading=18,textColor=INK,spaceBefore=8,spaceAfter=6,keepWithNext=True)
    styles['mono']=ParagraphStyle('mono',fontName='Mono',fontSize=9,leading=12.5,textColor=INK,spaceAfter=12)
    styles['overline']=ParagraphStyle('overline',fontName='Mono',fontSize=9,leading=13,textColor=MUTED,spaceAfter=9)
    styles['cell']=ParagraphStyle('cell',fontName='Manrope',fontSize=9.4,leading=14,textColor=INK)
    styles['headcell']=ParagraphStyle('headcell',parent=styles['cell'],fontName='Manrope-Bold')
    styles['quote']=ParagraphStyle('quote',parent=styles['body'],leftIndent=14,borderPadding=10,backColor=HexColor('#E6ECEC'))

def inline(s,source):
    s=html.escape(s,quote=False)
    def link(m):
        label,target=m.groups()
        if target.startswith('https://') or target.startswith('http://'):return '<a color="#0A6390" href="'+html.escape(html.unescape(target),quote=True)+'">'+label+'</a>'
        try:
            resolved=str((ROOT/source).parent.joinpath(html.unescape(target).split('#')[0]).resolve().relative_to(ROOT.resolve())).replace('\\','/')
        except ValueError:return label
        if resolved in FILES:return '<a color="#0A6390" href="#file_'+str(FILES.index(resolved))+'">'+label+'</a>'
        return label+' <font name="Mono">('+target+')</font>'
    s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',link,s)
    s=re.sub(r'`([^`]+)`',r'<font name="Mono">\1</font>',s)
    s=re.sub(r'\*\*([^*]+)\*\*',r'<b>\1</b>',s)
    s=re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)',r'<i>\1</i>',s)
    return s

def md_table(lines,source):
    rows=[[s.strip() for s in ln.strip().strip('|').split('|')] for ln in lines]
    rows=[r for r in rows if not all(re.fullmatch(r':?-+:?',x.replace(' ','')) for x in r)]
    n=len(rows[0]); widths=[1/n]*n
    labels=' '.join(rows[0]).lower()
    if n==7:widths=[.13,.17,.14,.14,.08,.09,.25]
    elif n==4:
        widths=[.24,.28,.28,.20]
        if 'what it means' in labels:widths=[.18,.26,.30,.26]
        elif 'ratio' in labels:widths=[.38,.21,.21,.20]
    elif n==3:widths=[.22,.36,.42]
    elif n==2:widths=[.30,.70]
    data=[[Paragraph(inline(v,source),styles['headcell'] if i==0 else styles['cell']) for v in r] for i,r in enumerate(rows)]
    tab=Table(data,colWidths=[CW*v for v in widths],repeatRows=1,hAlign='LEFT')
    tab.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),'Manrope'),('BACKGROUND',(0,0),(-1,0),HexColor('#E6ECEC')),('ROWBACKGROUNDS',(0,1),(-1,-1),[HexColor('#FFFFFF'),FOG]),('LINEBELOW',(0,0),(-1,-1),.45,LINE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),9),('RIGHTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    return [tab,Spacer(1,12)]

def code(s):
    compact='\n'.join(ln for ln in s.splitlines() if ln.strip())
    return Preformatted(compact,styles['mono'],dedent=0,maxLineLength=153,splitChars=' ',newLineChars='  ')

def markdown(s,source):
    lines=s.splitlines();out=[];i=0
    while i<len(lines):
        ln=lines[i]
        if not ln.strip():i+=1;continue
        if ln.startswith('```'):
            i+=1;chunk=[]
            while i<len(lines) and not lines[i].startswith('```'):chunk.append(lines[i]);i+=1
            out+=[code('\n'.join(chunk))];i+=1;continue
        if ln.startswith('|'):
            chunk=[]
            while i<len(lines) and lines[i].startswith('|'):chunk.append(lines[i]);i+=1
            out+=md_table(chunk,source);continue
        m=re.match(r'^(#{1,3})\s+(.*)',ln)
        if m:out.append(Paragraph(inline(m[2],source),styles['h'+str(len(m[1]))]));i+=1;continue
        if ln.startswith('> '):out.append(Paragraph(inline(ln[2:],source),styles['quote']));i+=1;continue
        if re.match(r'^(- |\d+\. )',ln):out.append(Paragraph(inline(ln,source),styles['body']));i+=1;continue
        chunk=[]
        while i<len(lines) and lines[i].strip() and not re.match(r'^(#{1,3} |\||```|> |- |\d+\. )',lines[i]):chunk.append(lines[i]);i+=1
        out.append(Paragraph('<br/>'.join(inline(x,source) for x in chunk),styles['body']))
    return out

class Marker(Flowable):
    def __init__(self,label,bookmark=None):Flowable.__init__(self);self.label=label;self.bookmark=bookmark
    def wrap(self,*args):return (0,0)
    def draw(self):pass

class Doc(BaseDocTemplate):
    def __init__(self,path):
        super().__init__(str(path),pagesize=(W,H),leftMargin=M,rightMargin=M,topMargin=66,bottomMargin=52,title='PractiScale Design System - Complete Files - Edition 1.4',author='PractiScale',pageCompression=1,initialFontName='Manrope')
        self.current='';self.index={}
        self.addPageTemplates(PageTemplate(id='main',frames=[Frame(M,52,CW,H-118,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)],onPage=self.background,onPageEnd=self.footer))
    def background(self,c,doc):
        c.saveState();c.setFillColor(INK if doc.page==1 else FOG);c.rect(0,0,W,H,fill=1,stroke=0);c.restoreState()
    def footer(self,c,doc):
        c.saveState();c.setFillColor(HexColor('#BDD3D3') if doc.page==1 else MUTED);c.setFont('Mono',8.4)
        if doc.page>1:c.drawString(M,H-31,'PRACTISCALE / '+self.current)
        c.drawString(M,26,'EDITION 1.4 / FIXED BRAND RULES / WEBSITE LAYOUTS PENDING');c.drawRightString(W-M,26,str(doc.page).zfill(2));c.restoreState()
    def afterFlowable(self,f):
        if isinstance(f,Marker):
            self.current=f.label
            if f.bookmark:
                self.canv.bookmarkPage(f.bookmark);self.canv.addOutlineEntry(f.label,f.bookmark,0,False);self.index[f.label]=self.page

class Cover(Flowable):
    def wrap(self,*args):return CW,540
    def draw(self):
        c=self.canv;c.saveState();c.drawImage(str(ROOT/'assets/logos/practiscale-logo-reversed.png'),0,470,width=280,height=280*67/363,mask='auto')
        c.setFillColor(HexColor('#9BE3D6'));c.setFont('Mono',11);c.drawString(0,384,'COMPLETE FILE HANDBOOK / EDITION 1.4')
        c.setFillColor(HexColor('#FFFFFF'));c.setFont('Sora',52);c.drawString(0,294,'One identity.');c.drawString(0,225,'Open design choices.')
        c.setFillColor(HexColor('#BDD3D3'));c.setFont('Manrope',16);c.drawString(0,158,'All 18 requested files, synchronized and checked.');c.drawString(0,130,'Colors, type, logo, and CTA rules are established.');c.drawString(0,102,'Website layouts will be selected later.')
        c.setFont('Mono',10);c.drawString(0,28,'19 OCTOBER 2026 / MARKDOWN + CSS + JSON / SOURCES INCLUDED');c.restoreState()

def compose(path,index=None):
    doc=Doc(path);story=[Marker('Complete file handbook'),Cover(),PageBreak(),Marker('Contents')]
    story+=[Paragraph('Contents and file coverage',styles['h1']),Paragraph('Every requested file is included in full. Retired chapters appear as notices. CSS and JSON are reproduced as readable source listings; wrapped lines do not change the ZIP originals.',styles['body'])]
    rows=[]
    for i,name in enumerate(FILES):rows.append([Paragraph(f'<a color="#134143" href="#file_{i}">{name}</a>',styles['cell']),Paragraph(str(index.get(name,'')) if index else '',styles['cell'])])
    tab=Table(rows,colWidths=[CW-65,65]);tab.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),'Manrope'),('BOTTOMPADDING',(0,0),(-1,-1),3),('TOPPADDING',(0,0),(-1,-1),3),('LINEBELOW',(0,0),(-1,-1),.4,LINE)]));story.append(tab)
    story+=[PageBreak(),Marker('Verification and use'),Paragraph('Verification before export',styles['h1'])]
    pre=json.loads((ROOT/'verification/preflight.json').read_text(encoding='utf-8'));web=json.loads((ROOT/'verification/component-checks.json').read_text(encoding='utf-8'))
    for title,body in [
        ('Source preflight',f'{len(pre["checks"])} checks passed before generating this PDF. All 18 requested paths exist and changed. Exact JSON/generated CSS parity, internal links, local assets, font resources, legacy-rule removal, semantic text contrast, CTA gradients, and boundaries were checked.'),
        ('Local component fixture',f'{len(web["checks"])} checks passed in Chrome {web["browser"]}. Nine font weights load. Default, hover, pressed, focus, disabled, theme consistency, logo sizing, wrapped labels, five viewport widths, reduced motion, and forced colors were exercised. No external requests or JavaScript errors were recorded.'),
        ('Preserved source artwork','The original supplied PNG logo files are reused byte-for-byte. They differ slightly from earlier PDF extraction copies; no artwork has been redrawn or recolored. Full-logo source is 363 x 67px; original vector master remains outstanding.'),
        ('Scope of this handbook','Markdown is typeset with its headings, tables, and examples. Complete tokens.json, tokens.css, components.css, fonts.css, and the optional CSS bundle appear in the source appendices. The ZIP contains exact editable files, assets, tools, and evidence.'),
        ('Pending decisions and limits','Final website layout, photography, verified company facts, role terms, destinations, and native-speaker Urdu approval remain separate inputs. Component checks do not certify a later-selected website, assistive-technology behavior, company claim, or print proof. After export, every page must be rendered and visually reviewed; final results are supplied in the ZIP verification report.')]:
        story+=[Paragraph(title,styles['h2']),Paragraph(body,styles['body'])]
    for i,name in enumerate(FILES):
        story+=[PageBreak(),Marker(name,'file_'+str(i)),Paragraph(name,styles['overline'])]
        s=(ROOT/name).read_text(encoding='utf-8')
        if name.endswith('.md'):story+=markdown(s,name)
        else:story+=[Paragraph('Complete source listing',styles['h1']),Paragraph('Exact source is in the ZIP. Blank lines are compressed and long lines wrap for readability; this listing does not approve a website composition.',styles['body']),code(s)]
    def make_canvas(*args,**kwargs):
        kwargs['initialFontName']='Manrope';kwargs['lang']='en-US'
        c=canvas.Canvas(*args,**kwargs);c.setSubject('All requested design-system sources; fixed identity and pending website layouts')
        return c
    doc.build(story,canvasmaker=make_canvas);return doc.index

def build():
    pre=json.loads((ROOT/'verification/preflight.json').read_text(encoding='utf-8'));web=json.loads((ROOT/'verification/component-checks.json').read_text(encoding='utf-8'))
    assert pre['passed'] and web['passed'],'Run source/browser verification before PDF generation.'
    for name,digest in pre['source_sha256'].items():assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest,'Stale preflight: '+name
    fonts();setup_styles()
    glyphs=[]
    for name in FILES:
        face=pdfmetrics.getFont('Mono' if name.endswith(('.css','.json')) else 'Manrope').face
        for ch in set((ROOT/name).read_text(encoding='utf-8')):
            if not ch.isspace() and ord(ch) not in face.charToGlyph:glyphs.append([name,ch,ord(ch)])
    assert not glyphs,glyphs
    pdf=PACKAGE/'PractiScale_Design_System_Complete.pdf'
    index=compose(pdf);index2=compose(pdf,index)
    assert index==index2,'Contents pagination changed between passes.'
    (ROOT/'verification/handbook-source-map.json').write_text(json.dumps({'edition':'1.4','included_files':FILES,'file_start_pages':index2,'glyph_checks':{'missing':glyphs},'source_validation_before_export':True,'source_sha256':{n:hashlib.sha256((ROOT/n).read_bytes()).hexdigest() for n in FILES}},indent=2),encoding='utf-8')
    print('Built complete handbook. File start pages:',json.dumps(index2))
if __name__=='__main__':build()
