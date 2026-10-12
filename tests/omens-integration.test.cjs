'use strict';
const assert=require('node:assert/strict'),{createHarness}=require('./helpers/game-harness.cjs');
const h=createHarness({seed:'omens-integration'}),{sandbox:s,game:g,player:p,runtime:R,document:d}=h,O=s.SurvivorRunOmens;
const reset=()=>h.run("Game.reset('sorceress');Game.state='playing'");
const killFirst=()=>{h.run('updateProgress(120)');const e=s.SurvivorEncounters.state.encounters[0].entity;R.damage(e,1e9,{periodic:true});return e;};
reset();const e=killFirst();assert.equal(g.state,'omens');assert.equal(O.pending,true);
const box=d.getElementById('ss-omens-cards');assert.equal(box.children.length,3);assert.equal(new Set(box.children.map(c=>c.dataset.omen)).size,3);
const offers=JSON.stringify(O.choices()),rng=s.SurvivorRunRng.snapshot().counts.offers,clock=g.time;
h.run('updateProgress(80)');assert.equal(g.time,clock);
d.getElementById('ss-omens-defer').onclick();assert.equal(g.state,'playing');assert.equal(O.deferred,true);R.processRewards();assert.equal(g.state,'playing');
h.run('updateHUD()');assert.equal(d.getElementById('ss-omens-resume').classList.contains('hidden'),false);
h.run('pauseGame()');d.getElementById('ss-omens-resume').onclick();assert.equal(g.state,'omens');assert.equal(d.getElementById('pause-overlay').classList.contains('hidden'),true);assert.equal(JSON.stringify(O.choices()),offers);assert.equal(s.SurvivorRunRng.snapshot().counts.offers,rng);
box.children[0].onclick();assert.equal(O.owned.length,1);assert.equal(g.state,'playing');s.SurvivorEncounters.onKill(e);assert.equal(O.pending,false);
h.run('updateProgress(120)');R.damage(s.SurvivorEncounters.state.encounters[1].entity,1e9,{periodic:true});assert.equal(g.state,'omens');assert.ok(O.choices().every(c=>c.id!==O.owned[0].id));box.children[0].onclick();assert.equal(O.owned.length,2);
h.run('updateProgress(120)');R.damage(s.SurvivorEncounters.state.final,1e9,{periodic:true});assert.equal(g.state,'win');assert.equal(O.pending,false);
reset();assert.equal(O.owned.length,0);assert.equal(d.getElementById('ss-omens-overlay').classList.contains('hidden'),true);
// A champion reward waits for older bindings, level-ups and chests.
h.run('updateProgress(120)');const champion=s.SurvivorEncounters.state.encounters[0].entity;champion.dead=true;s.SurvivorEncounters.onKill(champion);d.getElementById('ss-omens-defer').onclick();
p.gainClassSkill('sorceress_chain');R.pendingBindings=['sorceress_chain'];R.pendingLevels=1;R.pendingChests=1;O.resume();R.processRewards();assert.equal(g.state,'binding');assert.equal(O.pending,true);
assert.equal(R.assignKey('Digit2'),true);assert.equal(g.state,'levelup');assert.equal(R.pendingChests,1);
R.pendingLevels=0;h.run('Game.closeLevelUp()');assert.equal(R.pendingChests,0);if(g.state==='binding'){assert.equal(O.pending,true);const free=Array.from({length:9},(_,i)=>'Digit'+(i+1)).find(k=>!p.skills.some(w=>w.binding===k));assert.equal(R.assignKey(free),true);}assert.equal(g.state,'omens');assert.equal(O.pending,true);
// Stat and movement hooks run once, including after repeated speed recalculation.
reset();h.run('updateProgress(120)');const c=s.SurvivorEncounters.state.encounters[0];c.defeated=true;c.entity.dead=true;
const originalRandom=s.SurvivorRunRng.random;let first=true;s.SurvivorRunRng.random=stream=>{if(stream==='offers'&&first){first=false;return .99;}return originalRandom(stream);};
O.earn(c.id);assert.ok(O.choices().some(c=>c.id==='burning_stride'));O.choose('burning_stride');
const speedBase=105*h.run('CLASSES.sorceress.speedMul')*h.run("metaBonus('swift')");R.recalcSpeed();assert.ok(Math.abs(p.speed-speedBase*1.15)<1e-8);R.recalcSpeed();assert.ok(Math.abs(p.speed-speedBase*1.15)<1e-8);
const w=R.state('sorceress_fireball'),withOmen=R.stats(w).dmg;O.reset();assert.ok(Math.abs(withOmen-R.stats(w).dmg*.9)<1e-8);
console.log('PASS omens integration: real deaths, paused choices, stable resume, reward priority, cap, reset and exactly-once stat/speed hooks');
