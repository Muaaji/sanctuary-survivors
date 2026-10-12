/* Shared ground telegraphs: exact geometry, subdued pigments and deterministic pixel grain. */
'use strict';
window.SurvivorGroundArt=(()=>{
 const TAU=Math.PI*2;
 const palettes={
  earth:{dark:'#30271f',soil:'#776044',edge:'#ccb78f',rune:'#a88d61'},
  fire:{dark:'#39251c',soil:'#954d32',edge:'#dfaa72',rune:'#c5824d'},
  poison:{dark:'#28301e',soil:'#667443',edge:'#bdc78d',rune:'#8e9b63'},
  web:{dark:'#302c26',soil:'#797362',edge:'#d2c7aa',rune:'#a79d85'},
  arcane:{dark:'#302735',soil:'#70566d',edge:'#c6b1bf',rune:'#a58a9e'}
 };
 const clamp=v=>Math.max(0,Math.min(1,v));
 function family(z){if(z.web||z.kind==='web')return 'web';if(z.poison||z.kind==='poison')return 'poison';if(z.kind==='charger'||['#ee934d','#fa645f','#edb273'].includes(z.color))return 'fire';if(['#a784c9','#b19adf'].includes(z.color))return 'arcane';return 'earth';}
 function trace(ctx,shape,r,length,width){
  ctx.beginPath();
  if(shape==='circle')ctx.arc(0,0,r,0,TAU);
  else if(shape==='cone'){ctx.moveTo(0,0);ctx.arc(0,0,length,-width/2,width/2);ctx.closePath();}
  else if(shape==='capsule'){ctx.moveTo(0,-width);ctx.lineTo(length,-width);ctx.arc(length,0,width,-Math.PI/2,Math.PI/2);ctx.lineTo(0,width);ctx.arc(0,0,width,Math.PI/2,Math.PI*1.5);ctx.closePath();}
  else ctx.rect(0,-width,length,width*2);
 }
 function draw(ctx,z,w2s,now,zoom=1){
  if(!z||!Number.isFinite(now)||!Number.isFinite(zoom)||zoom<=0)return;
  const [x,y]=w2s(z.x,z.y);if(!Number.isFinite(x)||!Number.isFinite(y))return;
  const shape=z.shape||'circle',r=Math.max(0,z.r||0)*zoom,length=Math.max(0,z.length||0)*zoom,width=shape==='cone'?Math.max(0,z.width||0):Math.max(0,z.width||0)*zoom;
  const active=now>=z.start,created=Number.isFinite(z.created)?z.created:z.start-.9;
  const progress=active?1:clamp((now-created)/Math.max(.001,z.start-created)),p=palettes[z.palette]||palettes[family(z)];
  const radius=shape==='circle'?r:length,half=shape==='cone'?length:width;
  ctx.save();ctx.translate(x,y);ctx.rotate(z.angle||0);ctx.imageSmoothingEnabled=false;ctx.setLineDash([]);
  trace(ctx,shape,r,length,width);ctx.globalAlpha=active?.43:.19;ctx.fillStyle=p.dark;ctx.fill();
  // Every grain and rune remains clipped to the collision silhouette.
  ctx.save();ctx.clip();ctx.globalAlpha=active?.42:.15+progress*.1;ctx.fillStyle=p.soil;
  const left=shape==='circle'?-r:shape==='capsule'?-width:0,right=shape==='circle'?r:length+(shape==='capsule'?width:0),top=shape==='circle'?-r:-half,bottom=shape==='circle'?r:half;
  const step=Math.max(8,12*zoom),pixel=Math.max(1,Math.round(2*zoom));
  // Fixed count bound keeps telegraphs cheap even at large camera zoom.
  let dots=0;for(let row=0,gy=top+step/2;gy<bottom&&dots<96;gy+=step,row++)for(let col=0,gx=left+step/2;gx<right&&dots<96;gx+=step,col++)if((row*7+col*11)%4===0){ctx.fillRect(Math.round(gx),Math.round(gy),pixel*2,pixel);dots++;}
  ctx.globalAlpha=active?.68:.25+progress*.25;ctx.strokeStyle=p.rune;ctx.lineWidth=Math.max(1,zoom);
  if(family(z)==='web'&&shape==='circle'){
   for(let n=0;n<8;n++){const a=n*TAU/8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();}
   for(const fraction of [.32,.64]){ctx.beginPath();for(let n=0;n<=8;n++){const a=n*TAU/8,px=Math.cos(a)*r*fraction,py=Math.sin(a)*r*fraction;n?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();}
  }else if(family(z)==='poison'&&shape==='circle'){
   // Small angular stains suggest a contaminated surface rather than a glowing disk.
   for(let n=0;n<7;n++){const a=n*2.4,px=Math.cos(a)*r*.55,py=Math.sin(a)*r*.55,size=Math.max(2,r*.055);ctx.fillStyle=p.rune;ctx.fillRect(Math.round(px),Math.round(py),size*2,size);}
  }
  ctx.globalAlpha=active?.86:.35+progress*.55;ctx.strokeStyle=p.edge;
  if(shape==='circle'||shape==='cone'){
   const arcR=radius*.86,start=shape==='cone'?-width/2:-Math.PI/2,sweep=shape==='cone'?width:TAU;
   ctx.beginPath();ctx.arc(0,0,arcR,start,start+sweep*progress);ctx.stroke();
   for(let n=0;n<6;n++){const a=start+sweep*(n+.5)/6,rr=radius*.71;ctx.beginPath();ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);ctx.lineTo(Math.cos(a)*(rr+3*zoom),Math.sin(a)*(rr+3*zoom));ctx.stroke();}
  }else{
   const interval=Math.max(12,length/8);for(let i=1;i<8&&i*interval<length;i++){const px=i*interval;ctx.globalAlpha=active||i/8<=progress?.8:.18;ctx.beginPath();ctx.moveTo(px-3*zoom,-3*zoom);ctx.lineTo(px+3*zoom,0);ctx.lineTo(px-3*zoom,3*zoom);ctx.stroke();}
  }
  ctx.restore();
  // Continuous double contour preserves the exact footprint on both bright and dark maps.
  ctx.globalAlpha=active?.95:.65+progress*.25;trace(ctx,shape,r,length,width);ctx.strokeStyle='#211a15';ctx.lineWidth=Math.max(3,3*zoom);ctx.stroke();
  ctx.strokeStyle=p.edge;ctx.lineWidth=Math.max(1,1.3*zoom);ctx.stroke();ctx.restore();
 }
 return {draw,palettes,family};
})();
