'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
function fixture(type='fallen',extra={}){
 const box={window:null,Game:{state:'playing'},Player:{x:100,y:0,r:10,hits:[],takeDamage(d){this.hits.push(d);}},enemies:[],SurvivorRuntime:{now:0,enemySlowUntil:0},CAM:{zoom:1},currentMapWorld:()=>null};box.window=box;vm.createContext(box);vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/survivors/enemy-roles.js'),'utf8'),box);const e={type,x:0,y:0,r:8,dmg:10,speed:48,dead:false,...extra};box.enemies.push(e);box.SurvivorEnemyRoles.configure(e,0,0);e.ssRole.next=0;return {box,e,R:box.SurvivorEnemyRoles};
}
function update(f,dt,time){f.box.SurvivorRuntime.now=time;f.R.update(dt,time);}
for(const pattern of [[1/30],[1/60],[1/120],[.011,.047,.023,.019]]){
 const f=fixture();update(f,.01,.01);const z=f.R.state.hazards[0];assert.equal(z.start-z.created,.8);f.box.Player.y=80;let time=.01,i=0;while(time<1.8-1e-9){const dt=Math.min(pattern[i++%pattern.length],1.8-time);time+=dt;update(f,dt,time);}
 assert.equal(f.box.Player.hits.length,0,'leaving announced corridor dodges');assert.ok(Math.abs(f.e.x-110)<1e-7);assert.equal(f.e.y,0,'direction stays fixed');assert.equal(f.e.ssRoleAction,undefined);assert.equal(f.R.state.hazards.length,0);
}
{
 const f=fixture('fireHound');update(f,.01,.01);assert.equal(f.R.state.hazards[0].start-0.01,1);update(f,1.3,1.31);assert.equal(f.box.Player.hits.length,1,'swept collision cannot tunnel');update(f,.1,1.41);assert.equal(f.box.Player.hits.length,1,'one damage application per charge');assert.equal(f.e.ssRoleAction.phase,'dash');update(f,.2,1.61);assert.equal(f.e.ssRoleAction.phase,'recovery');
}
{
 const f=fixture('fallen',{boss:true,ssChampion:true,r:22});update(f,.01,.01);assert.equal(f.R.state.hazards[0].width,22,'champion collision matches enlarged corridor');f.e.ssStopUntil=5;update(f,.1,.11);assert.equal(f.R.state.hazards.length,0);assert.equal(f.e.ssRoleAction,undefined,'hard control cancels dash');
}
{
 const f=fixture();update(f,.01,.01);f.e.ssSlow=.5;f.e.ssSlowUntil=5;update(f,1.4,1.41);assert.ok(Math.abs(f.e.x-55)<1e-9,'slow reduces charge travel rather than granting immunity');
}
for(const type of ['fungus','spider']){
 const f=fixture(type);update(f,.01,.01);const z=f.R.state.hazards[0];assert.equal(z.shape,'circle');assert.equal(z.start-z.created,1);update(f,.5,.51);assert.equal(f.box.Player.hits.length,0);f.box.Player.x=200;update(f,.6,1.11);assert.equal(f.box.Player.hits.length,0);assert.equal(f.box.SurvivorRuntime.enemySlowUntil,0,'leaving circle avoids web');
 const inside=fixture(type);update(inside,.01,.01);update(inside,1.01,1.02);if(type==='fungus')assert.equal(inside.box.Player.hits.length,1);else assert.ok(inside.box.SurvivorRuntime.enemySlowUntil>1.02);
}
{
 const f=fixture('serpent');update(f,.01,.01);const steer=f.e.ssRoleSteer;assert.ok(Math.abs(Math.hypot(steer.x,steer.y)-1)<1e-9);assert.notEqual(steer.y,0);assert.equal(f.e.x,0,'steering does not add a second movement');assert.equal(f.e.speed,48);
}
{
 const f=fixture('zombie');update(f,.01,.01);assert.equal(f.e.ssRole.kind,'bulwark');assert.equal(f.e.speed,48,'role preserves configured speed');assert.equal(f.R.state.hazards.length,0);for(const type of ['skeletonArcher','wraith']){const f=fixture(type);update(f,.01,.01);assert.equal(f.R.state.hazards.length,0,'archer/frost keep native mechanics');}
}
{
 const f=fixture();for(let i=0;i<25;i++){const e={type:'fireHound',x:Math.cos(i)*130,y:Math.sin(i)*130,r:8,dmg:10,speed:50};f.box.enemies.push(e);f.R.configure(e,3,0);e.ssRole.next=0;}update(f,.01,.01);assert.ok(f.R.state.hazards.length<=2,'global warnings capped');
 for(let i=0;i<7;i++)f.R.state.hazards.push({owner:f.e,shape:'circle',x:1000+i*100,y:1000,r:25,start:0,until:100,next:0,kind:'web'});f.e.ssRole.next=0;update(f,.01,.02);assert.ok(f.R.state.hazards.length<=8,'hazard budget');
 const before=JSON.stringify(f.R.state);f.box.Game.state='paused';update(f,20,100);assert.equal(JSON.stringify(f.R.state),before,'menus freeze roles');const e={type:'fallen'};f.R.configure(e,0,0);assert.equal(e.ssRole,undefined);
}
{
 const f=fixture();f.box.enemies.push({boss:true,type:'fallen'});update(f,.01,.01);assert.ok(f.R.state.hazards.length<=1,'real boss reduces ordinary warnings');f.e.dead=true;update(f,.1,.11);assert.equal(f.R.state.hazards.length,0);f.R.reset();assert.equal(f.R.state.serial,0);
}
{
 for(const speed of [20,100,500]){const f=fixture('fireHound',{speed,bossTempo:4});update(f,.01,.01);assert.equal(f.R.state.hazards[0].start,1.01,'warning does not shrink with difficulty');}
 const f=fixture();update(f,.01,.01);for(const menu of ['paused','equipment','talents','levelup','shop','settings']){f.box.Game.state=menu;const previous=JSON.stringify(f.R.state);update(f,10,20);assert.equal(JSON.stringify(f.R.state),previous,menu+' freezes role state');}
 const bounded=fixture('fireHound');bounded.box.currentMapWorld=()=>({w:100,h:100});bounded.box.Player.x=80;bounded.box.Player.y=80;bounded.e.x=50;bounded.e.y=40;update(bounded,.01,.01);const z=bounded.R.state.hazards[0];assert.ok(Math.abs(z.angle-Math.atan2(z.end.y-z.y,z.end.x-z.x))<1e-9,'bounded capsule draw follows actual collision segment');
}
console.log('PASS enemy roles: timing, dodge, movement, caps, control, menu freeze and native families');
