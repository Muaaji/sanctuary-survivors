/* Three independent encounters on the active, local six-minute act clock. */
'use strict';
(() => {
  if (new URLSearchParams(location.search).has('legacy')) return;
  const times = [120, 240, 360];
  // Preserve each act's final boss and reuse distinct, already telegraphed mechanics.
  const rosters = [
    ['summoner', 'insectQueen', 'butcher'],
    ['butcher', 'spiderDemon', 'insectQueen'],
    ['insectQueen', 'spiderDemon', 'summoner'],
    ['butcher', 'insectQueen', 'spiderDemon'],
    ['summoner', 'spiderDemon', 'archdemon']
  ];
  const finalHP = [1800, 1900, 1800, 2000, 2200];
  const finalDamage = [20, 21, 20, 22, 24];
  let serial = 0;
  const E = window.SurvivorEncounters = {
    state: null,
    reset(actIndex = 0) {
      const act = Math.max(0, Math.min(4, Math.floor(Number(actIndex) || 0)));
      this.state = { actIndex: act, runId: ++serial, elapsed: 0, phase: 'waves', status: 'playing', encounters: [], final: null };
      this.state.encounters = rosters[act].map((id, index) => ({
        id: 'act-' + (act + 1) + '-boss-' + (index + 1), mechanicId: id,
        at: times[index], final: index === 2, spawned: false, defeated: false, entity: null
      }));
      this.sync();
      return this.state;
    },
    sync() {
      const s = this.state, acts = window.SurvivorActs;
      if (!s || !acts) return;
      acts.index = s.actIndex;
      acts.elapsed = s.elapsed;
      acts.phase = s.phase;
      acts.deadline = null;
      const living = s.encounters.filter(e => e.spawned && !e.defeated && !e.entity.dead);
      acts.boss = s.final && !s.final.dead ? s.final : living.length ? living[living.length - 1].entity : null;
      acts.bossStartedAt = acts.boss ? acts.boss.encounterAt : null;
    },
    spawn(encounter, index) {
      const s = this.state, source = BOSSES.find(b => b.id === encounter.mechanicId);
      if (!source) throw new Error('Unknown encounter boss: ' + encounter.mechanicId);
      const def = { ...source, at: encounter.at,
        hp: index === 2 ? finalHP[s.actIndex] : index === 0 ? 500 : 1000,
        dmg: index === 2 ? finalDamage[s.actIndex] : index === 0 ? 12 : 16,
        xp: index === 2 ? 180 : index === 0 ? 80 : 120,
        name: index === 2 ? source.name : source.name + ' — intermédiaire ' + (index + 1)
      };
      const entity = spawnBoss(def);
      // spawnBoss historically scales with campaign minute; the new budget is local.
      const heat = window.SurvivorHeat ? SurvivorHeat.factors() : { hp: 1 };
      entity.hp = entity.hpMax = def.hp * heat.hp;
      entity.encounterId = encounter.id;
      entity.encounterRunId = s.runId;
      entity.encounterAt = encounter.at;
      entity.encounterFinal = encounter.final;
      if (window.SurvivorActWaves) SurvivorActWaves.scaleEnemy(entity, encounter.at, s.actIndex);
      encounter.spawned = true;
      encounter.entity = entity;
      if (encounter.final) s.final = entity;
      if (typeof Wave !== 'undefined') Wave.bossSpawned[encounter.id] = true;
    },
    onKill(entity) {
      const s = this.state;
      if (!s || !entity || entity.encounterRunId !== s.runId) return false;
      const encounter = s.encounters.find(e => e.entity === entity);
      if (!encounter || encounter.defeated || !entity.dead) return false;
      encounter.defeated = true;
      Run.bossKills[encounter.id] = true;
      if (encounter.final && s.status === 'playing') {
        s.status = 'won';
        s.phase = 'finished';
        this.sync();
        winSequence();
      } else this.sync();
      return true;
    },
    update(dt) {
      if (Game.state !== 'playing') return;
      if (!this.state) this.reset(window.SurvivorActs ? SurvivorActs.index : 0);
      const s = this.state;
      if (s.status !== 'playing') return;
      // Poll actual entities as a fallback for damage paths without the kill hook.
      for (const encounter of s.encounters) if (encounter.entity && encounter.entity.dead) this.onKill(encounter.entity);
      if (s.status !== 'playing') return;
      const delta = Number.isFinite(dt) ? Math.max(0, dt) : 0;
      s.elapsed += delta;
      Game.time = s.elapsed;
      Game.minute = Math.floor(s.elapsed / 60);
      for (let i = 0; i < s.encounters.length; i++) {
        const encounter = s.encounters[i];
        if (!encounter.spawned && s.elapsed >= encounter.at) this.spawn(encounter, i);
      }
      s.phase = s.final ? 'boss' : 'waves';
      this.sync();
    },
    get elapsed() { return this.state ? this.state.elapsed : 0; },
    get phase() { return this.state ? this.state.phase : 'waves'; },
    get status() { return this.state ? this.state.status : 'idle'; },
    get nextEncounter() { return this.state ? this.state.encounters.find(e => !e.spawned) || null : null; }
  };
})();
