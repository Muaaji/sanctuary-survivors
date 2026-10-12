'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../js/survivors/run-omens.js'),'utf8');
function setup(cls='druid'){
  let draws=0,next=0;
  const c={Player:{classId:cls},SurvivorRunRng:{random(stream){assert.equal(stream,'offers');draws++;const r=next;next=0;return r;}},SurvivorEncounters:{state:{runId:4,encounters:[120,240,360].map((at,i)=>({id:'boss-'+i,at,final:i===2,defeated:true,entity:{dead:true,encounterRunId:4}}))}}};
  c.window=c;vm.runInNewContext(source,c);const O=c.SurvivorRunOmens;
  return {c,O,draws:()=>draws,acquire(id,n){const pool=O.list().filter(d=>!O.owned.some(o=>o.id===d.id));next=(pool.findIndex(d=>d.id===id)+.1)/pool.length;assert.equal(O.earn('boss-'+n),true);assert.ok(O.choices().some(d=>d.id===id));assert.equal(O.choose(id),true);}};
}
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const {c,O,draws}=setup();
assert.equal(O.earn('unknown'),false);assert.equal(O.earn('boss-2'),false);
c.SurvivorEncounters.state.encounters[0].defeated=false;assert.equal(O.earn('boss-0'),false);
c.SurvivorEncounters.state.encounters[0].defeated=true;c.SurvivorEncounters.state.encounters[0].entity.dead=false;assert.equal(O.earn('boss-0'),false);
c.SurvivorEncounters.state.encounters[0].entity.dead=true;c.SurvivorEncounters.state.encounters[0].entity.encounterRunId=3;assert.equal(O.earn('boss-0'),false);
c.SurvivorEncounters.state.encounters[0].entity.encounterRunId=4;
assert.equal(O.earn('boss-0'),true);assert.equal(O.earn('boss-0'),false);
const first=JSON.stringify(O.choices()),used=draws();assert.equal(O.choices().length,3);assert.equal(new Set(O.choices().map(d=>d.id)).size,3);
O.choices()[0].name='mutated';assert.equal(O.defer(),true);assert.equal(O.pending,true);assert.equal(O.deferred,true);assert.equal(JSON.stringify(O.choices()),first);assert.equal(draws(),used);
assert.equal(O.choose('unknown'),false);assert.equal(O.earn('boss-1'),true);assert.equal(JSON.stringify(O.choices()),first);
const chosen=O.choices()[0].id;assert.equal(O.choose(chosen),true);assert.equal(O.deferred,false);assert.equal(O.pending,true);assert.ok(O.choices().every(d=>d.id!==chosen));
assert.equal(O.choose(O.choices()[0].id),true);assert.equal(O.owned.length,2);assert.equal(O.pending,false);assert.equal(O.earn('boss-1'),false);assert.equal(O.choose(chosen),false);
const beforeReset=draws();O.reset();assert.equal(draws(),beforeReset);assert.equal(O.owned.length,0);assert.equal(O.pending,false);assert.equal(O.deferred,false);assert.equal(O.choices().length,0);assert.equal(draws(),beforeReset);
for(const cls of ['amazon','necromancer','druid','assassin','paladin','barbarian','sorceress']){const {O}=setup(cls);assert.equal(O.list().some(d=>d.id==='guide_pact'),['amazon','necromancer','druid','assassin'].includes(cls));assert.ok(O.list().length>=7);}
const sample={group:'common',mode:'weapon',weaponKind:'sword',element:'physical',dmg:100,cd:2,radius:100,duration:4,crit:.73,count:12,speed:440};
const checks={iron_thread:s=>{close(s.dmg,118);close(s.radius,88);},inner_ember:s=>{close(s.dmg,118);close(s.cd,2.24);},split_eye:s=>{close(s.dmg,90);close(s.crit,.75);},devouring_circle:s=>{close(s.dmg,88);close(s.radius,118);},guide_pact:s=>{close(s.dmg,118);close(s.cd,2.24);},sealed_hourglass:s=>{close(s.dmg,90);close(s.duration,4.72);},short_beat:s=>{close(s.cd,1.7);close(s.radius,88);},burning_stride:s=>{close(s.dmg,90);}};
for(const [id,check] of Object.entries(checks)){
  const t=setup();t.acquire(id,0);const input={...sample,...(id==='inner_ember'?{element:'fire'}:{}),...(id==='guide_pact'?{mode:'companion'}:{})};const saved=JSON.stringify(input),s=t.O.applyStats(input);
  check(s);assert.equal(JSON.stringify(input),saved);assert.notEqual(s,input);assert.equal(s.count,12);assert.equal(s.speed,440);
  close(t.O.applyPlayerSpeed(200),id==='burning_stride'?230:200);
}
// Every pair remains bounded, including magic companions and common elemental weapons.
const ids=Object.keys(checks);
for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
  const t=setup();t.acquire(ids[i],0);t.acquire(ids[j],1);
  for(const input of [sample,{...sample,element:'fire'},{...sample,mode:'companion',element:'fire'}]){const s=t.O.applyStats(input);assert.ok(s.dmg<=135);assert.ok(s.cd>=1);assert.ok(s.crit<=.75);assert.equal(s.count,12);}
}
const t=setup();t.acquire('short_beat',0);assert.equal(t.O.applyStats({...sample,mode:'hammer',weaponKind:undefined}).cd,2);
console.log('PASS run omens: champion eligibility, stable offers, deferred queue, two cap, classes, reset, tradeoffs and all pairs');
