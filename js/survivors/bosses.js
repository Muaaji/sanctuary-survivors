/* Encounters follow the existing boss art rather than sharing a generic fan attack. */
'use strict';
window.SurvivorBosses={
 windup(e,seconds){return seconds/(e.bossTempo||1.2);},
 bounded(x,y){const w=currentMapWorld()||{w:2048,h:2048};return {x:clamp(x,30,w.w-30),y:clamp(y,30,w.h-30)};},
 zone(e,R,shape,point,extra={}){if(R.hazards.length>=40)return;const z={owner:e,shape,x:point.x,y:point.y,angle:angleTo(e.x,e.y,point.x,point.y),r:65,length:260,width:26,start:R.now+.9,end:R.now+1.4,next:0,dmg:e.dmg*.7,color:'#da7459',...extra};const duration=z.end-z.start;z.start=R.now+this.windup(e,z.start-R.now);z.end=z.start+duration;R.hazards.push(z);},
 adds(e,count,type){const live=enemies.filter(a=>!a.dead&&a.broodOwner===e);for(let i=0;i<Math.min(count,6-live.length)&&enemies.length<180;i++){const p=this.bounded(e.x+Math.cos(i*2.4)*65,e.y+Math.sin(i*2.4)*65);const a=spawnEnemy(type,p.x,p.y);if(a){a.broodOwner=e;a.hp=a.hpMax*=.6;}}},
 locked(e,now){return (e.bossWindup||0)>now||(e.bossChargeUntil||0)>now;},
 tick(e,dt,R){
  if(e.dead)return;e.phase=e.hp/e.hpMax<.5?2:1;
  if(e.bossChargeUntil>R.now){const p=this.bounded(e.x+e.chargeDX*260*(e.bossTempo||1.2)*dt,e.y+e.chargeDY*260*(e.bossTempo||1.2)*dt);e.x=p.x;e.y=p.y;return;}
  if((e.nextBossAction||0)>R.now)return;
  e.attackIndex=(e.attackIndex||0)+1;e.nextBossAction=R.now+this.windup(e,e.phase===2?3.3:4.5);e.bossWindup=R.now+this.windup(e,.9);e.bossBossAttackT=this.windup(e,1);
  const point={x:Player.x,y:Player.y},index=e.attackIndex;
  e.lastMechanic='';
  if(e.id==='butcher'){
    if(index%2){e.lastMechanic='cleaver';this.zone(e,R,'cone',{x:e.x,y:e.y},{angle:angleTo(e.x,e.y,point.x,point.y),r:125,length:125,width:1.4,start:R.now+.8,end:R.now+1.05,dmg:e.dmg*.85,color:'#ce7b55'});}
    else {e.lastMechanic='hook-charge';const a=angleTo(e.x,e.y,point.x,point.y);this.zone(e,R,'line',{x:e.x,y:e.y},{angle:a,length:300,width:20,dmg:e.dmg*.55,color:'#c9b38b',hook:true});R.schedule(this.windup(e,.9),()=>{if(e.dead)return;e.chargeDX=Math.cos(a);e.chargeDY=Math.sin(a);e.bossChargeUntil=R.now+this.windup(e,.9);});}
  }else if(e.id==='insectQueen'){
    if(index%3===0){e.lastMechanic='brood';R.schedule(this.windup(e,.9),()=>{if(!e.dead)this.adds(e,3,'scarab');});}
    else {e.lastMechanic='poison-pools';for(let i=0;i<3;i++){const p=this.bounded(point.x+Math.cos(i*TAU/3)*55,point.y+Math.sin(i*TAU/3)*55);this.zone(e,R,'circle',p,{r:48,start:R.now+1,end:R.now+5.5,dmg:e.dmg*.3,color:'#88b950',poison:true});}}
  }else if(e.id==='summoner'){
    if(index%3===0){e.lastMechanic='summon';R.schedule(this.windup(e,.9),()=>{if(!e.dead)this.adds(e,2,'skeleton');});}
    else if(index%2){e.lastMechanic='ritual';for(let i=0;i<3;i++)this.zone(e,R,'circle',this.bounded(point.x+(i-1)*70,point.y+(i-1)*35),{r:35,start:R.now+1,end:R.now+1.35,color:'#b19adf',dmg:e.dmg*.65});}
    else {e.lastMechanic='teleport-bolts';R.effect(e.x,e.y,48,'#a784c9',this.windup(e,.8),'warning');R.schedule(this.windup(e,.9),()=>{if(e.dead)return;const a=R.now*2,p=this.bounded(point.x+Math.cos(a)*220,point.y+Math.sin(a)*220);e.x=p.x;e.y=p.y;for(let k=-2;k<=2;k++)R.hostile(e,angleTo(e.x,e.y,Player.x,Player.y)+k*.2,e.dmg*.4,{color:'#b89bff',speed:175*(e.bossTempo||1.2),visual:'arcane'});});}
  }else if(e.id==='spiderDemon'){
    if(index%2){e.lastMechanic='webs';for(let i=0;i<3;i++)this.zone(e,R,'circle',this.bounded(point.x+(i-1)*90,point.y),{r:55,start:R.now+.8,end:R.now+6,dmg:0,slow:.4,color:'#bbc6b7',web:true});}
    else {e.lastMechanic='pounce';this.zone(e,R,'circle',point,{r:65,start:R.now+1.1,end:R.now+1.4,dmg:e.dmg*.75,color:'#bb7383'});R.schedule(this.windup(e,1.1),()=>{if(e.dead)return;const p=this.bounded(point.x,point.y);e.x=p.x;e.y=p.y;});}
  }else if(e.id==='archdemon'){
    if(index%3===1){e.lastMechanic='fire-breath';this.zone(e,R,'cone',{x:e.x,y:e.y},{angle:angleTo(e.x,e.y,point.x,point.y),length:320,r:320,width:.9,start:R.now+1.1,end:R.now+2.1,dmg:e.dmg*.4,color:'#ee934d'});}
    else if(index%3===2){e.lastMechanic='red-lightning';this.zone(e,R,'line',{x:e.x,y:e.y},{angle:angleTo(e.x,e.y,point.x,point.y),length:450,width:24,start:R.now+1,end:R.now+1.8,dmg:e.dmg*.6,color:'#fa645f'});}
    else {e.lastMechanic='infernal-ring';R.schedule(this.windup(e,.9),()=>{if(e.dead)return;for(let i=0;i<(e.phase===2?16:12);i++)R.hostile(e,i*TAU/(e.phase===2?16:12),e.dmg*.4,{color:'#ffad62',speed:120*(e.bossTempo||1.2),visual:'fire'});});}
  }
 },
 updateHazards(dt,R){for(let i=R.hazards.length-1;i>=0;i--){const z=R.hazards[i];if(z.owner.dead||R.now>z.end){R.hazards.splice(i,1);continue;}if(R.now<z.start)continue;
  const dx=Player.x-z.x,dy=Player.y-z.y,forward=dx*Math.cos(z.angle)+dy*Math.sin(z.angle),side=Math.abs(-dx*Math.sin(z.angle)+dy*Math.cos(z.angle));
  const inside=z.shape==='circle'?dx*dx+dy*dy<(z.r+Player.r)**2:z.shape==='line'?forward>=0&&forward<z.length&&side<z.width+Player.r:dx*dx+dy*dy<z.length*z.length&&Math.abs(angleDiff(Math.atan2(dy,dx),z.angle))<z.width/2;
  if(inside){if(z.slow)R.enemySlowUntil=R.now+.35;if(z.dmg>0&&R.now>z.next){const before=Player.hp;Player.takeDamage(z.dmg);if(Player.hp<before){if(z.poison){R.playerPoisonUntil=R.now+3;R.playerPoisonNext=R.now+1;}if(z.hook){const dx=z.owner.x-Player.x,dy=z.owner.y-Player.y,len=Math.hypot(dx,dy)||1;const p=this.bounded(Player.x+dx/len*45,Player.y+dy/len*45);Player.x=p.x;Player.y=p.y;}}z.next=R.now+.8;}}
 }if(R.playerPoisonUntil>R.now&&R.now>=R.playerPoisonNext){Player.takeDamage(Math.max(1,Player.hpMax*.025));R.playerPoisonNext=R.now+1;}},
 draw(ctx,w2s,R){for(const z of R.hazards){const [x,y]=w2s(z.x,z.y),zoom=CAM.zoom,warning=R.now<z.start;ctx.save();ctx.translate(x,y);ctx.rotate(z.angle);ctx.strokeStyle=z.color;ctx.fillStyle=hexToRgba(z.color,warning?.08:.24);ctx.lineWidth=warning?2:3;ctx.setLineDash(warning?[5,5]:[]);ctx.beginPath();
  if(z.shape==='circle')ctx.arc(0,0,z.r*zoom,0,TAU);else if(z.shape==='line')ctx.rect(0,-z.width*zoom,z.length*zoom,z.width*2*zoom);else {ctx.moveTo(0,0);ctx.arc(0,0,z.length*zoom,-z.width/2,z.width/2);ctx.closePath();}ctx.fill();ctx.stroke();
  if(z.web){for(let a=0;a<8;a++){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a*TAU/8)*z.r*zoom,Math.sin(a*TAU/8)*z.r*zoom);ctx.stroke();}}
  ctx.restore();
 }},
};
