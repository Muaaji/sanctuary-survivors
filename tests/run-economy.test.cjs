'use strict';
const assert=require('node:assert/strict'),{createHarness}=require('./helpers/game-harness.cjs');
const h=createHarness(),E=h.sandbox.SurvivorRunEconomy;
assert.equal(E.xpToLevel(1),12);for(let level=2;level<=40;level++)assert.equal(E.xpToLevel(level),Math.round(10+level*4.5+Math.pow(level,1.12)*1.5));
assert.equal(E.xpToLevel(Infinity),12);assert.equal(E.xpToLevel(-3),12);assert.equal(E.levelCap,40);
const pool=h.run('SHOP_POOL');for(const item of pool){assert.equal(E.shopRules[item.id].cost,item.cost);assert.equal(E.shopRules[item.id].limit,item.limit);}
for(const vector of [{},{hp:5},{xp:5,elite:5},{hp:5,damage:5,speed:5,elite:5,xp:5,rate:5}]){h.sandbox.SurvivorHeat.activeRanks=vector;h.sandbox.SurvivorHeat.active=Object.values(vector).reduce((a,b)=>a+b,0);assert.deepEqual(JSON.parse(JSON.stringify(E.heatFactors(vector))),JSON.parse(JSON.stringify(h.sandbox.SurvivorHeat.factors())));}
assert.equal(E.heatReward({elite:5}),1.75);assert.equal(E.victoryEssence({}),5);assert.equal(E.victoryEssence({hp:5,damage:5,speed:5,elite:5,xp:5,rate:5}),27);
for(const id of Object.keys(E.metaRules)){h.run(`Meta.upgrades.${id}=5`);assert.equal(h.run(`metaBonus('${id}')`),E.metaBonus(id,5));}
h.run("Game.reset('sorceress');Game.state='playing'");const before=h.player.gold;h.run("collectPickup({type:'chest',x:1024,y:1024})");assert.equal(h.player.gold-before,E.chestGold);
console.log('PASS extracted six-minute economy matches current engine');

// Legal generated ancient gear must not exceed the aggregate combat budget.
const gear=createHarness(),G=gear.sandbox.SurvivorEquipment,cls='paladin';
const bases={head:'helm',neck:'amulet',shoulder:'pauldrons',torso:'plate',wrist:'bracers',hands:'gloves',ring1:'signet',ring2:'signet',legs:'greaves',feet:'boots',mainhand:'sword',offhand:'dagger'};
for(const [slot,baseId]of Object.entries(bases)){
 let available=G.affixes.map(a=>a.id),i=0;const desired=['dragon','tiger','wolf','eagle'];
 const rng=()=>{if(i===4)return .5;const ix=available.indexOf(desired[i++]),value=(ix+.1)/available.length;available.splice(ix,1);return value;};
 const item=G.generate({baseId,rarity:5,level:40,rng}),pos=G.insert(item).pos;assert.equal(G.equip(cls,pos,slot),true);
}
const raw=G.rawTotals(cls),effective=G.totals(cls);assert.ok(raw.power>G.gearCaps.power);assert.ok(raw.attackSpeed>G.gearCaps.attackSpeed);for(const [key,value]of Object.entries(effective)){assert.ok(value<=G.gearCaps[key]);assert.equal(value,Math.min(raw[key],G.gearCaps[key]));}
const stored=JSON.stringify(G.state.heroes[cls]);gear.run("Game.reset('paladin');Game.state='playing'");assert.equal(JSON.stringify(G.state.heroes[cls]),stored);assert.equal(gear.sandbox.SurvivorStats.get().power,G.gearCaps.power);assert.ok(gear.runtime.stats(gear.player.skills[0]).dmg<40);
G.save();G.load();assert.equal(JSON.stringify(G.state.heroes[cls]),stored);assert.deepEqual(JSON.parse(JSON.stringify(G.rawTotals(cls))),JSON.parse(JSON.stringify(raw)));assert.deepEqual(JSON.parse(JSON.stringify(G.totals(cls))),JSON.parse(JSON.stringify(effective)));
gear.run("Game.reset('paladin');Game.state='playing';Player.gainPassive('power');");assert.ok(gear.sandbox.SurvivorStats.get().power>G.gearCaps.power,'equipment cap must not swallow run passives');
console.log('PASS generated gear budget preserves rolls, saves and run bonuses');
const defense=createHarness(),D=defense.sandbox.SurvivorEquipment;
for(const [slot,baseId]of Object.entries(bases)){
 let available=D.affixes.map(a=>a.id),i=0;const desired=['bear','turtle','phoenix','owl'];
 const rng=()=>{if(i===4)return .5;const ix=available.indexOf(desired[i++]),value=(ix+.1)/available.length;available.splice(ix,1);return value;};
 const item=D.generate({baseId,rarity:5,level:40,rng});assert.ok(D.equip(cls,D.insert(item).pos,slot));
}
defense.run("Game.reset('paladin');Game.state='playing'");assert.equal(D.totals(cls).hp,80);assert.equal(D.totals(cls).armor,8);assert.equal(D.totals(cls).manaRegen,3);assert.equal(defense.player.hpMax,158);assert.equal(defense.sandbox.SurvivorStats.get().armor,11);assert.equal(defense.sandbox.SurvivorStats.get().manaRegen,5);assert.ok(D.rawTotals(cls).hp>900);console.log('PASS defensive full kit uses bounded HP, armor and regeneration');
