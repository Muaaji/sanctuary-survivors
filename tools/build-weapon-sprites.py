from pathlib import Path
import struct,zlib,base64,json
out=Path('assets/survivors/weapons');out.mkdir(exist_ok=True)
pal={'metal':(212,220,218,255),'light':(248,244,220,255),'dark':(90,102,110,255),'wood':(152,103,56,255),'gold':(208,167,84,255),'cord':(169,167,146,255)}
def make(kind):
 pix=[[(0,0,0,0) for _ in range(24)] for _ in range(24)]
 def dot(x,y,c):
  if 0<=x<24 and 0<=y<24:pix[y][x]=pal[c]
 def line(x,y,xx,yy,c,w=1):
  n=max(abs(xx-x),abs(yy-y),1)
  for i in range(n+1):
   px=round(x+(xx-x)*i/n);py=round(y+(yy-y)*i/n)
   for dx in range(w):
    for dy in range(w):dot(px+dx,py+dy,c)
 def rect(x,y,w,h,c):
  for yy in range(y,y+h):
   for xx in range(x,x+w):dot(xx,yy,c)
 if kind in ('sword','dagger','spear'):
  length={'sword':15,'dagger':9,'spear':7}[kind];line(11,3,11,3+length,'metal',2);line(11,3,11,3+length-1,'light');dot(11,2,'light');
  if kind!='spear':line(8,3+length,15,3+length,'gold')
  else:line(10,5,13,5,'metal');dot(9,6,'dark');dot(14,6,'light')
  line(11,4+length,11,22,'wood',2)
 elif kind=='axe':
  line(10,4,10,22,'wood',2);rect(8,4,3,7,'dark');rect(11,3,7,7,'metal');rect(17,4,2,5,'light');rect(10,7,3,3,'gold')
 elif kind=='scythe':
  line(7,4,7,22,'wood',2);line(7,4,15,3,'metal',2);line(15,3,20,7,'metal',2);line(20,7,21,12,'light');line(9,6,16,5,'light');line(16,5,19,8,'light')
 elif kind=='bow':
  line(5,3,10,7,'wood',2);line(10,7,12,12,'wood',2);line(12,12,10,17,'wood',2);line(10,17,5,21,'wood',2);line(5,3,5,21,'cord');line(3,12,21,12,'metal');dot(20,11,'light');dot(20,13,'light')

 elif kind=='crossbow':
  rect(10,7,4,14,'wood');rect(9,19,5,3,'wood');rect(11,8,2,10,'dark');line(11,8,11,17,'metal');line(12,5,12,16,'light');dot(11,5,'metal');dot(13,5,'metal')
  line(3,10,5,7,'wood',2);line(5,7,9,6,'wood',2);line(9,6,14,6,'wood',2);line(14,6,18,7,'wood',2);line(18,7,20,10,'wood',2)
  line(3,10,11,13,'cord');line(12,13,21,10,'cord');rect(9,8,6,2,'gold');rect(14,16,3,2,'dark')
 elif kind=='mace':
  line(11,10,11,22,'wood',2);rect(8,3,8,9,'metal');rect(7,5,10,5,'dark');rect(9,4,5,6,'metal');line(9,4,9,9,'light');rect(10,12,4,2,'gold')
 elif kind=='sling':
  line(5,3,6,15,'cord');line(18,3,17,15,'cord');line(6,15,10,19,'wood',2);line(10,19,15,18,'wood',2);rect(8,14,8,4,'wood');rect(11,14,4,3,'dark')
 elif kind=='flail':
  line(6,13,6,22,'wood',3);line(7,13,11,8,'metal');line(11,8,17,7,'metal');line(17,7,18,12,'metal');rect(16,12,6,6,'dark');rect(17,13,4,4,'metal');dot(15,14,'metal');dot(19,11,'light');dot(20,18,'metal')
 elif kind in ('arrow','bolt'):
  line(2,11,20,11,'wood' if kind=='arrow' else 'dark',2);line(18,8,21,11,'metal');line(18,14,21,11,'light');line(3,9,6,11,'cord');line(3,14,6,12,'cord')
 elif kind=='pebble':rect(8,8,7,7,'dark');rect(9,8,5,6,'metal');rect(9,9,3,2,'light')
 return pix
def png(pix):
 raw=b''.join(b'\0'+bytes(sum((list(c) for c in row),[])) for row in pix)
 def chunk(tag,data):return struct.pack('!I',len(data))+tag+data+struct.pack('!I',zlib.crc32(tag+data)&0xffffffff)
 return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',24,24,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b'')
ids={'knives':'dagger','axes':'axe','embers':'bow','blades':'sword','flasks':'spear','frost':'crossbow','storm':'scythe','seal':'mace','skulls':'sling','comets':'flail'}
for kind in list(ids.values())+['arrow','bolt','pebble']:
 data=png(make(kind));(out/(kind+'.png')).write_bytes(data)
 for id,k in ids.items():
  if k==kind:Path('assets/survivors/icons/common_'+id+'.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="4" fill="#241d18" stroke="#80694a"/><image x="4" y="4" width="24" height="24" style="image-rendering:pixelated" href="data:image/png;base64,'+base64.b64encode(data).decode()+'"/></svg>')
Path('js/survivors/weapon-art.js').write_text("'use strict';\nwindow.SurvivorWeaponArt=(()=>{const cache={};return {get(kind,projectile=false){if(projectile)kind=({bow:'arrow',crossbow:'bolt',sling:'pebble'})[kind]||kind;if(cache[kind])return cache[kind];const image=new Image();image.src='assets/survivors/weapons/'+kind+'.png';cache[kind]=image;return image;}};})();\n")
print('13 transparent pixel sprites and 10 matching weapon icons generated')
