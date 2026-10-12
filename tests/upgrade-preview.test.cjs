'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createHarness}=require('./helpers/game-harness.cjs');
const h=createHarness({seed:123}),{sandbox:c,player:p,runtime:R,run}=h;
if(!c.SurvivorUpgradePreview)vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../js/survivors/upgrade-preview.js'),'utf8'),c);
const describe=opt=>c.SurvivorUpgradePreview.describe(opt);
function reset(cls){run(`Game.reset('${cls}');Game.state='playing';`);}
const numeric=n=>Number(n.toFixed(2)).toLocaleString('fr-FR');
reset('paladin');p.gainClassSkill('paladin_shield');R.state('paladin_shield').level=5;
const shield=describe({kind:'ultimate',id:'paladin_shield',level:5});
assert.ok(shield.includes('Absorption'));assert.ok(shield.includes(numeric(p.hpMax*.15*1.6*1.5)+' PV'));
reset('necromancer');p.gainClassSkill('necromancer_curse');R.state('necromancer_curse').level=5;
assert.ok(describe({kind:'ultimate',id:'necromancer_curse',level:5}).includes('25 → 40 %'));
reset('assassin');p.gainClassSkill('assassin_venom');
assert.ok(describe({kind:'class',id:'assassin_venom',level:2}).includes('dégâts/s'));
reset('amazon');p.gainClassSkill('amazon_plague');
assert.ok(describe({kind:'class',id:'amazon_plague',level:2}).includes('Poison du nuage'));
assert.ok(describe({kind:'class',id:'amazon_plague',level:2}).includes(numeric(R.stats({id:'amazon_plague',level:2}).dmg*.5)+' dégâts/s'));
reset('druid');p.gainClassSkill('druid_wolves');
assert.ok(describe({kind:'class',id:'druid_wolves',level:2}).includes('PV par compagnon'));
assert.ok(describe({kind:'class',id:'druid_wolves',level:2}).includes('Mana 0 → 0'));
reset('sorceress');
const before=JSON.stringify({player:p,talents:[...R.talents],knowledge:c.SurvivorKnowledge.entries,storage:[...h.storage]});
for(const d of Object.values(c.SurvivorCatalogue.spells))for(const kind of ['class','weapon','ultimate']){
 const preview=describe({kind,id:d.id,level:5});assert.ok(preview.length>0);assert.ok(!/NaN|Infinity|DPS/.test(preview),d.id);
}
for(const id of Object.keys(c.SurvivorCatalogue.passives))assert.ok(describe({kind:'passive',id,level:1}).includes('→'),id);
assert.equal(JSON.stringify({player:p,talents:[...R.talents],knowledge:c.SurvivorKnowledge.entries,storage:[...h.storage]}),before);
assert.equal(describe({kind:'class',id:'unknown'}),'');
assert.ok(describe({kind:'class',id:'sorceress_fireball',level:2}).includes(numeric(R.stats({id:'sorceress_fireball',level:2}).cd)+' s'));
p.passives.crit=5;c.SurvivorEquipment.totals=()=>({crit:.8});
assert.ok(describe({kind:'passive',id:'crit',level:5}).includes('75 → 75 %'));
console.log('PASS upgrade previews: special units, actual formulas, caps and read-only state');
