'use strict';
window.SurvivorSpellArt={cache:{},get(id){if(!this.cache[id]){const image=new Image();image.src='assets/survivors/spells/'+id+'.png';this.cache[id]=image;}return this.cache[id];},
 drawGround(ctx,id,x,y,size,time=0,options={}){return window.SurvivorZoneArt?SurvivorZoneArt.draw(ctx,id,x,y,size,time,options):false;},
 draw(ctx,id,x,y,size,time=0,angle=0,ground=false){if(ground&&this.drawGround(ctx,id,x,y,size,time))return true;const image=this.get(id+(ground?'-ground':'')),sw=ground?96:32;if(!image.complete||!image.naturalWidth)return false;const frame=Math.floor(time*8)%4;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(image,frame*sw,0,sw,sw,-size/2,-size/2,size,size);ctx.restore();return true;},
 projectile(p){const s=p.ctx?.s;if(!s||s.group==='common'||s.basic)return null;if(p.mode==='frost')return 'ice-shard';if(s.mode==='turret')return s.element==='fire'?'fire-bolt':'lightning-bolt';return s.id;}
};
