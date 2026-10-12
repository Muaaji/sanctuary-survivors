"""Original transparent pixel equipment, standard-library PNG encoder."""
from pathlib import Path
import struct,zlib
out=Path('assets/survivors/equipment');out.mkdir(parents=True,exist_ok=True)
palette={'edge':(28,25,29,255),'iron':(132,146,152,255),'light':(223,228,210,255),'shade':(64,75,83,255),'gold':(208,163,77,255),'leather':(135,83,49,255),'cloth':(98,77,113,255),'wood':(133,90,49,255),'gem':(95,182,177,255),'red':(166,65,53,255)}
kinds='cap helm crown amulet talisman pauldrons mantle robe mail plate bracers wraps gloves gauntlets ring signet greaves leggings boots sabatons sword dagger axe mace wand claw greatsword greataxe staff bow crossbow scythe'.split()
def make(kind):
 p=[[(0,0,0,0)]*32 for _ in range(32)]
 def dot(x,y,c):
  if 0<=x<32 and 0<=y<32:p[y][x]=palette[c]
 def rect(x,y,w,h,c):
  for yy in range(y,y+h):
   for xx in range(x,x+w):dot(xx,yy,c)
 def line(x,y,xx,yy,c,w=1):
  n=max(abs(xx-x),abs(yy-y),1)
  for i in range(n+1):rect(round(x+(xx-x)*i/n),round(y+(yy-y)*i/n),w,w,c)
 metal=kind in ['helm','pauldrons','mail','plate','bracers','gauntlets','greaves','sabatons']
 fill='iron' if metal else 'cloth' if kind in ['crown','robe','wraps'] else 'leather'
 if kind in ['cap','helm']:
  rect(8,7,16,17,'edge');rect(10,5,12,4,'edge');rect(9,8,14,14,fill);rect(11,6,10,3,fill);rect(10,9,3,10,'light' if metal else 'gold');rect(12,16,9,5,'shade');rect(15,9,3,15,fill);rect(16,7,1,7,'light');rect(9,23,5,3,fill);rect(19,23,5,3,fill)
 elif kind=='crown':
  rect(6,18,20,7,'edge');rect(7,19,18,5,'gold');line(7,18,5,8,'gold',2);line(10,19,12,10,'gold',2);line(16,19,16,6,'gold',2);line(22,19,24,9,'gold',2);rect(14,18,5,5,'gem');dot(15,19,'light')
 elif kind in ['amulet','talisman']:
  line(8,5,24,5,'gold');line(8,5,7,14,'gold');line(24,5,25,14,'gold');line(7,14,16,23,'gold');line(25,14,16,23,'gold');rect(12,20,9,9,'edge');rect(13,21,7,7,'gold' if kind=='amulet' else 'light');rect(15,22,3,5,'gem' if kind=='amulet' else 'shade');dot(15,22,'light')
 elif kind in ['pauldrons','mantle']:
  rect(5,9,10,14,'edge');rect(18,9,10,14,'edge');rect(6,10,8,11,fill);rect(19,10,8,11,fill);rect(8,7,6,4,fill);rect(18,7,6,4,fill);line(7,11,13,11,'light' if metal else 'gold');line(20,11,26,11,'light' if metal else 'gold');rect(7,20,6,4,'shade');rect(20,20,6,4,'shade');rect(13,13,6,2,'gold')
 elif kind in ['robe','mail','plate']:
  rect(9,6,15,22,'edge');rect(5,8,5,10,'edge');rect(24,8,4,10,'edge');rect(10,7,13,20,fill);rect(6,9,4,8,fill);rect(23,9,4,8,fill);rect(12,6,9,4,'shade');rect(11,11,3,11,'light' if metal else 'cloth');rect(10,21,13,2,'gold');rect(16,20,3,4,'gold');line(16,11,16,20,'shade');rect(17,11,5,1,'light' if metal else 'gold')
  if kind=='robe':rect(8,26,17,4,'cloth');rect(11,27,2,3,'gold');rect(21,27,2,3,'gold')
  if kind=='mail':
   for y in range(12,20,3):
    for x in range(14,23,3):dot(x,y,'shade')
 elif kind in ['bracers','wraps']:
  rect(6,7,8,20,'edge');rect(19,5,8,20,'edge');rect(7,8,6,18,fill);rect(20,6,6,18,fill)
  for x,y in [(7,8),(20,6)]:
   rect(x,y+2,6,2,'gold');rect(x,y+12,6,2,'gold');rect(x+1,y+5,1,6,'light');
 elif kind in ['gloves','gauntlets']:
  for x,y in [(5,10),(18,7)]:
   rect(x,y,9,17,'edge');rect(x+1,y+1,7,14,fill);rect(x-2,y+6,3,6,fill);rect(x+1,y+12,7,3,'gold');rect(x+2,y+2,1,7,'light' if metal else 'gold');line(x+4,y+2,x+4,y+7,'shade');line(x+6,y+2,x+6,y+7,'shade')
 elif kind in ['ring','signet']:
  line(9,12,12,8,'gold',2);line(12,8,21,8,'gold',2);line(21,8,25,14,'gold',2);line(25,14,24,23,'gold',2);line(24,23,18,27,'gold',2);line(18,27,10,23,'gold',2);line(10,23,9,12,'gold',2);rect(11,6,11,8,'edge');rect(12,7,9,6,'iron' if kind=='ring' else 'gold');rect(14,8,5,4,'gem' if kind=='ring' else 'red');dot(14,8,'light');line(11,14,11,21,'light')
 elif kind in ['greaves','leggings']:
  rect(8,5,17,6,'edge');rect(9,6,15,4,fill);rect(8,11,7,17,'edge');rect(18,11,7,17,'edge');rect(9,11,5,16,fill);rect(19,11,5,16,fill);rect(10,13,1,12,'light' if metal else 'gold');rect(20,13,1,12,'light' if metal else 'gold');rect(8,18,7,3,'shade');rect(18,18,7,3,'shade')
 elif kind in ['boots','sabatons']:
  for x,y in [(4,7),(18,5)]:
   rect(x+2,y,8,20,'edge');rect(x,y+18,10,5,'edge');rect(x+3,y+1,6,17,fill);rect(x+1,y+18,8,3,fill);rect(x+3,y+3,6,2,'gold');rect(x+4,y+7,1,8,'light' if metal else 'gold');rect(x,y+22,10,1,'shade')
 elif kind in ['sword','dagger','greatsword']:
  end=15 if kind=='dagger' else 23;line(10,27,24,27-end,'edge',4);line(11,27,25,27-end,'iron',2);line(11,26,25,26-end,'light');line(8,20 if kind=='dagger' else 23,17,27 if kind=='dagger' else 29,'gold',2);line(7,29,12,24,'leather',2)
 elif kind in ['axe','greataxe']:
  line(7,28,23,5,'wood',3);line(8,27,24,4,'gold');rect(16,4,12,12,'edge');rect(17,5,10,10,'iron');rect(26,7,2,6,'light');rect(15,6,4,7,'shade');
  if kind=='greataxe':rect(8,5,8,10,'iron');rect(7,7,2,6,'light')
 elif kind=='mace':
  line(7,28,19,12,'wood',3);rect(15,3,11,14,'edge');rect(16,4,9,11,'iron');rect(18,3,2,14,'light');rect(23,4,2,12,'shade');rect(13,6,3,7,'gold');rect(26,6,3,7,'gold')
 elif kind in ['staff','wand']:
  line(8,29,21,7 if kind=='staff' else 14,'wood',3);line(9,29,22,7 if kind=='staff' else 14,'gold');rect(17,4 if kind=='staff' else 11,10,8,'gold');rect(19,3 if kind=='staff' else 10,6,9,'gem');rect(20,4 if kind=='staff' else 11,2,5,'light')
 elif kind=='claw':
  rect(5,20,13,8,'leather');rect(6,20,12,3,'gold');
  for x,y in [(10,21),(15,23),(20,25)]:line(x,y,x+7,y-17,'iron',2);line(x,y,x+6,y-17,'light')
 elif kind=='bow':
  line(8,4,18,10,'wood',2);line(18,10,21,17,'wood',2);line(21,17,18,23,'wood',2);line(18,23,8,29,'wood',2);line(8,4,8,29,'light');line(5,17,28,17,'iron');line(24,14,28,17,'light');line(24,20,28,17,'light');rect(19,15,3,5,'gold')
 elif kind=='crossbow':
  line(8,28,22,9,'wood',4);line(6,10,22,5,'wood',3);line(22,5,28,17,'wood',3);line(6,10,14,21,'light');line(28,17,14,21,'light');line(14,21,23,9,'iron',2);rect(13,16,5,3,'gold')
 elif kind=='scythe':
  line(7,29,20,6,'wood',3);line(19,6,26,7,'iron',3);line(26,7,29,15,'iron',2);line(29,15,27,23,'light');line(20,9,25,10,'light');
 return p

def png(p):
 raw=b''.join(b'\0'+bytes(sum((list(c) for c in row),[])) for row in p)
 def chunk(tag,data):return struct.pack('!I',len(data))+tag+data+struct.pack('!I',zlib.crc32(tag+data)&0xffffffff)
 return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',32,32,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b'')
for k in kinds:(out/(k+'.png')).write_bytes(png(make(k)))
# Contact sheet with transparent gutters for visual inspection.
cols=8;sheet=[[(0,0,0,0)]*(cols*40) for _ in range(4*40)]
for i,k in enumerate(kinds):
 tile=make(k)
 for y,row in enumerate(tile):sheet[(i//cols)*40+4+y][(i%cols)*40+4:(i%cols)*40+36]=row
# Encoder uses arbitrary dimensions for sheet.
raw=b''.join(b'\0'+bytes(sum((list(c) for c in row),[])) for row in sheet)
def chunk(t,d):return struct.pack('!I',len(d))+t+d+struct.pack('!I',zlib.crc32(t+d)&0xffffffff)
(out/'sprite-sheet.png').write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',320,160,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw))+chunk(b'IEND',b''))
print(f'{len(kinds)} original equipment sprites generated')
