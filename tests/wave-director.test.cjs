'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const box={window:null,Game:{state:'playing'},SurvivorActs:{index:0},messages:[],toast(v){box.messages.push(v);}};box.window=box;vm.createContext(box);vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/survivors/wave-director.js'),'utf8'),box);const D=box.SurvivorWaveDirector;
const base={rate:3.2,elite:.04,maxEnemies:180,maxHostileProjectiles:80};
function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
for(let act=0;act<5;act++){
 const early=D.config(act,0,base),later=D.config(act,60,base);assert.equal(early.types.length,2,'two-family learning window');assert.ok(later.types.length>=3);assert.equal(D.config(act,59.99,base).phase,'learning');assert.equal(later.phase,'mixed');
 for(const t of [0,90,180,300,10000]){const c=D.config(act,t,base);assert.equal(c.rate,base.rate);assert.equal(c.elite,base.elite);assert.equal(c.maxEnemies,180);assert.equal(c.maxHostileProjectiles,80);assert.ok(c.types.every(type=>type in D.roles));}
 const event=D.config(act,180,base);assert.equal(event.event.id,'signature');assert.equal(event.event.end-event.event.start,20);assert.ok(event.weights[event.event.prefer]>D.config(act,200,base).weights[event.event.prefer]);assert.equal(D.config(act,200,base).event,null);
 const live=[];for(const [type,role] of Object.entries(D.roles))if(role in later.roleCaps&&!later.fodder.includes(type))for(let i=0;i<later.roleCaps[role];i++)live.push({type});
 // Population retains only this act's roster, keeping the total below the global cap.
 const own=live.filter(e=>later.types.includes(e.type));for(let n=0;n<20;n++)assert.ok(later.fodder.includes(D.choose(later,own,()=>n/20)),'capped specialists fall back to forage');
 assert.equal(D.choose(later,Array.from({length:180},()=>({type:later.fodder[0]})),()=>0),null);
 const r1=rng(42),r2=rng(42);assert.equal(JSON.stringify(Array.from({length:100},()=>D.choose(later,[],r1))),JSON.stringify(Array.from({length:100},()=>D.choose(later,[],r2))),'seeded RNG reproducible');
}
{
 const c=D.config(4,70,base),live=Array.from({length:8},()=>({type:'skeletonArcher'}));assert.notEqual(D.choose(c,live,()=>.99),'skeletonArcher');assert.equal(D.choose(c,live.map(e=>({...e,boss:true,ssChampion:true})),()=>.2),'skeletonArcher','champions excluded from specialist counts');
 const smaller=D.config(0,100,{...base,maxEnemies:90});assert.equal(smaller.roleCaps.runner,10);assert.equal(smaller.roleCaps.tank,6);assert.equal(D.config(2,60,base).names.zombie,'Hôte des spores');assert.equal(D.config(4,60,base).names.skeleton,'Sentinelle gelée');
}
{
 D.reset();D.update(0);assert.equal(box.messages.length,0);D.update(90);D.update(91);assert.equal(box.messages.length,1);D.update(180);D.update(181);assert.equal(box.messages.length,2);D.update(300);D.update(301);assert.equal(box.messages.length,3);D.update(400);assert.equal(box.messages.length,3,'no repeated or expired-event toasts');
 box.Game.state='paused';const previous=JSON.stringify(D.state);D.update(180);assert.equal(JSON.stringify(D.state),previous);box.Game.state='playing';D.update(0);D.update(180);assert.equal(box.messages.length,4,'new run re-announces signature once');
}
console.log('PASS wave director: phases, roster, budgets, fallback, RNG, bounded events and pause');
