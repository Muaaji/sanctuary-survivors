"""Deterministic transparent pixel animation sheets matching the combat catalogue."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,math,random,hashlib,base64
root=Path(__file__).resolve().parent.parent
s=(root/'js/survivors/catalog.js').read_text();C=json.loads(s[s.index('{'):s.rindex('}')+1]);out=root/'assets/survivors/spells';out.mkdir(exist_ok=True)
colors={'fire':('#f17c33','#ffda82'),'cold':('#5898d0','#c6f4ff'),'lightning':('#9b8ac9','#fff4bb'),'poison':('#709b45','#c1e582'),'magic':('#9e77b8','#e5caff'),'physical':('#a29d8e','#f5e7c4')}
def tile(w,f):
 im=Image.new('RGBA',(32,32));g=ImageDraw.Draw(im);a,b=colors[w['element']];mode=w['mode'];id=w['id'];
 if id.startswith('paladin_') and w['element']!='fire':a,b='#b49353','#fff1bd'
 if id=='necromancer_spear':a,b='#a8aa9e','#f2ebd3'
 rng=random.Random(int(hashlib.sha256(id.encode()).hexdigest()[:8],16)+f)
 if mode=='companion':
  if 'wolves' in id or 'grizzly' in id:
   fur='#97643f' if 'grizzly' in id else '#8d9da8';g.polygon([(5,15),(10,10),(22,11),(27,15),(26,23),(9,23)],fill=fur);g.rectangle((4,12,12,21),fill=fur);g.polygon([(4,12),(4,6),(8,12),(11,7),(12,15)],fill=fur);g.rectangle((3,17,7,21),fill='#d0b18b');g.rectangle((8,23,12,29),fill=fur);g.rectangle((21,23,25,28),fill=fur);g.line((26,16,30,10),fill=fur,width=3);g.point((5,15),fill='#fff0af')
  elif 'skeleton' in id:
   g.rectangle((11,4,21,12),fill='#d6d1b8');g.rectangle((13,7,15,9),fill='#242335');g.rectangle((18,7,20,9),fill='#242335');g.line((16,12,16,23),fill='#d6d1b8',width=2);g.line((10,15,23,15),fill='#d6d1b8',width=2);g.line((16,23,9,29),fill='#d6d1b8',width=2);g.line((16,23,23,29),fill='#d6d1b8',width=2);g.line((25,6,25,23),fill='#e8dac1',width=2)
  else:
   g.polygon([(16,3),(11,9),(10,22),(5,29),(27,29),(22,22),(21,9)],fill=a);g.rectangle((13,5,19,11),fill=b);g.line((6,11,5,25),fill=b,width=2);g.line((25,10,25,27),fill=b,width=2)
 elif mode=='turret':
  if 'hydra' in id:
   for x in [7,16,25]:g.line((16,28,x,10+f%2),fill=a,width=3);g.rectangle((x-3,5,x+3,11),fill=a);g.point((x+2,6),fill=b);g.rectangle((x+2,9,x+5,10),fill=b)
  else:
   g.polygon([(5,26),(12,17),(20,17),(27,26)],fill='#6f6873');g.rectangle((12,11,20,21),fill='#918177');g.rectangle((14,5,18,13),fill=a);g.line((7,9,12,5,16,8,21,3,25,8),fill=b,width=2)
 elif mode in ('fireball','orb','homing') and id!='amazon_guided':
  g.ellipse((7,5,27,25),fill=a);g.ellipse((11,8,24,21),fill=b);g.ellipse((16,11,23,18),fill='#fffce3');
  for i in range(5):y=6+i*4;g.line((max(0,5-f%2*2),y,10,y),fill=a,width=2)
  if mode=='orb':
   for k in range(6):x=16+math.cos(k*math.pi/3+f*.2)*13;y=15+math.sin(k*math.pi/3+f*.2)*13;g.rectangle((int(x),int(y),int(x)+1,int(y)+2),fill=b)
 elif mode in ('fan','projectile','spear','plague','javelin') or id=='amazon_guided':
  g.line((2,16,28,16),fill=a,width=3);g.polygon([(22,10),(30,16),(22,22),(25,16)],fill=b);g.line((3,11,7,16,3,21),fill=b,width=2)
  if mode=='spear':g.line((8,13,8,19),fill=b,width=2);g.line((13,13,13,19),fill=b,width=2)
  if mode in ('plague','javelin'):
   for i in range(8):g.point((rng.randrange(3,24),rng.randrange(8,24)),fill=b)
 elif mode=='tornado':
  for k in range(6):y=3+k*4;x=16+int(math.sin(k+f)*3);r=3+k//2;g.line((x-r,y,x+r,y),fill=b if k%2 else a,width=2)
 elif mode in ('melee','frenzy','whirl'):
  n=3 if 'claw' in id else 2
  for i in range(n):g.arc((3+i*4,2,25+i*2,28),210+f*10,335+f*10,fill=b,width=2)
  for i in range(3):g.point((18+i*3,7+i*3),fill=a)
 elif mode=='shield':
  g.polygon([(5,4),(16,1),(27,4),(25,21),(16,30),(7,21)],fill=a);g.polygon([(8,7),(16,4),(24,7),(22,20),(16,26),(10,20)],fill='#302a3b');g.line((16,9,16,22),fill=b,width=3);g.line((11,14,21,14),fill=b,width=2)
 elif mode=='hammer':
  g.rectangle((13,11,17,29),fill='#96724b');g.rectangle((4,4,26,14),fill=a);g.rectangle((6,5,24,8),fill=b)
 elif mode=='curse':
  g.ellipse((9,3,23,15),fill=b);g.rectangle((11,7,14,10),fill='#332539');g.rectangle((18,7,21,10),fill='#332539');g.line((16,15,16,29),fill=a,width=2);g.line((5,22,27,22),fill=a,width=2)
 else:
  for k in range(8):t=k*math.pi/4+f*.12;r=9+f;g.line((16+math.cos(t)*4,16+math.sin(t)*4,16+math.cos(t)*r,16+math.sin(t)*r),fill=b,width=2)
  g.ellipse((11,11,21,21),outline=a,width=2)
 return im
def ground(w,f):
 im=Image.new('RGBA',(96,96));g=ImageDraw.Draw(im);a,b=colors[w['element']];
 if w['id'].startswith('paladin_') and w['element']!='fire':a,b='#b49353','#fff1bd'
 g.ellipse((8,8,88,88),outline=a,width=2);g.ellipse((14,14,82,82),outline=b,width=1)
 for k in range(12):t=k*math.pi/6+f*.13;x=48+math.cos(t)*40;y=48+math.sin(t)*40;g.rectangle((int(x)-1,int(y)-1,int(x)+1,int(y)+1),fill=b)
 rng=random.Random(w['id']+str(f))
 for k in range(18):t=rng.random()*math.tau;r=rng.randrange(8,34);x=48+math.cos(t)*r;y=48+math.sin(t)*r;g.rectangle((int(x),int(y),int(x)+1,int(y)+2),fill=a)
 if w['mode'] in ('whirl','hurricane'):g.arc((23,23,73,73),f*40,f*40+200,fill=b,width=3)
 elif w['mode']=='fissure':
  for k in range(4):x=24+k*13;g.line((x,32,x+4,44,x-2,56,x+5,67),fill=b,width=2)
 return im
for w in C['spells'].values():
 if w['group']=='common':continue
 sheet=Image.new('RGBA',(128,32))
 for f in range(4):sheet.paste(tile(w,f),(f*32,0))
 sheet.save(out/(w['id']+'.png'))
 icon=tile(w,0);buf=__import__('io').BytesIO();icon.save(buf,format='PNG');b64=base64.b64encode(buf.getvalue()).decode()
 (root/'assets/survivors/icons'/ (w['id']+'.svg')).write_text('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect x="1" y="1" width="30" height="30" rx="4" fill="#211b27" stroke="'+colors[w['element']][0]+'"/><image width="32" height="32" style="image-rendering:pixelated" href="data:image/png;base64,'+b64+'"/></svg>')
 if w['mode'] in ('aura','hurricane','whirl','shield','nova','curse','fissure','blizzard','corpse','cry','plague'):
  sheet=Image.new('RGBA',(384,96))
  for f in range(4):sheet.paste(ground(w,f),(f*96,0))
  sheet.save(out/(w['id']+'-ground.png'))
# Neutral projectile variants used by emitted shards and by turret fire.
for id,mode,element in [('ice-shard','spear','cold'),('fire-bolt','fireball','fire'),('lightning-bolt','spear','lightning'),('poison-bolt','plague','poison')]:
 w={'id':id,'mode':mode,'element':element};sheet=Image.new('RGBA',(128,32))
 for f in range(4):sheet.paste(tile(w,f),(f*32,0))
 sheet.save(out/(id+'.png'))
print('Created animated sprites for 35 class skills, their ground effects and four projectile variants')
