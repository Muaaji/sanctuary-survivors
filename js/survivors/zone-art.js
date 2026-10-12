/* Original canvas spell surfaces. Visual time comes only from the paused game clock. */
'use strict';
window.SurvivorZoneArt=(()=>{
 const TAU=Math.PI*2,fract=n=>n-Math.floor(n),noise=n=>fract(Math.sin(n*127.1+311.7)*43758.5453);
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const palettes={bone:['#332d29','#635b48','#d2c6a2'],fire:['#281b15','#693624','#efba78'],ice:['#202d32','#526b70','#d7e6df'],lava:['#201715','#6e3524','#eaaa64'],poison:['#20251b','#424c31','#c5d98f'],rune:['#26242b','#56505f','#c1ac86'],wind:['#242829','#4b5555','#b0bdb6']};
 function family(id,mode,element){
  if(mode==='corpse'||mode==='fireball'||mode==='meteor')return 'fire';
  if(mode==='fissure')return 'lava';if(mode==='blizzard'||/blizzard|frostnova/.test(id))return 'ice';
  if(mode==='whirl'||mode==='hurricane')return 'wind';
  if(mode==='nova')return element==='poison'?'poison':element==='cold'?'ice':'bone';
  if(mode==='plague'||mode==='venom'||/poison|plague/.test(id))return 'poison';
  if(['aura','shield','curse','cry'].includes(mode)||/holyfire|shield|curse/.test(id))return 'rune';
  return null;
 }
 function glow(c,x,y,r,color,alpha){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(.3,color);g.addColorStop(1,'rgba(0,0,0,0)');const previous=c.globalAlpha;c.globalAlpha*=alpha;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.globalAlpha=previous;}
 function shard(c,x,y,size,a,color){c.fillStyle=color;c.beginPath();c.moveTo(x+Math.cos(a)*size,y+Math.sin(a)*size);c.lineTo(x+Math.cos(a+2.4)*size*.4,y+Math.sin(a+2.4)*size*.4);c.lineTo(x+Math.cos(a-2.4)*size*.4,y+Math.sin(a-2.4)*size*.4);c.closePath();c.strokeStyle='#151b1b';c.lineWidth=Math.max(1,size*.6);c.stroke();c.fill();c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.max(1,size*.35),Math.max(1,size*.35));}
 function draw(c,id,x,y,size,time=0,o={}){
  const mode=o.mode||window.SurvivorCatalogue?.spells?.[id]?.mode,element=o.element||window.SurvivorCatalogue?.spells?.[id]?.element;
  const kind=family(id,mode,element);if(!kind||!Number.isFinite(size)||size<=0)return false;
  const t=Number.isFinite(time)?time:0,r=clamp(size/2,2,600),seed=Array.from(String(id)).reduce((n,a)=>n+a.charCodeAt(0),0);
  const duration=Math.max(.01,Number.isFinite(o.duration)?o.duration:1),age=Number.isFinite(o.age)?Math.max(0,o.age):fract(t*.6)*duration;
  const progress=clamp(age/duration,0,1),burst=['nova','corpse','fireball','meteor'].includes(mode),fade=burst?Math.max(0,1-progress*progress):1,pal=palettes[kind];
  c.save();c.translate(x,y);c.globalAlpha*=clamp(Number.isFinite(o.opacity)?o.opacity:1,0,1)*fade;
  // Soft local light, never opaque petal silhouettes or a circular ground decal.
  const light={bone:'rgba(194,190,142,.75)',fire:'rgba(236,135,48,.9)',ice:'rgba(164,221,226,.9)',lava:'rgba(221,100,36,.85)',poison:'rgba(163,193,78,.8)',rune:'rgba(174,146,89,.55)',wind:'rgba(152,185,182,.5)'}[kind];
  for(let i=0;i<8;i++){const a=noise(seed+i*5)*TAU,d=r*(burst?.1+progress*.72:noise(seed+i+17)*.65),z=r*(kind==='fire'?.25:.15);glow(c,Math.cos(a)*d,Math.sin(a)*d,z,light,kind==='rune'?.22:.5);}
  // Ragged ground fragments establish volume without a filled circular decal.
  for(let i=0;i<28;i++){const n=seed+i*7.31,a=noise(n)*TAU,d=Math.sqrt(noise(n+1))*r*.88,pulse=.7+.3*Math.sin(t*2+i);c.fillStyle=pal[i%2];const z=Math.max(2,r*(.045+noise(n+2)*.055));c.fillRect(Math.round(Math.cos(a)*d),Math.round(Math.sin(a)*d),z*pulse,z*.45);}
  if(kind==='lava'){
   for(let i=0;i<6;i++){const a=noise(seed+i)*TAU,center=(noise(seed+i+7)-.5)*r*.9,px=Math.cos(a)*center,py=Math.sin(a)*center;let xx=px,yy=py;c.strokeStyle='#35251c';c.lineWidth=Math.max(3,r*.035);c.beginPath();c.moveTo(xx,yy);for(let j=1;j<=4;j++){xx+=Math.cos(a+(noise(i*31+j+seed)-.5)*1.5)*r*.12;yy+=Math.sin(a+(noise(i*31+j+seed)-.5)*1.5)*r*.12;c.lineTo(xx,yy);}c.stroke();c.strokeStyle=pal[2];c.lineWidth=Math.max(1,r*.013);c.stroke();glow(c,(px+xx)/2,(py+yy)/2,r*.14,light,.55);}
  }else if(kind==='rune'){
   for(let i=0;i<8;i++){const a=i*TAU/8+t*.035,d=r*.72,xx=Math.cos(a)*d,yy=Math.sin(a)*d;c.strokeStyle=pal[1];c.lineWidth=Math.max(1,r*.012);c.beginPath();c.moveTo(xx-Math.cos(a)*r*.045,yy-Math.sin(a)*r*.045);c.lineTo(xx+Math.cos(a)*r*.045,yy+Math.sin(a)*r*.045);c.lineTo(xx+Math.cos(a+1.1)*r*.07,yy+Math.sin(a+1.1)*r*.07);c.stroke();}
   c.strokeStyle=pal[1];c.lineWidth=Math.max(1,r*.018);for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,r*(.65+i*.08),i*2.1+t*.04,i*2.1+t*.04+.7);c.stroke();}
  }else if(kind==='wind'){
   for(let i=0;i<12;i++){const a=i*2.4-t*(mode==='whirl'?3:1.8),rr=r*(.18+noise(seed+i)*.65);c.strokeStyle=pal[i%3];c.lineWidth=Math.max(1,r*.015);c.beginPath();c.arc(0,0,rr,a,a+.45+noise(i)*.45);c.stroke();shard(c,Math.cos(a)*rr,Math.sin(a)*rr,Math.max(2,r*.03),a,pal[1]);}
  }else if(kind==='poison'){
   for(let i=0;i<18;i++){const a=noise(seed+i)*TAU+(burst?progress*.16:t*.12),d=burst?r*(.08+progress*(.72+noise(i+seed+2)*.18)):noise(i+seed+2)*r*.75,drift=burst?0:Math.sin(t*1.4+i)*r*.055,z=r*(.055+noise(i+4)*.08)*(burst?.45+progress*.55:1),xx=Math.cos(a)*d+drift,yy=Math.sin(a)*d-(burst?0:r*.035*Math.sin(t+i));c.fillStyle=pal[i%2];c.beginPath();c.ellipse(xx,yy,z,z*.48,0,0,TAU);c.fill();if(burst){c.strokeStyle=pal[1];c.lineWidth=Math.max(1,r*.01);c.beginPath();c.moveTo(Math.cos(a)*Math.max(0,d-r*.14),Math.sin(a)*Math.max(0,d-r*.14));c.lineTo(xx,yy);c.stroke();shard(c,xx,yy,Math.max(2,r*.025),a,pal[2]);}else if(i%3===0)c.fillRect(xx,yy,2,2);}
  }else{
   for(let i=0;i<(kind==='fire'?24:32);i++){const n=seed+i*11.7,a=noise(n)*TAU+(kind==='ice'?t*.22:0),phase=burst?progress:fract(t*.7+noise(n+2)),d=r*(burst?.12+.88*phase:Math.sqrt(noise(n+3))*.85);const xx=Math.cos(a)*d,fall=kind==='ice'&&!burst?(fract(t*.85+noise(n+4))-.5)*r*.5:0,yy=Math.sin(a)*d+fall-(kind==='fire'?Math.sin(phase*Math.PI)*r*.3:0),z=Math.max(3,r*(.032+noise(n+1)*.045));
    if(kind==='ice'&&i%2===0){c.strokeStyle=pal[1];c.lineWidth=Math.max(1,r*.014);c.beginPath();c.moveTo(xx-r*.025,yy-r*.13);c.lineTo(xx,yy);c.stroke();}
    if(kind==='fire'){const flame=z*(1.4+noise(n+5));c.fillStyle=pal[1];c.beginPath();c.moveTo(xx-z,yy+z*.4);c.lineTo(xx-z*.45,yy-flame*.45);c.lineTo(xx+Math.sin(t*8+i)*z*.35,yy-flame);c.lineTo(xx+z*.7,yy-flame*.2);c.lineTo(xx+z,yy+z*.4);c.closePath();c.fill();c.fillStyle=pal[2];c.fillRect(xx-z*.2,yy-z*.7,Math.max(2,z*.4),Math.max(2,z));}
    else shard(c,Math.round(xx),Math.round(yy),z,a+(kind==='bone'?Math.PI/2:t*.3),pal[2]);}
  }
  c.restore();return true;
 }
 return {draw,family};
})();
