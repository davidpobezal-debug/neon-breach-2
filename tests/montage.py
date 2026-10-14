import sys
from pathlib import Path
from PIL import Image, ImageDraw
out=Path(__file__).resolve().parent/'out_mars'
names=sys.argv[2:]
dest=sys.argv[1]
ims=[]
for n in names:
    im=Image.open(out/(n+'.png')).convert('RGB').resize((640,360),Image.LANCZOS)
    d=ImageDraw.Draw(im);d.rectangle((0,0,230,16),fill=(0,0,0));d.text((4,2),n,fill=(255,255,255))
    ims.append(im)
cols=2;rows=(len(ims)+1)//2
sheet=Image.new('RGB',(640*cols,360*rows))
for i,im in enumerate(ims):sheet.paste(im,((i%cols)*640,(i//cols)*360))
sheet.save(out/(dest+'.png'))
