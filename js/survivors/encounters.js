/* Three independent encounters on the active, local six-minute act clock. */
'use strict';
(() => {
  if (new URLSearchParams(location.search).has('legacy')) return;
  const times = [120, 240, 360];
  // Intermediates are empowered ordinary monsters; act finales keep their bosses.
  const champions = [
    [{type:'fallen',sprite:'fallen-champion',name:'Chef des déchus'}, {type:'skeleton',sprite:'skeleton-bulwark',name:'Rempart ossifié'}],
    [{type:'scarab',sprite:'dune-scarab',name:'Scarabée cuirassé'}, {type:'serpent',sprite:'sand-serpent',name:'Gardien des dunes'}],
    [{type:'fungus',sprite:'ancient-fungus',name:'Ancien fongus'}, {type:'spider',sprite:'brood-spider',name:'Gardienne du couvain'}],
    [{type:'fireHound',sprite:'infernal-hound',name:'Limier alpha'}, {type:'ogre',sprite:'slag-ogre',name:'Ogre des scories'}],
    [{type:'undeadKnight',sprite:'frost-knight',name:'Chevalier du givre'}, {type:'skeletonArcher',sprite:'frost-archer',name:'Archer du givre'}]
  ];
  const images = {};
  if (typeof Image !== 'undefined') for (const champion of champions.flat()) {
    const img = images[champion.sprite] = new Image();
    img.onload=()=>{const texture=document.createElement('canvas');texture.width=texture.height=64;const ctx=texture.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(img,0,0,64,64);images[champion.sprite]=texture;};
    img.src = 'assets/sprites/champions/' + champion.sprite + '.png';
  }
  const finalHP = [1800, 1900, 1800, 2000, 2200];
  const finalDamage = [20, 21, 20, 22, 24];
  let serial = 0;
  const E = window.SurvivorEncounters = {
    state: null,
    image(sprite){return images[sprite];},
    catalog(){return champions.flatMap((list,act)=>list.map((c,index)=>({...c,act,index,hp:index===0?500:1000,xp:index===0?80:120})));},
    finalCatalog(){return BOSSES.map((b,act)=>({id:b.id,name:b.name,sprite:b.sprite,act,hp:finalHP[act],xp:180}));},
    reset(actIndex = 0) {
      const act = Math.max(0, Math.min(4, Math.floor(Number(actIndex) || 0)));
      this.state = { actIndex: act, runId: ++serial, elapsed: 0, phase: 'waves', status: 'playing', encounters: [], final: null };
      this.state.encounters = [...champions[act].map(c => c.type), BOSSES[act].id].map((id, index) => ({
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
      const s = this.state, heat = window.SurvivorHeat ? SurvivorHeat.factors() : {hp:1,damage:1};
      let entity;
      if (!encounter.final) {
        const champion = champions[s.actIndex][index];
        const world = typeof currentMapWorld === 'function' ? currentMapWorld() : null;
        const bounded = (value, max) => Math.max(32, Math.min((max || 2048) - 32, value));
        const offsets = [[0,-340],[340,0],[0,340],[-340,0]];
        const points = offsets.map((_,i) => offsets[(i + index) % offsets.length]).map(([dx,dy]) => ({x:bounded(Player.x+dx,world?.w),y:bounded(Player.y+dy,world?.h)}));
        points.sort((a,b) => Math.hypot(b.x-Player.x,b.y-Player.y)-Math.hypot(a.x-Player.x,a.y-Player.y));
        entity = spawnEnemy(champion.type, points[0].x, points[0].y);
        if (!entity) throw new Error('Unknown champion monster: ' + champion.type);
        entity.kind = 'boss';
        entity.boss = true;
        entity.ssChampion = true;
        entity.id = 'champion-' + champion.sprite;
        entity.name = champion.name;
        entity.ssChampionImage = undefined;
        entity.ssChampionSprite = champion.sprite;
        entity.spriteSize = index === 0 ? 56 : 64;
        entity.r *= 1.65;
        entity.xp = index === 0 ? 80 : 120;
        const scale = window.SurvivorActWaves ? SurvivorActWaves.factors(encounter.at) : {hp:1,damage:1,speed:1};
        entity.hp = entity.hpMax = (index === 0 ? 500 : 1000) * heat.hp * scale.hp;
        // Normal spawn already applies heat and time; keep one heat multiplier.
        if (entity.ssActScale) {
          entity.ssActScale.damage = Math.max((index === 0 ? 12 : 16) * heat.damage, entity.ssActScale.damage * 1.6);
          entity.ssActScale.speed *= 1.15;
          entity.ssActScale.spawnElapsed = encounter.at;
          entity.dmg = entity.ssActScale.damage * scale.damage;
          entity.speed = entity.ssActScale.speed * scale.speed;
        }
        if (typeof toast === 'function') toast('⚔ ' + champion.name + ' — champion de l’acte');
      } else {
        const source = BOSSES[s.actIndex];
        const def = {...source, at:encounter.at, hp:finalHP[s.actIndex], dmg:finalDamage[s.actIndex], xp:180};
        entity = spawnBoss(def);
        // Final spawn historically scales with minute; use only the local budget.
        entity.hp = entity.hpMax = def.hp * heat.hp;
        if (window.SurvivorActWaves) SurvivorActWaves.scaleEnemy(entity, encounter.at, s.actIndex);
      }
      entity.encounterId = encounter.id;
      entity.encounterRunId = s.runId;
      entity.encounterAt = encounter.at;
      entity.encounterFinal = encounter.final;
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
