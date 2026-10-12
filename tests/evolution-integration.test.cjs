'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createHarness}=require('./helpers/game-harness.cjs');
function fixture(id){const h=createHarness();h.run("Game.reset('sorceress');Game.state='playing';Sound.enabled=false");h.player.skills=[];h.player.weapons={};h.player.gainWeapon(id);const w=h.runtime.state(id);w.level=5;return {...h,w};}
function enemy(h,x=100,y=0){const e={x:h.player.x+x,y:h.player.y+y,r:10,hp:10000,speed:0,dmg:0,dead:false,flash:0};h.enemies.push(e);return e;}
test('browser scripts load evolution module and apply profiles exactly once through real stats',()=>{
 for(const id of ['common_knives','common_axes','common_embers','common_blades','common_flasks','common_frost','common_storm','common_seal','common_skulls','common_comets']){
 const h=fixture(id),api=h.sandbox.SurvivorEvolutionContent;assert.ok(api,'index must load module before runtime');const before=h.runtime.stats(h.w);h.w.evolved=true;const out=h.runtime.stats(h.w),p=api.describe(id);assert.ok(Math.abs(out.dmg-before.dmg*p.damage)<1e-8,id+' damage applied once');assert.ok(Math.abs(out.cd-before.cd*p.cooldown)<1e-8,id+' cooldown applied once');assert.equal(out.count,Math.min(12,before.count+p.count));assert.ok(Math.abs(out.radius-before.radius*p.area)<1e-8);}
});
test('real offers require five plus one, guarantee ultimate next level, and preserve slot caps',()=>{
 for(const id of ['common_knives','common_axes','common_embers','common_blades','common_flasks','common_frost','common_storm','common_seal','common_skulls','common_comets']){
 const h=fixture(id),recipe=h.sandbox.SurvivorCatalogue.recipes[id];h.w.level=4;h.player.passives[recipe.passive]=1;assert.equal(h.runtime.ultimateEligible(id),false);h.w.level=5;h.player.passives[recipe.passive]=0;assert.equal(h.runtime.ultimateEligible(id),false);h.player.passives[recipe.passive]=1;const offer=h.run('buildUpgradeOptions()').find(o=>o.kind==='ultimate'&&o.id===id);assert.ok(offer);assert.equal(h.run('applyUpgrade')(offer),true);assert.equal(h.runtime.ultimateEligible(id),false);assert.equal(h.run('applyUpgrade')(offer),false);assert.equal(Object.keys(h.player.weapons).length,1);
 }
 const h=fixture('common_knives');for(const id of Object.keys(h.sandbox.SurvivorCatalogue.recipes))h.player.gainWeapon(id);for(const d of Object.values(h.sandbox.SurvivorCatalogue.spells).filter(d=>d.group==='sorceress'))h.player.gainClassSkill(d.id);assert.equal(Object.keys(h.player.weapons).length,3);assert.equal(h.player.skills.length,3);
});
test('dagger and crossbow actually create piercing projectiles; sling creates bounded rebounding ones',()=>{
 for(const id of ['common_knives','common_frost','common_skulls']){const h=fixture(id);h.w.evolved=true;const e=enemy(h),s=h.runtime.stats(h.w);h.runtime.castWeapon(h.w,s,h.player,e,0);assert.equal(h.runtime.bullets.length,s.count);for(const b of h.runtime.bullets){assert.equal(b.pierce,s.pierce);assert.equal(b.ricochet,s.ricochet);assert.ok(b.hitSet instanceof Set||Object.prototype.toString.call(b.hitSet)==='[object Set]');}assert.ok(s.count<=12);}
});
test('mace schedules its follow-up at 0.12 seconds and spear extends actual hit reach',()=>{
 const h=fixture('common_seal');h.w.evolved=true;const e=enemy(h,20),s=h.runtime.stats(h.w);h.runtime.castWeapon(h.w,s,h.player,e,0);assert.equal(h.runtime.jobs.length,2);assert.ok(Math.abs(h.runtime.jobs[1].at-h.runtime.now-.12)<1e-8);
 const spear=fixture('common_flasks'),base=spear.runtime.stats(spear.w);const target=enemy(spear,base.radius*1.3);spear.w.evolved=true;const evolved=spear.runtime.stats(spear.w);spear.runtime.castWeapon(spear.w,evolved,spear.player,target,0);spear.runtime.jobs.splice(0).forEach(j=>j.fn());assert.ok(target.hp<10000,'extended estocade reaches target beyond base radius');
});
test('flail tick uses orbit with three masses and creates no cast jobs',()=>{
 const h=fixture('common_comets');h.w.evolved=true;const s=h.runtime.stats(h.w);assert.equal(s.count,3);let orbits=0,casts=0;h.runtime.orbit=(w,current)=>{orbits++;assert.equal(current.count,3);};h.runtime.castWeapon=()=>casts++;h.runtime.tick(.01);assert.equal(orbits,1);assert.equal(casts,0);assert.equal(h.runtime.jobs.length,0);
});
test('orbital masses hit enemies at their real positions with a bounded per-source cooldown',()=>{
 const h=fixture('common_comets');h.w.evolved=true;const s=h.runtime.stats(h.w),r=s.radius*1.2,angle=.25;const e=enemy(h,Math.cos(angle)*r,Math.sin(angle)*r);h.runtime.orbit(h.w,s,.1);assert.ok(e.hp<10000);const hp=e.hp;h.runtime.orbit(h.w,s,0);assert.equal(e.hp,hp,'same-frame orbit cannot hit repeatedly');assert.equal(h.runtime.jobs.length,0);assert.equal(h.runtime.bullets.length,0);
});
