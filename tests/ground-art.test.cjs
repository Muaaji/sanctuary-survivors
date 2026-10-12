'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const sandbox={};sandbox.window=sandbox;vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/survivors/ground-art.js'),'utf8'),sandbox);
const G=sandbox.SurvivorGroundArt;
function context(){const calls=[],stack=[];const ctx={globalAlpha:.7,strokeStyle:'initial',fillStyle:'initial',lineWidth:5,imageSmoothingEnabled:true};
 for(const method of ['beginPath','arc','rect','moveTo','lineTo','closePath','fill','stroke','clip','fillRect','translate','rotate','setLineDash'])ctx[method]=(...args)=>calls.push({method,args,alpha:ctx.globalAlpha,stroke:ctx.strokeStyle});
 ctx.save=()=>stack.push({...ctx});ctx.restore=()=>{const old=stack.pop();for(const key of ['globalAlpha','strokeStyle','fillStyle','lineWidth','imageSmoothingEnabled'])ctx[key]=old[key];};return {ctx,calls,stack};}
const base={x:50,y:80,shape:'circle',r:40,length:120,width:12,start:2,created:0,color:'#ee934d'};
for(const shape of ['circle','line','cone','capsule']){
 const {ctx,calls,stack}=context(),z={...base,shape,width:shape==='cone'?1.2:12},saved=JSON.stringify(z);
 G.draw(ctx,z,(x,y)=>[x*2,y*2],1,2);assert.equal(JSON.stringify(z),saved);assert.equal(stack.length,0);assert.equal(ctx.globalAlpha,.7);assert.equal(ctx.strokeStyle,'initial');assert.equal(ctx.imageSmoothingEnabled,true);
 assert.ok(calls.some(c=>c.method==='clip'));assert.ok(calls.filter(c=>c.method==='setLineDash').every(c=>c.args[0].length===0));assert.ok(calls.filter(c=>c.method==='fillRect').length<=103);
 const outer=calls.filter(c=>c.method==='arc'||c.method==='rect');
 if(shape==='circle')assert.deepEqual(outer[0].args,[0,0,80,0,Math.PI*2]);
 if(shape==='line')assert.deepEqual(outer[0].args,[0,-24,240,48]);
 if(shape==='cone')assert.deepEqual(outer[0].args,[0,0,240,-.6,.6]);
 if(shape==='capsule'){assert.deepEqual(outer[0].args,[240,0,24,-Math.PI/2,Math.PI/2]);assert.ok(outer.some(c=>c.args[0]===0&&c.args[2]===24));}
 assert.deepEqual(calls.find(c=>c.method==='translate').args,[100,160]);
}
const early=context(),late=context(),active=context();G.draw(early.ctx,base,(x,y)=>[x,y],.2);G.draw(late.ctx,base,(x,y)=>[x,y],1.8);G.draw(active.ctx,base,(x,y)=>[x,y],2);
const progressArc=c=>c.calls.find(c=>c.method==='arc'&&c.args[2]===40*.86).args[4];assert.ok(progressArc(late)>progressArc(early));assert.ok(active.calls.find(c=>c.method==='fill').alpha>late.calls.find(c=>c.method==='fill').alpha);
for(const [props,family] of [[{web:true},'web'],[{poison:true},'poison'],[{kind:'charger'},'fire'],[{color:'#a784c9'},'arcane'],[{color:'#da7459'},'earth']])assert.equal(G.family(props),family);
const plain=context(),web=context(),poison=context();G.draw(plain.ctx,{...base,color:'#da7459'},(x,y)=>[x,y],2);G.draw(web.ctx,{...base,web:true},(x,y)=>[x,y],2);G.draw(poison.ctx,{...base,poison:true},(x,y)=>[x,y],2);
assert.ok(web.calls.filter(c=>c.method==='lineTo').length>plain.calls.filter(c=>c.method==='lineTo').length);assert.ok(poison.calls.filter(c=>c.method==='fillRect').length>plain.calls.filter(c=>c.method==='fillRect').length);
// Grain never consumes the run RNG, and both enemy renderers delegate without changing mechanics.
assert.ok(!fs.readFileSync(path.join(__dirname,'../js/survivors/ground-art.js'),'utf8').includes('Math.random'));
for(const filename of ['bosses.js','enemy-roles.js']){const text=fs.readFileSync(path.join(__dirname,'../js/survivors',filename),'utf8');assert.ok(text.includes('SurvivorGroundArt'));assert.ok(!text.includes('setLineDash'));}
const {createHarness}=require('./helpers/game-harness.cjs'),h=createHarness(),s=h.sandbox,R=h.runtime;
h.run("Game.reset('sorceress');Game.state='playing';updateProgress(360)");
const recorded=[],renderer=s.SurvivorGroundArt.draw;s.SurvivorGroundArt.draw=(ctx,z,w2s,now,zoom)=>recorded.push({z,now,zoom});
const boss=s.SurvivorEncounters.state.final;R.now=4;s.SurvivorBosses.tick(boss,.1,R);const hazard=R.hazards[0],snapshot=JSON.stringify({start:hazard.start,end:hazard.end,dmg:hazard.dmg,width:hazard.width,length:hazard.length});s.SurvivorBosses.draw(context().ctx,(x,y)=>[x,y],R);assert.ok(recorded.some(item=>item.z===hazard));assert.equal(JSON.stringify({start:hazard.start,end:hazard.end,dmg:hazard.dmg,width:hazard.width,length:hazard.length}),snapshot);assert.equal(hazard.created,4);
const runner=h.run("spawnEnemy('fallen',900,1024)");s.SurvivorEnemyRoles.state.hazards=[{owner:runner,shape:'line',kind:'runner',x:900,y:1024,end:{x:1010,y:1024},r:26,width:runner.r,angle:0,start:5,created:4}];s.SurvivorEnemyRoles.draw(context().ctx,(x,y)=>[x,y]);assert.ok(recorded.some(item=>item.z.shape==='capsule'&&item.z.length===110));s.SurvivorGroundArt.draw=renderer;
console.log('PASS ground art: exact footprints, continuous contours, bounded grain, windup, active state, web/poison, context restoration and live boss/enemy delegation');
