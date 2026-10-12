'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
function fixture(){
 const player={x:0,y:0,r:10,hp:100,hpMax:100,classId:'barbarian',skills:[],weapons:{},passives:{},takeDamage(){},heal(){}};
 const box={window:null,SurvivorCatalogue:{trees:{},spells:{}},Player:player,enemies:[],Keys:{},SurvivorStats:{get:()=>({power:0,melee:0,ranged:0,crit:0,critDamage:2,attackSpeed:0})},SurvivorBosses:{tick(){},locked:()=>false},Sound:{play(){}},chance:()=>false,spawnDamageNumber(){},killEnemy(){},dist2:(x,y,a,b)=>(x-a)**2+(y-b)**2,angleTo:(x,y,a,b)=>Math.atan2(b-y,a-x),VW:1000,VH:800,CAM:{zoom:1}};
 box.window=box;vm.createContext(box);vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/survivors/runtime.js'),'utf8'),box);box.SurvivorRuntime.reset();
 const enemy={x:30,y:0,r:10,hp:1e6,speed:0,dmg:0,t:0,flash:0,dead:false};box.enemies.push(enemy);
 return {R:box.SurvivorRuntime,enemy,box};
}
const rates=[['30Hz',[1/30]],['60Hz',[1/60]],['120Hz',[1/120]],['irregular',[.011,.047,.023,.019]]];
function simulate(R,total,pattern,fn){let elapsed=0,index=0;while(elapsed<total-1e-10){const dt=Math.min(pattern[index++%pattern.length],total-elapsed);R.now+=dt;fn(dt);elapsed+=dt;}}
function close(actual,expected,message){assert.ok(Math.abs(actual-expected)<1e-7,`${message}: ${actual} vs ${expected}`);}
for(const [label,pattern] of rates){
 let {R,enemy}=fixture();const ctx={id:'test',s:{id:'test',element:'poison',mods:{},crit:0}};
 R.dot(enemy,'poison','test',10,1.017,ctx);simulate(R,2,pattern,dt=>R.updateEnemies(dt));close(1e6-enemy.hp,10.17,label+' exact DoT lifetime');
 ({R,enemy}=fixture());enemy.knock={x:120,y:-35};simulate(R,1,pattern,dt=>R.updateEnemies(dt));close(enemy.x,30+120*(1-Math.pow(.86,60))/(60*.14),label+' recoil');close(enemy.knock.x,120*Math.pow(.86,60),label+' recoil velocity');
 ({R,enemy}=fixture());const s={id:'test',radius:100,duration:2,dmg:20,element:'fire',mods:{}};R.field(s,30,0,R.context(s),{grow:true});simulate(R,2.1,pattern,dt=>R.updateFields(dt));close(1e6-enemy.hp,40,label+' field ticks');assert.equal(R.fields.length,0);
 ({R,enemy}=fixture());enemy.x=300;enemy.speed=10;R.control(enemy,'stun',.317);R.control(enemy,'slow',.617,.5);simulate(R,1,pattern,dt=>R.updateEnemies(dt));close(enemy.x,300-10*(1-.317-(.617-.317)*.5),label+' control expiration movement');
 ({R,enemy}=fixture());R.stats=()=>({id:'pet',radius:100,allyHP:100,dmg:10,cd:.73,mods:{},crit:0});R.state=()=>({id:'pet'});R.allies.push({id:'pet',x:30,y:0,hp:100,hpMax:100,cd:.2,hits:0});simulate(R,10,pattern,dt=>R.updateAllies(dt));assert.equal(R.allies[0].hits,14,label+' companion cadence');
 ({R,enemy}=fixture());simulate(R,10,pattern,dt=>R.basicAttack(dt));close((1e6-enemy.hp)/7,8,label+' basic cadence');
 ({R,enemy}=fixture());let bolts=0;R.bullet=()=>bolts++;R.allies.push({id:'sorceress_hydra',x:0,y:0,hp:999,hpMax:999,turret:true,cd:.2,until:20,s:{id:'sorceress_hydra',radius:100,dmg:10,mods:{}}});simulate(R,10,pattern,dt=>R.updateAllies(dt));assert.equal(bolts,36,label+' turret cadence');
 console.log('PASS',label);
}
{
 const {R,enemy}=fixture(),s={id:'test',mods:{}};R.dot(enemy,'poison','a',10,1,{id:'test',s});R.now=2;R.dot(enemy,'poison','a',2,1,{id:'test',s});assert.equal(enemy.ssDots.length,1);assert.equal(enemy.ssDots[0].dps,2,'expired source must not retain previous potency');
}
console.log('Combat consistency passed');

{
 const {R,box}=fixture();box.Player.mana=50;box.SurvivorStats.manaCost=()=>10;const w={cd:0},s={id:'necromancer_skeletons',count:3,allyHP:100};R.companionTick(w,s);assert.equal(box.Player.mana,50);assert.equal(w.initialized,undefined);R.corpses.push({},{},{});R.companionTick(w,s);assert.equal(R.allies.length,3);assert.equal(box.Player.mana,40);
}
