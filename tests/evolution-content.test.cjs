'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/survivors/evolution-content.js'),'utf8'),sandbox);
const api=sandbox.window.SurvivorEvolutionContent;
function input(id){const p=api.describe(id);return {id,group:'common',mode:'weapon',weaponKind:p.kind,evolved:true,dmg:135,radius:115,cd:.85,count:['axe','sling'].includes(p.kind)?1:2,pierce:p.kind==='crossbow'?3:p.kind==='axe'?2:0,ricochet:p.kind==='sling'?4:0,crit:.1,speed:360,mods:{}};}
test('ten distinct identities change coverage, cadence, traversal or volley',()=>{
 assert.equal(api.ids().length,10);const signatures=new Set();
 for(const id of api.ids()){const s=input(id),out=api.applyStats(s),p=api.describe(id);assert.equal(p.weaponRank,5);assert.equal(p.passiveRank,1);assert.ok(out.count!==1||out.radius!==100||out.pierce!==s.pierce||out.ricochet!==0||out.speed!==360||out.cd!==1);signatures.add(JSON.stringify([out.count,out.radius,out.pierce,out.ricochet,out.crit,out.speed,out.cd]));}
 assert.equal(signatures.size,10);
});
test('input and descriptor mutation do not mutate profiles or base weapons',()=>{
 for(const id of api.ids()){const s=input(id),before=JSON.stringify(s);api.applyStats(s);assert.equal(JSON.stringify(s),before);const base={...s,evolved:false};assert.equal(JSON.stringify(api.applyStats(base)),JSON.stringify(base));const d=api.describe(id);d.damage=99;assert.notEqual(api.describe(id).damage,99);}
 assert.equal(api.describe('missing'),null);
});
test('evolved ownership is required; class spells and mismatched kinds are untouched',()=>{
 const s=input('common_knives');assert.equal(api.finalStats({evolved:false},s).dmg,s.dmg);for(const patch of [{group:'assassin'},{mode:'projectile'},{weaponKind:'bow'}])assert.equal(api.applyStats({...s,...patch}).dmg,s.dmg);
});
test('finite bounds protect every transformed numeric channel and twelve projectile cap',()=>{
 for(const id of api.ids())for(const value of [NaN,Infinity,-Infinity,-999,999999]){const s=input(id);for(const key of ['dmg','radius','cd','count','pierce','ricochet','crit','speed'])s[key]=value;const out=api.applyStats(s);for(const key of ['dmg','radius','cd','count','pierce','ricochet','crit','speed'])assert.ok(Number.isFinite(out[key]));assert.ok(out.count>=1&&out.count<=12);assert.ok(out.pierce<=8&&out.ricochet<=8);assert.ok(out.crit<=.75&&out.cd>=.05);}
});
test('all ten catalogue recipes require maximum rank five and one matching passive rank',()=>{
 const data={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../js/survivors/catalog.js'),'utf8'),data);const c=data.window.SurvivorCatalogue;
 for(const id of api.ids()){assert.equal(c.spells[id].maxLevel,5);assert.equal(c.recipes[id].weapon,id);assert.equal(c.recipes[id].weaponRank,5);assert.equal(c.recipes[id].passiveRank,1);assert.ok(c.passives[c.recipes[id].passive]);}
});
