'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const context = { URLSearchParams, location: { search: '' }, window: null,
  Game: { state: 'playing', time: 0, minute: 0 },
  SurvivorActs: {}, SurvivorHeat: { factors: () => ({ hp: 1.4 }) },
  Player:{x:1024,y:1024},
  spawnEnemy(type,x,y) { return {type,x,y,r:7,hp:20,hpMax:20,dmg:6,speed:30,dead:false}; },
  Run: { bossKills: {} }, Wave: { bossSpawned: {} }, wins: 0,
  BOSSES: ['butcher', 'insectQueen', 'summoner', 'spiderDemon', 'archdemon'].map(id => ({ id, name: id })),
  spawnBoss(def) { return { ...def, hp: def.hp * 9, hpMax: def.hp * 9, dead: false }; },
  winSequence() { context.wins++; context.Game.state = 'win'; }
};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '../js/survivors/encounters.js'), 'utf8'), context);
const E = context.SurvivorEncounters;
for (let act = 0; act < 5; act++) {
  context.Game.state = 'playing';
  E.reset(act);
  E.update(119);
  assert.equal(E.state.encounters.filter(e => e.spawned).length, 0);
  E.update(1);
  assert.equal(E.state.encounters[0].spawned, true);
  assert.equal(E.state.encounters[0].entity.ssChampion,true);
  assert.equal(E.state.encounters[0].entity.kind,'boss');
  E.update(240);
  assert.equal(E.state.encounters.filter(e => e.spawned).length, 3);
  assert.equal(E.state.encounters[1].entity.ssChampion,true);
  assert.notEqual(E.state.encounters[0].entity.type,E.state.encounters[1].entity.type);
  assert.ok(!E.state.final.ssChampion);
  assert.equal(E.state.final.id, context.BOSSES[act].id);
  assert.equal(E.elapsed, 360);
  assert.equal(context.Game.minute, 6);
  assert.equal(E.state.encounters[0].entity.hpMax, 700);
  E.update(1000);
  assert.equal(E.status, 'playing');
  assert.equal(E.state.encounters.filter(e => e.spawned).length, 3);
  assert.equal(context.SurvivorActs.deadline, null);
  context.Run.bossKills[E.state.final.id] = true;
  E.update(0);
  assert.equal(E.status, 'playing', 'a reused mechanic kill must not clear the final');
  const previous = E.state.encounters[0].entity;
  E.state.final.dead = true;
  E.onKill(E.state.final);
  assert.equal(E.status, 'won');
  assert.equal(previous.dead, false, 'final wins with intermediates alive');
  assert.equal(context.Run.bossKills[E.state.encounters[2].id], true);
  E.onKill(E.state.final);
  assert.equal(context.wins, act + 1);
  E.reset(act);
  assert.equal(E.onKill(previous), false, 'old run entities cannot affect a restart');
}
context.Game.state = 'paused';
E.update(360);
assert.equal(E.elapsed, 0);
context.Game.state = 'playing';
E.update(361);
assert.equal(E.state.encounters.filter(e => e.spawned).length, 3, 'one large step spawns every crossed encounter once');
E.update(NaN);
E.update(-1);
assert.equal(E.elapsed, 361);
console.log('Encounter clock, death identity, pause, restart and five act schedules passed.');
