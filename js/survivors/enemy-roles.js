/* Readable ordinary-enemy mechanics; separate from strength and Heat scaling. */
'use strict';
window.SurvivorEnemyRoles=(()=>{
 const families={fallen:'runner',zombie:'bulwark',ogre:'bulwark',undeadKnight:'bulwark',sandDemon:'bulwark',serpent:'flanker',fungus:'poison',spider:'web',fireHound:'charger',skeletonArcher:'archer',boneMage:'archer'};
 const colors={runner:'#f2cf75',charger:'#ffad73',poison:'#b4df71',web:'#e7ddd0'};
 const state={hazards:[],serial:0,now:0};
 const playing=()=>typeof Game!=='undefined'&&Game.state==='playing';
 const live=e=>e&&!e.dead&&(!e.boss||e.ssChampion);
 const distance=(x,y,a,b)=>Math.hypot(x-a,y-b);
 const bounds=(x,y)=>{const world=typeof currentMapWorld==='function'?currentMapWorld():null;return world?{x:Math.max(30,Math.min(world.w-30,x)),y:Math.max(30,Math.min(world.h-30,y))}:{x,y};};
 function reset(){for(const e of typeof enemies==='undefined'?[]:enemies){delete e.ssRole;delete e.ssRoleAction;delete e.ssRoleSteer;}state.hazards=[];state.serial=0;state.now=0;}
 function configure(e,act,time=0){
  if(!playing()||!live(e)||e.ssRole)return e;
  const id=++state.serial,kind=families[e.type]||'pursuer';
  e.ssRole={kind,act:Math.max(0,Math.min(4,act|0)),id,next:Math.max(0,time)+3+(id%5)*.55,side:id%2?1:-1};return e;
 }
 function slots(){const boss=typeof enemies!=='undefined'&&enemies.some(e=>!e.dead&&e.boss&&!e.ssChampion);return boss?1:2;}
 function pointToLine(x,y,z){const dx=z.end.x-z.x,dy=z.end.y-z.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((x-z.x)*dx+(y-z.y)*dy)/l)):0;return distance(x,y,z.x+t*dx,z.y+t*dy);}
 function announce(e,now){
  const role=e.ssRole,charge=['runner','charger'].includes(role.kind),warning=role.kind==='runner'?.8:1;
  if(state.hazards.length>=8||state.hazards.filter(z=>now<z.start||z.shape==='line').length>=slots())return false;
  // Do not stack circles over the same escape point or intersect existing charge corridors.
  const target={x:Player.x,y:Player.y},range=role.kind==='charger'?150:110,r=(role.kind==='web'?30:26)+Math.max(0,e.r-8);
  const angle=Math.atan2(target.y-e.y,target.x-e.x),end=bounds(e.x+Math.cos(angle)*range,e.y+Math.sin(angle)*range);
  if(state.hazards.some(z=>(z.shape==='line'?pointToLine(target.x,target.y,z):distance(z.x,z.y,target.x,target.y))<(z.r||z.width||20)+r+35))return false;
  const z={owner:e,kind:role.kind,shape:charge?'line':'circle',x:charge?e.x:target.x,y:charge?e.y:target.y,r,width:e.r,angle:charge?Math.atan2(end.y-e.y,end.x-e.x):angle,end,start:now+warning,created:now,until:now+warning+(charge?.9:role.kind==='web'?2:1.6),next:now+warning,hit:false};
  state.hazards.push(z);e.ssRoleAction={phase:'warning',x:e.x,y:e.y,start:z.start,until:z.until};role.next=now+(charge?7:9);return true;
 }
 function segmentHit(ax,ay,bx,by,r){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((Player.x-ax)*dx+(Player.y-ay)*dy)/l)):0;return distance(ax+t*dx,ay+t*dy,Player.x,Player.y)<=r+Player.r;}
 function update(dt,time){
  if(!playing()||!Number.isFinite(dt)||dt<=0||typeof enemies==='undefined')return;
  const now=Number.isFinite(time)?Math.max(0,time):state.now+dt;state.now=now;
  for(const e of enemies)if(!e.ssRole)configure(e,window.SurvivorActs?.index||0,now);
  for(let i=state.hazards.length-1;i>=0;i--){
   const z=state.hazards[i],e=z.owner,action=e.ssRoleAction;
   if(!live(e)){delete e.ssRoleAction;state.hazards.splice(i,1);continue;}
   if(z.shape==='line'){
    const from=Math.max(z.start,now-dt),to=Math.min(now,z.start+.5),active=Math.max(0,to-from);
    const slowed=Math.max(0,Math.min(to,e.ssSlowUntil||0)-from),a=z.progress||0;
    const b=Math.min(1,a+(active-slowed*Math.min(e.ssChampion?.35:e.boss?.15:1,e.ssSlow||0))/.5);z.progress=b;
    const ax=z.x+(z.end.x-z.x)*a,ay=z.y+(z.end.y-z.y)*a,bx=z.x+(z.end.x-z.x)*b,by=z.y+(z.end.y-z.y)*b;
    // A frozen runner cancels its announced dash, rather than gaining control immunity.
    if((e.ssStopUntil||0)>(window.SurvivorRuntime?.now||now)){delete e.ssRoleAction;state.hazards.splice(i,1);continue;}
    e.x=bx;e.y=by;if(action)action.phase=now<z.start?'warning':now<z.start+.5?'dash':'recovery';
    if(now>=z.start&&!z.hit&&segmentHit(ax,ay,bx,by,z.width)){Player.takeDamage(e.dmg);z.hit=true;}
   }else{
    if(action&&now<z.start){e.x=action.x;e.y=action.y;}
    else delete e.ssRoleAction;
    if(now>=z.start&&now<z.until&&distance(Player.x,Player.y,z.x,z.y)<=z.r+Player.r){
     if(z.kind==='web'&&window.SurvivorRuntime)SurvivorRuntime.enemySlowUntil=Math.max(SurvivorRuntime.enemySlowUntil,SurvivorRuntime.now+.35);
     if(z.kind==='poison'&&now>=z.next){Player.takeDamage(e.dmg*.3);z.next+=.8;}
    }
   }
   if(now>=z.until){delete e.ssRoleAction;state.hazards.splice(i,1);}
  }
  for(const e of enemies){
   delete e.ssRoleSteer;
   if(!live(e)||!e.ssRole||e.ssRoleAction)continue;
   const role=e.ssRole,d=distance(e.x,e.y,Player.x,Player.y);
   if(role.kind==='flanker'&&d>70&&d<260){const dx=(Player.x-e.x)/d,dy=(Player.y-e.y)/d,n=Math.hypot(1,.65);e.ssRoleSteer={x:(dx-dy*.65*role.side)/n,y:(dy+dx*.65*role.side)/n};}
   if(!['runner','charger','poison','web'].includes(role.kind)||now<role.next||d>250||d<35||(e.ssStopUntil||0)>(window.SurvivorRuntime?.now||now))continue;
   if(!announce(e,now))role.next=now+.6;
  }
 }
 function draw(ctx,w2s){
  if(typeof enemies==='undefined')return;const zoom=typeof CAM==='undefined'?1:CAM.zoom;
  for(const z of state.hazards){if(!live(z.owner))continue;const [x,y]=w2s(z.x,z.y),warning=state.now<z.start;
   ctx.save();ctx.translate(x,y);ctx.strokeStyle=colors[z.kind];ctx.fillStyle=z.kind==='poison'?'rgba(180,223,113,.15)':z.kind==='web'?'rgba(231,221,208,.12)':'rgba(255,180,100,.12)';ctx.lineWidth=2;ctx.setLineDash(warning?[5,4]:[]);ctx.beginPath();
   if(z.shape==='line'){ctx.rotate(z.angle);const length=distance(z.x,z.y,z.end.x,z.end.y)*zoom;const width=z.width*zoom;ctx.moveTo(0,-width);ctx.lineTo(length,-width);ctx.arc(length,0,width,-Math.PI/2,Math.PI/2);ctx.lineTo(0,width);ctx.arc(0,0,width,Math.PI/2,Math.PI*1.5);ctx.closePath();}
   else ctx.arc(0,0,z.r*zoom,0,Math.PI*2);
   ctx.fill();ctx.stroke();
   if(z.kind==='web')for(let n=0;n<6;n++){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(n*Math.PI/3)*z.r*zoom,Math.sin(n*Math.PI/3)*z.r*zoom);ctx.stroke();}
   ctx.restore();
  }
 }
 return {reset,configure,update,draw,families,state};
})();
