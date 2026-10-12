'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createHarness}=require('./helpers/game-harness.cjs');
const h=createHarness({seed:44}),{sandbox:c,player:p,runtime:R,run}=h;
if(!c.SurvivorBuildCombos)vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../js/survivors/build-combos.js'),'utf8'),c);
const B=c.SurvivorBuildCombos;
const classes=Object.keys(c.SurvivorCatalogue.trees);
for(const cls of classes){
 run(`Game.reset('${cls}');Game.state='playing';`);B.reset();
 const [d]=B.list(cls);assert.ok(d);assert.equal(B.list(cls).length,1);assert.notEqual(d.source,d.target);
 assert.ok(!c.SurvivorCatalogue.synergies.some(s=>s.from===d.source&&s.to===d.target||s.from===d.target&&s.to===d.source));
 assert.equal(B.active().length,0);assert.equal(B.onCast({id:d.source}),false);
 // Populate inventory directly so the test covers the combo API even after its runtime hook is installed.
 p.skills=[d.source,d.target].map(id=>({id,level:3,def:c.SurvivorCatalogue.spells[id]}));
 for(const forbidden of ['secondary','periodic','ally']){assert.equal(B.onCast({id:d.source},{[forbidden]:true}),false);assert.equal(B.onCast({id:d.source,[forbidden]:true}),false);}
 assert.equal(B.active().length,1);assert.equal(B.onCast({id:d.target}),false);assert.equal(B.onCast({id:d.source}),true);
 assert.equal(B.onCast({id:d.source}),false);
 assert.equal(Object.keys(B.statsBonus({id:d.source})).length,0);
 const bonus=B.statsBonus({id:d.target});assert.equal(Object.keys(bonus).length,1);
 for(const [key,value]of Object.entries(bonus))assert.ok(value>0&&value<=({crit:.05,damage:.1,radius:.12}[key]));
 const base={id:d.target,dmg:100,radius:100,crit:.74},adjusted=B.apply(base);
 assert.equal(base.dmg,100);assert.equal(base.radius,100);assert.equal(base.crit,.74);
 assert.ok(adjusted.dmg<=110.000001);assert.ok(adjusted.radius<=112.000001);assert.ok(adjusted.crit<=.75);
 R.now=2;assert.equal(Object.keys(B.statsBonus({id:d.target})).length,0);assert.equal(B.onCast({id:d.source}),false);
 R.now=6;assert.equal(B.onCast({id:d.source}),true);
 p.skills[1].level=2;assert.equal(Object.keys(B.statsBonus({id:d.target})).length,0);assert.equal(B.active().length,0);
 p.skills[1].level=3;
 const before=JSON.stringify({skills:p.skills,talents:[...R.talents],knowledge:c.SurvivorKnowledge.entries});
 B.active();B.list();B.preview(d.id);B.statsBonus({id:d.target});
 assert.equal(JSON.stringify({skills:p.skills,talents:[...R.talents],knowledge:c.SurvivorKnowledge.entries}),before);
 B.reset();assert.equal(Object.keys(B.statsBonus({id:d.target})).length,0);
 const mutable=B.list(cls);mutable[0].bonus.damage=999;assert.ok((B.list(cls)[0].bonus.damage||0)<=.1);
 assert.ok(B.preview(d.id).includes('rang 3'));
}
assert.equal(B.list('unknown').length,0);assert.equal(B.preview('unknown'),'');assert.equal(B.onCast(null),false);
console.log('PASS 7 build combos: requirements, direct sources, shared cooldown, expiry, caps and read-only previews');
