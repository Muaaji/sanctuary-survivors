/* Freebuff integration boundary: new modules, one script block in index.html. */
'use strict';
(() => {
  if(window.SurvivorIntegration||new URLSearchParams(location.search).has('legacy'))return;
  const C=SurvivorCatalogue,R=SurvivorRuntime;
  const legacy={killEnemy,collectPickup,updateHUD,spawnBoss,reset:Player.reset,spawnEnemy,win:winSequence,shop:buyShopItem};
  window.SurvivorIntegration={version:1,legacy,catalog:C,runtime:R};
  const $=id=>document.getElementById(id);
  const icon=id=>'assets/survivors/icons/'+id+'.svg';
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let discoveries={};try{discoveries=JSON.parse(localStorage.getItem('survivors_knowledge')||'{}')||{};}catch(e){}
  if(typeof discoveries!=='object'||Array.isArray(discoveries))discoveries={};
  const Knowledge=window.SurvivorKnowledge={entries:discoveries,
    status(id){return this.entries[id]===2?2:this.entries[id]===1?1:0;},
    mark(id,acquired=false){const status=acquired?2:1;if(this.status(id)>=status)return;this.entries[id]=status;localStorage.setItem('survivors_knowledge',JSON.stringify(this.entries));}
  };
  const ultimates={};
  for(const d of Object.values(C.spells)) {
    d.maxLevel=5;
    const recipe=C.recipes[d.id],branch=(C.trees[d.group]||[]).find(b=>b.skills.includes(d.id));
    ultimates[d.id]={id:d.id,group:d.group,name:recipe?.name||d.name+' — ultime',desc:recipe?.desc||(d.mode==='shield'?'Bouclier +50 %, recharge −20 %.':d.mode==='curse'?'Vulnérabilité doublée, portée +25 %, recharge −20 %.':'Dégâts +50 %, portée +25 %, recharge −20 % ; invocations renforcées.'),passive:recipe?.passive,branch};
  }
  function ultimateEligible(id){const w=R.state(id),u=ultimates[id];return !!(w&&u&&!w.evolved&&w.level>=5&&(u.passive?R.passive(u.passive)>=1:u.branch?.nodes.some(n=>R.talents.has(n.id))));}
  R.ultimateEligible=ultimateEligible;
  const descriptions={projectile:'Salve rapide vers une cible proche.',fan:'Éventail de projectiles vers un groupe.',axe:'Haches à trajectoire courbe et impact physique.',fireball:'Projectile explosif de feu.',orbit:'Lames en orbite autour de vous.',pool:'Flaques persistantes empoisonnant les ennemis.',frost:'Éclats de froid qui ralentissent.',chain:'Éclair sautant entre des cibles différentes.',aura:'Pulsations de dégâts autour de vous.',homing:'Projectiles magiques qui poursuivent une cible.',meteor:'Impacts de feu annoncés au sol.',javelin:'Javelot libérant des traits électriques.',plague:'Javelot traversant et nuage de poison.',companion:'Compagnons permanents, remplacés après leur mort.',orb:'Orbe diffusant des éclats de glace.',blizzard:'Zone de glace frappant et ralentissant un groupe.',turret:'Tourelle temporaire attaquant automatiquement.',spear:'Projectile magique traversant plusieurs ennemis.',nova:'Anneau de poison frappant les ennemis proches.',corpse:'Fait exploser un cadavre proche des ennemis.',curse:'Les ennemis maudits reçoivent davantage de dégâts.',melee:'Frappes rapides dans un cône frontal.',hammer:'Marteaux décrivant une spirale sortante.',heavens:'Frappe sacrée et traits secondaires.',shield:'Barrière absorbant les dégâts reçus.',whirl:'Frappes tournantes pendant vos déplacements.',cry:'Onde de dégâts et bref étourdissement.',frenzy:'Frappes au contact et bonus temporaire de mobilité.',tornado:'Tornade perforante à trajectoire courbe.',hurricane:'Anneau de vent et de froid suivant vos déplacements.',fissure:'Zone de sol brûlant sous les ennemis.',venom:'Vos attaques physiques directes appliquent du poison.'};
  for(const s of Object.values(C.spells)) {
    s.desc=s.mode==='weapon'||s.id==='necromancer_curse'?s.desc:descriptions[s.mode];s.icon='ss_'+s.id;s.mana=SurvivorStats.manaCost(s);s.lvl=Array.from({length:5},(_,i)=>({dmg:s.dmg*(1+.15*i),cd:s.cd}));
    if(s.group==='common')WEAPONS[s.id]=s;else SKILLS[s.id]=s;
    const image=new Image();image.src=icon(s.id);s.image=image;
    // Existing art consumers expect a canvas with toDataURL(), not an Image.
    const tile=document.createElement('canvas');tile.width=tile.height=32;
    image.onload=()=>{tile.getContext('2d').drawImage(image,0,0,32,32);};ART.icons[s.icon]=tile;
  }
  for(const p of Object.values(C.passives)){p.icon='ss_'+p.id;PASSIVES[p.id]=p;}
  for(const [id,cls] of Object.entries(CLASSES)) {
    cls.skills=Object.values(C.spells).filter(s=>s.group===id).map(s=>s.id);
    cls.auto=cls.skills[0];cls.sprite=id;
    cls.desc={paladin:'Foi et protection : +30 % de vie. Mêlée, auras et magie sacrée.',sorceress:'Feu, froid et foudre : +15 % de dégâts, −15 % de vie.',amazon:'Arc et javelots : +15 % de vitesse. Compagne Valkyrie.',necromancer:'Armée de morts, os et poisons : +10 % de dégâts, −15 % de vie.',druid:'Vent, feu et animaux : +10 % de vie, +5 % de vitesse.',barbarian:'Mêlée et rage : +50 % de vie, −20 % de vitesse.',assassin:'Griffes, pièges et ombre : +25 % de vitesse, −10 % de vie.'}[id];
  }
  window.facing8=(x,y)=>{const dirs=['E','SE','S','SW','W','NW','N','NE'];return dirs[(Math.round(Math.atan2(y,x)/(Math.PI/4))+8)%8];};
  window.getSprite=key=>ART[key]||ART.fallen||ART.player.paladin.S;
  CAM.zoom=1;CAM.x=CAM.y=1024;

  // Contracts are persisted; their effects are snapshotted at the start of a run.
  const contracts=[
    {id:'hp',name:'Vitalité monstrueuse',desc:'+20 % de vie par rang',max:5},
    {id:'damage',name:'Fureur',desc:'+15 % de dégâts par rang',max:5},
    {id:'speed',name:'Célérité',desc:'+8 % de vitesse par rang',max:5},
    {id:'elite',name:'Armée d’élites',desc:'+4 % de chance d’élite par rang',max:5},
    {id:'xp',name:'Apprentissage difficile',desc:'−10 % d’XP par rang',max:5},
    {id:'rate',name:'Horde',desc:'+15 % de cadence par rang',max:5}
  ];
  let saved={};try{saved=JSON.parse(localStorage.getItem('survivors_contracts')||'{}')||{};}catch(e){}
  // Old shared victories cannot be attributed to a hero; keep them archived without granting class clears.
  const Acts=window.SurvivorActs={selected:-1,active:-1,classId:'paladin',records:{},index:0,elapsed:0,phase:'waves',boss:null,bossStartedAt:null,deadline:null,
    begin(){this.index=this.active<0?0:this.active;this.elapsed=0;this.phase='waves';this.boss=null;this.bossStartedAt=this.deadline=null;Game.defeatReason='';},
    remaining(){return this.phase==='boss'?Math.max(0,(this.deadline||0)-Game.time):null;},
    get cleared(){return this.records[this.classId];},
    useClass(id){this.classId=id;return this.cleared;},
    unlocked(){return this.selected<0?this.cleared.every(h=>h>=0):this.cleared[this.selected]>=0;},
    complete(i){this.cleared[i]=Math.max(this.cleared[i],Heat.active);Heat.save();},
    end(){return this.active<0?WIN_TIME:(this.active+1)*180;}
  };
  currentActIndex=()=>Acts.index;
  for(const id of Object.keys(CLASSES))Acts.records[id]=Array.from({length:5},(_,i)=>Number.isFinite(saved.byClass?.[id]?.[i])?Math.max(-1,Math.min(30,saved.byClass[id][i])):-1);
  const Heat=window.SurvivorHeat={selected:0,active:0,ranks:{},activeRanks:{},
    save(){localStorage.setItem('survivors_contracts',JSON.stringify({version:2,ranks:this.ranks,byClass:Acts.records,legacyShared:saved.legacyShared||saved.cleared}));},
    set(value){let left=clamp(Math.floor(Number(value)||0),0,30);for(const c of contracts){this.ranks[c.id]=Math.min(c.max,left);left-=this.ranks[c.id];}return this.refresh();},
    refresh(){this.selected=contracts.reduce((n,c)=>n+(this.ranks[c.id]||0),0);this.save();return this.selected;},
    factors(value=this.active){const ranks=value===this.active?this.activeRanks:this.ranks;
      return {hp:1+.2*(ranks.hp||0),damage:1+.15*(ranks.damage||0),rate:1+.15*(ranks.rate||0),speed:1+.08*(ranks.speed||0),elite:.04*(ranks.elite||0),xp:1-.1*(ranks.xp||0),reward:1+.15*clamp(value,0,30)};}
  };
  for(const c of contracts)Heat.ranks[c.id]=clamp(Math.floor(Number(saved.ranks?.[c.id])||0),0,c.max);Heat.refresh();
  spawnEnemy=function(type,x,y,opts={}){const e=legacy.spawnEnemy(type,x,y,opts);if(e){const f=Heat.factors();e.hp=e.hpMax*=f.hp;e.dmg*=f.damage;e.speed*=f.speed;}return e;};
  winSequence=function(){if(Game.state==='win')return;const bonus=Math.floor(5*Heat.factors().reward);Meta.essence+=bonus;Player.essenceRun+=bonus;if(Acts.active>=0)Acts.complete(Acts.active);legacy.win();$('win-screen').querySelector('h2').textContent=Acts.active<0?'L’Archidémon est tombé':'Acte '+(Acts.active+1)+' terminé';$('ss-hotter').disabled=Heat.active>=30;renderHeat();toast('Victoire : +'+bonus+' essence · chaleur '+Heat.active);};
  Player.reset=function(cls) {
    this.classId=cls||this.classId;Acts.useClass(this.classId);Heat.active=Acts.unlocked()?Heat.selected:0;Heat.activeRanks=Heat.active?{...Heat.ranks}:{};Acts.active=Acts.selected;Acts.begin();R.reset();const c=CLASSES[this.classId];
    this.x=this.y=1024;this.r=11;this.facing=this.facing8='S';this.attackAnimT=0;
    this.baseHP=Math.round(60*c.hpMul*metaBonus('vital'));R.flatHP=0;
    this.hpMax=this.hp=this.baseHP;const attributes=SurvivorStats.get(this.classId,true);this.manaMax=this.mana=attributes.manaMax;this.manaRegen=attributes.manaRegen;
    this.speed=105*c.speedMul*metaBonus('swift');this.level=1;this.xp=0;this.xpNext=12;
    this.gold=0;this.gems=0;this.essenceRun=0;this.kills=0;this.invuln=0;
    this.weapons={};this.passives={};this.skills=[];this.shopPurchases={};
    for(const key of ['slowAuraT','boneArmorHP','boneArmorT','buffDmgT','buffHPT','buffManaT','whirlwindT','firestormT'])this[key]=0;
    this.buffDmgMul=1;this.lastKillPos=null;
    this.gainClassSkill(c.skills[0]);
  };
  Player.gainClassSkill=function(id) {
    const def=C.spells[id];if(!def||def.group!==this.classId)return false;
    const current=this.skills.find(w=>w.id===id);
    if(current){if(current.level>=5)return false;current.level++;Knowledge.mark(id,true);return true;}
    if(this.skills.length>=3)return false;
    this.skills.push({id,def,level:1,cd:0});Knowledge.mark(id,true);return true;
  };
  Player.gainWeapon=function(id) {
    const def=C.spells[id];if(!def||def.group!=='common')return false;
    if(this.weapons[id]){if(this.weapons[id].evolved||this.weapons[id].level>=5)return false;this.weapons[id].level++;Knowledge.mark(id,true);return true;}
    if(Object.keys(this.weapons).length>=3)return false;
    this.weapons[id]={id,def,level:1,cd:0,orbitAngle:0};Knowledge.mark(id,true);return true;
  };
  Player.gainPassive=function(id) {
    const def=C.passives[id],cur=this.passives[id]||0;
    if(!def||cur>=5||!cur&&Object.keys(this.passives).length>=6)return false;
    const before=this.hpMax;this.passives[id]=cur+1;
    if(id==='vitality'){this.hpMax=Math.round(this.baseHP*(1+.1*this.passives[id])+(R.flatHP||0));this.hp+=this.hpMax-before;}
    if(id==='mana'){const a=SurvivorStats.get(),delta=a.manaMax-this.manaMax;this.manaMax=a.manaMax;this.mana=Math.min(this.manaMax,this.mana+delta);this.manaRegen=a.manaRegen;}
    R.recalcSpeed();Knowledge.mark(id,true);return true;
  };
  Object.defineProperties(Player,{
    magicFind:{configurable:true,get(){return 1;}},
    cdrMul:{configurable:true,get(){return Math.max(.5,1-R.passive('cooldown')*.04);}},
    dmgMul:{configurable:true,get(){return 1+R.passive('power')*.08;}},
    armorVal:{configurable:true,get(){return R.passive('armor')*.02;}},
    speedMul:{configurable:true,get(){return 1+R.passive('speed')*.04;}},
    magnetR:{configurable:true,get(){return 80*(1+R.passive('magnet')*.2);}}
  });
  Player.cast=index=>R.activate(index);
  Player.canCast=index=>{const w=Player.skills[index];return !!(w&&Game.state==='playing'&&SurvivorStats.activation(w.def)!=='passive'&&w.cd<=0&&Player.mana>=SurvivorStats.manaCost(R.stats(w)));};
  canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();const x=(e.clientX-rect.left)*VW/rect.width,y=(e.clientY-rect.top)*VH/rect.height;const dx=(x-VW/2)/CAM.zoom+CAM.x-Player.x,dy=(y-VH/2)/CAM.zoom+CAM.y-Player.y,len=Math.hypot(dx,dy)||1,mul=Math.min(1,450/len);const world=currentMapWorld();R.aimPoint={x:clamp(Player.x+dx*mul,0,world?.w||4096),y:clamp(Player.y+dy*mul,0,world?.h||4096)};});
  Player.update=function(dt){this.invuln=Math.max(0,this.invuln-dt);this.attackAnimT=Math.max(0,this.attackAnimT-dt);this.mana=Math.min(this.manaMax,this.mana+this.manaRegen*dt);};
  Player.takeDamage=function(amount) {
    if(this.invuln>0||Game.state!=='playing')return;
    const attributes=SurvivorStats.get();
    if(chance(attributes.dodge)){this.invuln=.25;spawnDamageNumber(this.x,this.y-20,'Esquive',false);return;}
    amount*=1-Math.min(.6,attributes.armor*.02);
    const before=R.shieldHP;
    if(R.shieldHP>0){const used=Math.min(R.shieldHP,amount);R.shieldHP-=used;amount-=used;}
    this.invuln=.5;Run.hurtCount++;
    if(before>0&&R.shieldHP<=0&&R.modifiers('paladin_shield').special==='reprisal'&&R.gate('reprisal',6)) {
      const zeal=R.state('paladin_zeal');if(zeal){const s=R.stats(zeal);R.burst({...s,radius:100,dmg:s.dmg*1.5},this.x,this.y,{secondary:true});}
    }
    if(R.modifiers('barbarian_frenzy').special==='revenge'&&R.gate('revenge',4))for(const id of ['barbarian_frenzy','barbarian_cry']){const w=R.state(id);if(w)w.cd=Math.max(0,w.cd-2);}
    this.hp-=Math.max(0,amount);spawnHitParticles(this.x,this.y,'#a34335',7);Sound.play('playerHurt');
    if(this.hp<=0){this.hp=0;deathSequence();}
  };
  updateWeapons=dt=>R.tick(dt);
  updateEnemies=dt=>R.updateEnemies(dt);
  updateProjectiles=dt=>R.updateBullets(dt);
  updateZones=dt=>R.updateFields(dt);
  updateTraps=()=>{};
  damageEnemy=(e,dmg)=>R.damage(e,dmg);
  killEnemy=function(e){if(!R.onKill(e))return;legacy.killEnemy(e);if(e.elite)spawnPickupType(e.x,e.y,'chest');};
  spawnBoss=function(def) {
    const b=legacy.spawnBoss(def),world=currentMapWorld(),f=Heat.factors();
    b.hp=b.hpMax*=f.hp;b.dmg*=f.damage;b.speed*=f.speed;b.bossTempo=1.2;
    if(world) {
      const points=[[0,-340],[0,340],[-340,0],[340,0]].map(([dx,dy])=>({x:clamp(Player.x+dx,32,world.w-32),y:clamp(Player.y+dy,32,world.h-32)}));
      points.sort((a,c)=>dist2(c.x,c.y,Player.x,Player.y)-dist2(a.x,a.y,Player.x,Player.y));
      b.x=points[0].x;b.y=points[0].y;
    }
    return b;
  };
  const oldDropLoot=dropLoot;
  dropLoot=function(e){const start=pickups.length;oldDropLoot(e);for(let i=pickups.length-1;i>=start;i--){const p=pickups[i];if(['heart','flaskHP'].includes(p.type)&&(!e.boss&&Math.random()<.82||e.boss&&p.type==='flaskHP'))pickups.splice(i,1);}};
  collectPickup=function(p) {
    if(['small','mid','big','giant'].includes(p.type)){Player.xp+=(p.gemValue||{small:1,mid:3,big:10,giant:60}[p.type])*Heat.factors().xp;Player.gems++;Sound.play('gem');return;}
    if(p.type==='heart'){Player.heal(Math.max(4,Math.round(Player.hpMax*.1)));Sound.play('heal');return;}
    if(p.type==='flaskHP'){Player.heal(Math.round(Player.hpMax*.2));Sound.play('heal');return;}
    if(p.type==='flaskMP'){Game.rerollsLeft++;toast('Rune de refonte : +1 relance');return;}
    if(p.type==='chest'){Player.gold+=50;Run.goldEarned+=50;R.pendingChests++;Sound.play('chest');processRewards();return;}
    legacy.collectPickup(p);
  };
  checkLevelUp=function() {
    if(Game.state!=='playing')return;
    let count=0;
    while(Player.level<40&&Player.xp>=Player.xpNext) {
      Player.xp-=Player.xpNext;Player.level++;R.pendingLevels++;count++;
      if(Player.level%5===0)R.talentPoints++;
      Player.xpNext=Math.round(10+Player.level*4.5+Math.pow(Player.level,1.12)*1.5);
      Player.heal(Player.hpMax*.02);
    }
    if(count){Game.showLevelUp();Sound.play('levelup');}
  };
  const oldDeath=deathSequence;
  deathSequence=function(){oldDeath();$('kill-screen').querySelector('p').textContent=Game.defeatReason||'La crypte réclame encore une âme…';};
  updateProgress=function(dt) {
    if(Game.state!=='playing')return;
    Game.time+=dt;
    if(Acts.phase==='waves') {
      Acts.elapsed=Math.min(180,Acts.elapsed+dt);
      Game.minute=Acts.index*3+Math.min(2,Math.floor(Acts.elapsed/60));
      if(Acts.elapsed>=180) {
        const def=BOSSES[Acts.index];Wave.bossSpawned[def.id]=true;
        Acts.phase='boss';Acts.bossStartedAt=Game.time;Acts.deadline=Game.time+120;Acts.boss=spawnBoss(def);
        toast(def.name+' arrive ! Tu as 2 minutes pour le vaincre.');
      }
    } else if(Acts.phase==='boss') {
      const def=BOSSES[Acts.index];
      if(Run.bossKills[def.id]) {
        Acts.complete(Acts.index);Acts.boss=null;Acts.bossStartedAt=Acts.deadline=null;
        if(Acts.active>=0||Acts.index===BOSSES.length-1){Acts.phase='finished';winSequence();return;}
        // Start the next map and its three-minute wave clock only after victory.
        for(const e of enemies)e.dead=true;enemies.length=0;R.hazards=[];R.bullets=R.bullets.filter(p=>!p.hostile);
        Acts.index++;Acts.elapsed=0;Acts.phase='waves';Game.minute=Acts.index*3;Wave.timer=0;
        toast('Acte '+(Acts.index+1)+' — nouvelle descente.');
      } else if(Game.time>=Acts.deadline) {
        Acts.phase='failed';Game.defeatReason='Temps écoulé : '+def.name+' n’a pas été vaincu dans les 2 minutes. Acte '+(Acts.index+1)+' échoué.';
        Player.hp=0;deathSequence();return;
      }
    }
    checkLevelUp();checkAchievements();
  };
  const oldWaveUpdate=Wave.update.bind(Wave);
  Wave.update=function(dt){if(Game.state==='playing'&&Acts.phase==='waves')oldWaveUpdate(dt*Heat.factors().rate);};
  Wave.spawnOne=function(cfg) {
    if(enemies.filter(e=>!e.dead).length>=180)return;
    SurvivorIntegration.updateCamera();
    const r=Math.hypot(VW/2,VH/2)/CAM.zoom+60,world=currentMapWorld();
    let x,y,valid=false;
    for(let tries=0;tries<24;tries++) {
      const a=rand(0,TAU);x=CAM.x+Math.cos(a)*r;y=CAM.y+Math.sin(a)*r;
      if(world){x=clamp(x,30,world.w-30);y=clamp(y,30,world.h-30);}
      if(dist2(x,y,Player.x,Player.y)>160*160&&(Math.abs(x-CAM.x)>VW/(2*CAM.zoom)+16||Math.abs(y-CAM.y)>VH/(2*CAM.zoom)+16)){valid=true;break;}
    }
    if(valid)spawnEnemy(pick(cfg.types),x,y,{elite:chance((cfg.elite||0)+Heat.factors().elite)});
  };

  // Preserve the supplied frame unchanged; the SVG viewport removes its empty margins.
  const hudFrame=document.getElementById('hud-frame-img');hudFrame.src='assets/ui/hud-frame-user.svg';document.getElementById('hud-bottom').appendChild(hudFrame);
  // User interface: ordinary choices, evolution choices and linked class talent trees.
  const style=document.createElement('link');style.rel='stylesheet';style.href='css/survivors.css';document.head.appendChild(style);
  const panel=document.createElement('div');panel.id='talents-overlay';panel.className='overlay hidden';
  panel.innerHTML='<div class="ss-talent-panel"><h2>Capacités de classe — Talents</h2><p id="ss-talent-summary"></p><div id="ss-talent-tree"></div><button class="btn small" id="ss-talents-close">Revenir au combat</button></div>';
  $('game-container').appendChild(panel);
  const evolution=document.createElement('div');evolution.id='evolution-overlay';evolution.className='overlay hidden';
  evolution.innerHTML='<h2>Une arme s’éveille</h2><p>Choisis l’évolution que tu veux recevoir.</p><div id="ss-evolution-cards"></div>';
  $('game-container').appendChild(evolution);
  const ribbon=document.createElement('div');ribbon.id='ss-build-ribbon';ribbon.innerHTML='<span id="ss-run-level"></span><div id="ss-passives"></div><button id="ss-talents-button" class="btn small">Talents <span id="ss-talent-count">0</span></button>';
  $('hud').appendChild(ribbon);
  const bossTimer=document.createElement('div');bossTimer.id='ss-boss-timer';bossTimer.className='hidden';bossTimer.setAttribute('role','timer');bossTimer.setAttribute('aria-label','Temps restant pour vaincre le boss');$('hud').appendChild(bossTimer);
  $('ss-talents-button').onclick=()=>openTalents(false);
  $('ss-talents-close').onclick=()=>closeTalents();
  $('build-badge').textContent='45 compétences · évolutions · talents';
  $('win-screen').querySelector('h2').textContent='L’Archidémon est tombé';
  const hint=$('title-screen').querySelector('.controls-hint');
  hint.innerHTML='Déplacement : <b>ZQSD / WASD / flèches</b> · Pause : <b>Échap</b> · Talents : <b>T</b><br>Armes et passives automatiques · Sorts actifs : <b>raccourcis au choix</b> · Vise avec la souris.<br><button class="btn small" id="ss-start">Choisir mon héros</button>';
  $('ss-start').onclick=()=>showClassSelect();
  const sub=$('title-screen').querySelector('.subtitle');sub.textContent='— cinq actes, sept héros, des dizaines de combinaisons —';
  const oldInstructions=$('title-screen').querySelector('.press-start');if(oldInstructions)oldInstructions.textContent='Choisis tes sorts, fais évoluer tes armes, spécialise tes talents.';
  // Preserve access to Freebuff's settings and permanent upgrades from the new title screen.
  const titleActions=document.createElement('div');titleActions.className='ss-title-actions';
  titleActions.innerHTML='<button class="btn small" id="ss-meta">Sanctuaire</button><button class="btn small" id="ss-settings">Réglages</button>';
  hint.appendChild(titleActions);$('ss-meta').onclick=openSanctuary;$('ss-settings').onclick=openSettings;
  const setup=document.createElement('div');setup.id='ss-run-setup';setup.className='overlay hidden';
  setup.innerHTML='<div class="ss-setup-panel"><p class="ss-step">2 / 2 · Préparer la descente</p><div class="ss-setup-hero"><img id="ss-setup-portrait" alt=""><div><h2 id="ss-setup-name"></h2><p id="ss-setup-profile"></p></div></div><div id="ss-setup-options"></div><div class="ss-setup-actions"><button id="ss-setup-back" class="btn small">← Changer de héros</button><button id="ss-launch" class="btn">Lancer la descente</button></div></div>';
  $('game-container').appendChild(setup);
  const heatControl=document.createElement('div');heatControl.className='ss-heat-control';
  heatControl.innerHTML='<div id="ss-act-progress"></div><label for="ss-act">Acte à explorer</label><select id="ss-act"><option value="-1">Campagne — les cinq actes</option>'+BOSSES.map((b,i)=>'<option value="'+i+'">Acte '+(i+1)+' — '+escape(b.name)+'</option>').join('')+'</select><strong id="ss-heat-desc"></strong><div id="ss-contracts"></div>';
  $('ss-setup-options').appendChild(heatControl);$('ss-act').value=-1;
  function showRunSetup(cls){
    hideRunPanels();$('title-screen').classList.add('hidden');$('class-screen').classList.add('hidden');
    Acts.useClass(cls);Game.state='setup';const c=CLASSES[cls];$('ss-setup-name').textContent=c.name;$('ss-setup-profile').textContent=SurvivorStats.profiles[cls].note;
    const sprite=Sprites.playerSprite(cls,'S',false)||ART.player[cls]?.S||ART.player.paladin.S;
    $('ss-setup-portrait').src=sprite.src||sprite.toDataURL();$('ss-setup-portrait').alt=c.name;
    $('ss-act').value=Acts.selected;renderHeat();setup.classList.remove('hidden');
  }
  SurvivorIntegration.showRunSetup=showRunSetup;
  $('ss-setup-back').onclick=()=>showClassSelect();$('ss-launch').onclick=()=>startRun(Acts.classId);
  addEventListener('keydown',e=>{if(Game.state!=='setup')return;if(e.code==='Escape'){showClassSelect();e.preventDefault();}else if(e.code==='Enter'&&!['SELECT','INPUT','BUTTON'].includes(e.target?.tagName)){startRun(Acts.classId);e.preventDefault();}});
  for(const c of contracts){const row=document.createElement('label');row.className='ss-contract';row.innerHTML='<span>'+c.name+'<small>'+c.desc+'</small></span><select id="ss-contract-'+c.id+'" aria-label="'+c.name+'">'+Array.from({length:6},(_,i)=>'<option value="'+i+'">'+i+'</option>').join('')+'</select>';$('ss-contracts').appendChild(row);$('ss-contract-'+c.id).onchange=()=>{Heat.ranks[c.id]=clamp(Number($('ss-contract-'+c.id).value)||0,0,c.max);Heat.refresh();renderHeat();};}
  function renderProgress(){const box=$('ss-act-progress');box.innerHTML='<b>'+escape(CLASSES[Acts.classId].name)+' — progression des actes</b><div>'+Acts.cleared.map((h,i)=>'<span class="ss-act-badge '+(h>=0?'complete':'')+'">Acte '+(i+1)+' · '+(h<0?'À terminer':'✓ Chaleur '+h)+'</span>').join('')+'</div>';}
  function renderHeat(){renderProgress();const unlocked=Acts.unlocked();$('ss-heat-desc').textContent=unlocked?'Chaleur '+Heat.selected+' / 30 · victoire : '+Math.floor(5*(1+.15*Heat.selected))+' essence':'Chaleur 0 / 30 — termine cette destination une première fois pour débloquer les pactes.';for(const c of contracts){$('ss-contract-'+c.id).value=Heat.ranks[c.id];$('ss-contract-'+c.id).disabled=!unlocked;}}
  $('ss-act').onchange=()=>{Acts.selected=clamp(Number($('ss-act').value)||0,-1,4);renderHeat();};renderHeat();
  const replay=document.createElement('button');replay.className='btn small';replay.textContent='Pactes / choisir un acte';replay.onclick=()=>showRunSetup(Player.classId);$('win-screen').appendChild(replay);
  const hotter=document.createElement('button');hotter.className='btn';hotter.id='ss-hotter';hotter.textContent='Recommencer à chaleur +1';hotter.onclick=()=>{Acts.selected=Acts.active;if(!Acts.unlocked()||Heat.active>=30)return;Heat.ranks={...Heat.activeRanks};const c=contracts.find(c=>(Heat.ranks[c.id]||0)<c.max);Heat.ranks[c.id]=(Heat.ranks[c.id]||0)+1;Heat.refresh();renderHeat();startRun(Player.classId);};$('win-screen').appendChild(hotter);
  $('retry-btn').textContent='Recommencer (Entrée)';$('retry-btn2').textContent='Recommencer (Entrée)';
  $('retry-btn').onclick=$('retry-btn2').onclick=()=>startRun(Player.classId);
  const library=document.createElement('div');library.id='knowledge-overlay';library.className='overlay hidden';
  library.innerHTML='<div class="ss-library-panel"><h2>Bibliothèque de savoir</h2><p>Inconnu : ? · Aperçu : grisé · Acquis : révélé. Les découvertes restent entre les parties.</p><p id="ss-library-count"></p><div id="ss-library-items"></div><button class="btn small" id="ss-library-close">Retour</button></div>';$('game-container').appendChild(library);
  let libraryResume='title';
  function renderLibrary(){const items=[];
    for(const d of Object.values(C.spells)){const family=d.group==='common'?'Armes communes':'Sorts de classe · '+CLASSES[d.group].name;items.push({key:d.id,name:d.name,desc:d.desc,icon:d.id,family});const u=ultimates[d.id];items.push({key:'ultimate:'+d.id,name:u.name,desc:u.desc,icon:d.id,family:'Ultimes · '+(d.group==='common'?'armes communes':CLASSES[d.group].name)});}
    for(const p of Object.values(C.passives))items.push({key:p.id,name:p.name,desc:p.desc,icon:p.id,family:'Capacités standards'});
    for(const [cls,tree] of Object.entries(C.trees))for(const branch of tree)for(const node of branch.nodes)items.push({key:'talent:'+node.id,name:node.name,desc:node.desc,family:'Capacités de classe · '+CLASSES[cls].name});
    $('ss-library-count').textContent=items.filter(i=>Knowledge.status(i.key)>0).length+' / '+items.length+' découvertes · '+items.filter(i=>Knowledge.status(i.key)===2).length+' acquises';
    const box=$('ss-library-items');box.innerHTML='';
    for(const family of [...new Set(items.map(i=>i.family))]){const section=document.createElement('section');section.className='ss-library-section';const heading=document.createElement('h3');heading.textContent=family;section.appendChild(heading);const grid=document.createElement('div');grid.className='ss-library-grid';
      for(const i of items.filter(i=>i.family===family)){const state=Knowledge.status(i.key),entry=document.createElement('article');entry.className='ss-library-entry '+(state===0?'unknown':state===1?'seen':'acquired');entry.innerHTML=state===0?'<strong class="ss-unknown">?</strong><b>Non découvert</b>':(i.icon?'<img src="'+icon(i.icon)+'" alt="">':'')+'<b>'+escape(i.name)+'</b><p>'+escape(i.desc)+'</p><small>'+(state===1?'Aperçu · jamais acquis':'Acquis')+'</small>';grid.appendChild(entry);}section.appendChild(grid);box.appendChild(section);}
  }
  function openLibrary(){libraryResume=Game.state;Game.state='knowledge';renderLibrary();library.classList.remove('hidden');}
  function closeLibrary(){library.classList.add('hidden');Game.state=libraryResume;}
  Knowledge.open=openLibrary;Knowledge.render=renderLibrary;
  $('ss-library-close').onclick=closeLibrary;
  for(const target of [titleActions,$('pause-overlay')]){const button=document.createElement('button');button.className='btn small';button.textContent='Bibliothèque de savoir';button.onclick=openLibrary;target.appendChild(button);}
  addEventListener('keydown',e=>{if(e.code==='Escape'&&Game.state==='knowledge'){closeLibrary();e.preventDefault();}});
  addEventListener('keydown',e=>{if(e.code==='KeyT'&&Game.state==='playing'){openTalents(false);e.preventDefault();}else if(e.code==='Escape'&&Game.state==='talents'){closeTalents();e.preventDefault();}});
  // Do not leave stuck movement keys when the window loses focus.
  addEventListener('blur',()=>{for(const key of Object.keys(Keys))Keys[key]=false;if(Game.state==='playing')pauseGame();});

  function option(kind,id,level) {
    const def=kind==='passive'?C.passives[id]:C.spells[id];return {kind,id,level,def,label:def.name+(level>1?' · rang '+level:' · nouveau')};
  }
  buildUpgradeOptions=function() {
    const out=[];
    for(const d of Object.values(C.spells)) {
      if(d.group!=='common'&&d.group!==Player.classId)continue;
      const w=R.state(d.id),count=d.group==='common'?Object.keys(Player.weapons).length:Player.skills.length;
      if(w&&!w.evolved&&w.level<5)out.push(option(d.group==='common'?'weapon':'class',d.id,w.level+1));
      else if(!w&&count<3)out.push(option(d.group==='common'?'weapon':'class',d.id,1));
    }
    for(const p of Object.values(C.passives)) {
      const rank=R.passive(p.id);
      if(rank<5&&(rank||Object.keys(Player.passives).length<6))out.push(option('passive',p.id,rank+1));
    }
    for(const u of Object.values(ultimates))if(ultimateEligible(u.id))out.push({kind:'ultimate',id:u.id,level:5,def:{desc:u.desc},label:u.name});
    return out;
  };
  applyUpgrade=function(opt) {
    const alreadyOwned=!!R.state(opt.id);let success=false;
    if(opt.kind==='ultimate'&&ultimateEligible(opt.id)){R.state(opt.id).evolved=true;Knowledge.mark('ultimate:'+opt.id,true);success=true;}
    else if(opt.kind==='class')success=Player.gainClassSkill(opt.id);
    else if(opt.kind==='weapon')success=Player.gainWeapon(opt.id);
    else if(opt.kind==='passive')success=Player.gainPassive(opt.id);
    if(success){if(opt.kind==='class'&&!alreadyOwned&&SurvivorStats.activation(C.spells[opt.id])!=='passive')R.pendingBindings.push(opt.id);Sound.play('select');renderWeaponSlots();}return success;
  };
  weaponLvlDesc=opt=>opt.def.desc+' '+(opt.level>1?'Dégâts et comportement améliorés.':'');
  function card(opt,onClick) {
    const el=document.createElement('button');el.className='card ss-card '+(C.spells[opt.id]?.group!=='common'&&opt.kind!=='passive'?'ss-class-choice':'ss-standard-choice')+(opt.kind==='ultimate'?' ss-ultimate-choice':'');el.type='button';
    el.innerHTML='<img src="'+icon(opt.id)+'" alt=""><h3>'+escape(opt.label)+'</h3><p>'+escape(opt.def.desc)+'</p><span class="lvl-ind">'+(opt.kind==='passive'?'STANDARD · Capacité passive':(C.spells[opt.id]?.group==='common'?'STANDARD':'CLASSE · '+CLASSES[C.spells[opt.id]?.group]?.name)+' · '+(opt.kind==='ultimate'?'ULTIME':'Sort'))+'</span>';
    if(opt.kind==='weapon') {
      const recipe=C.recipes[opt.id];const detail=document.createElement('small');detail.textContent='Ultime : rang 5 + '+C.passives[recipe.passive].name+' rang 1';el.appendChild(detail);
    }
    if(opt.kind==='passive'){const recipes=Object.values(C.recipes).filter(r=>r.passive===opt.id);if(recipes.length){const detail=document.createElement('small');detail.textContent='Ultimes : '+recipes.map(recipe=>C.spells[recipe.weapon].name+' → '+recipe.name).join(' · ');el.appendChild(detail);}}
    if(opt.kind==='class'){const links=(C.synergies||[]).filter(link=>link.to===opt.id||link.from===opt.id);if(links.length){const sy=document.createElement('small');sy.textContent='Synergie : '+[...new Set(links.map(link=>C.spells[link.to===opt.id?link.from:link.to].name))].join(' · ');el.appendChild(sy);}const u=ultimates[opt.id];const detail=document.createElement('small');detail.textContent='Ultime : rang 5 + 1 talent de la branche '+(u.branch?.name||'associée');el.appendChild(detail);}
    el.onclick=onClick;return el;
  }
  drawUpgradeCards=function(container) {
    const choices=buildUpgradeOptions(),pool=choices.slice(),picked=[];
    // Uniform draw without replacement across every currently legal upgrade.
    while(picked.length<3&&pool.length)picked.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
    container.innerHTML='';
    for(const opt of picked){Knowledge.mark(opt.kind==='ultimate'?'ultimate:'+opt.id:opt.id);container.appendChild(card(opt,()=>{if(applyUpgrade(opt)){R.pendingLevels=Math.max(0,R.pendingLevels-1);Game.closeLevelUp();}}));}
    if(!picked.length) {
      const el=document.createElement('button');el.className='btn';el.textContent='Récupérer 20 % de vie et 50 or';
      el.onclick=()=>{Player.heal(Player.hpMax*.2);Player.gold+=50;R.pendingLevels=Math.max(0,R.pendingLevels-1);Game.closeLevelUp();};container.appendChild(el);
    }
    return picked;
  };
  Game.showLevelUp=function(){this.state='levelup';$('levelup-overlay').querySelector('h2').textContent='Niveau '+Player.level+' — forge ta combinaison';drawUpgradeCards($('levelup-cards'));$('reroll-count').textContent=this.rerollsLeft;$('levelup-overlay').classList.remove('hidden');};
  Game.closeLevelUp=function(){$('levelup-overlay').classList.add('hidden');processRewards();};
  function eligibleEvolutions() {
    return Object.values(C.recipes).filter(recipe=>{const w=Player.weapons[recipe.weapon];return ultimateEligible(recipe.weapon);});
  }
  R.eligibleEvolutions=eligibleEvolutions;
  const bindingPanel=document.createElement('div');bindingPanel.id='ss-bind-overlay';bindingPanel.className='overlay hidden';
  bindingPanel.innerHTML='<div class="ss-binding-panel"><h2>Choisir un raccourci</h2><img id="ss-bind-icon" alt=""><h3 id="ss-bind-name"></h3><p>Appuie sur la touche que tu veux utiliser pour ce sort.</p><small>Chiffres 1–9 ou lettres libres. Les touches de déplacement et de menus sont réservées.</small><p id="ss-bind-error" aria-live="polite"></p><button class="btn" id="ss-bind-default"></button></div>';$('game-container').appendChild(bindingPanel);
  const keyName=code=>code?.startsWith('Digit')?code.slice(5):code?.startsWith('Key')?code.slice(3):'?';
  function usableKey(code){return /^Digit[0-9]$/.test(code)||/^Key[A-Z]$/.test(code)&&!['KeyZ','KeyQ','KeyS','KeyD','KeyW','KeyA','KeyT','KeyC','KeyE','KeyI'].includes(code);}
  function keyTaken(code,id){return Player.skills.some(w=>w.id!==id&&w.binding===code);}
  function openBinding(){const id=R.pendingBindings[0],def=C.spells[id];Game.state='binding';for(const key of Object.keys(Keys))Keys[key]=false;$('ss-bind-name').textContent=def.name;$('ss-bind-icon').src=icon(id);$('ss-bind-icon').alt=def.name;$('ss-bind-error').textContent='';const suggested=['Digit1','Digit2','Digit3','Digit4','Digit5','KeyF','KeyR'].find(code=>!keyTaken(code,id));$('ss-bind-default').textContent='Utiliser '+keyName(suggested);$('ss-bind-default').onclick=()=>assignKey(suggested);bindingPanel.classList.remove('hidden');$('ss-bind-default').focus?.();}
  function assignKey(code){const id=R.pendingBindings[0],w=R.state(id);if(!w||Game.state!=='binding')return false;
    if(!usableKey(code)){ $('ss-bind-error').textContent='Cette touche est réservée. Choisis une autre touche.';return false;}
    if(keyTaken(code,id)){ $('ss-bind-error').textContent='Cette touche est déjà utilisée par un autre sort.';return false;}
    w.binding=code;R.pendingBindings.shift();bindingPanel.classList.add('hidden');renderWeaponSlots();processRewards();return true;
  }
  R.assignKey=assignKey;
  addEventListener('keydown',e=>{
    if(Game.state==='binding'){if((e.code==='Enter'||e.code==='Space')&&e.target?.tagName==='BUTTON')return;e.preventDefault();e.stopImmediatePropagation();if(!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey)assignKey(e.code);return;}
    if(Game.state!=='playing')return;const index=Player.skills.findIndex(w=>w.binding===e.code);
    if(index>=0){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)R.activate(index);return;}
    if(['Digit1','Digit2','Digit3'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  function processRewards() {
    if(R.pendingBindings.length){openBinding();return;}
    if(R.pendingLevels>0){Game.showLevelUp();return;}
    if(R.pendingChests>0) {
      R.pendingChests--;
      const choices=buildUpgradeOptions().filter(o=>o.kind!=='ultimate');if(choices.length)applyUpgrade(pick(choices));else Player.gold+=100;
      toast('Coffre : amélioration et 50 or');processRewards();return;
    }
    if(R.talentPoints>0&&!R.deferredTalents){openTalents(true);return;}
    R.deferredTalents=false;Game.state='playing';
  }
  R.processRewards=processRewards;
  function talentAllowed(branch,index) {
    const node=branch.nodes[index];return R.talentPoints>0&&!R.talents.has(node.id)&&Player.level>=node.minLevel&&(index===0||R.talents.has(branch.nodes[index-1].id))&&(index<3||!R.ultimate);
  }
  R.canBuyTalent=talentAllowed;
  R.buyTalent=function(branch,index) {
    if(!talentAllowed(branch,index))return false;
    const node=branch.nodes[index];R.talents.add(node.id);Knowledge.mark('talent:'+node.id,true);R.talentPoints--;if(index===3)R.ultimate=node.id;
    Sound.play('select');renderWeaponSlots();renderTalents();return true;
  };
  function renderTalents() {
    $('ss-talent-summary').textContent=CLASSES[Player.classId].name+' · '+R.talentPoints+' point(s) disponible(s) · un point tous les 5 niveaux · un seul ultime';
    const tree=$('ss-talent-tree');tree.innerHTML='';
    for(const branch of C.trees[Player.classId]) {
      const column=document.createElement('section');column.className='ss-talent-branch';
      const name=document.createElement('h3');name.textContent=branch.name;column.appendChild(name);
      for(const id of branch.skills)Knowledge.mark(id);
      const tags=document.createElement('p');tags.className='ss-branch-skills';tags.textContent=branch.skills.map(id=>C.spells[id].name).join(' · ');column.appendChild(tags);
      branch.nodes.forEach((node,i)=>{
        Knowledge.mark('talent:'+node.id);
        const el=document.createElement('button');el.className='ss-talent'+(R.talents.has(node.id)?' owned':'')+(i===3?' capstone':'');el.disabled=!talentAllowed(branch,i);
        el.innerHTML='<small>Niveau '+node.minLevel+(R.talents.has(node.id)?' · acquis':' · 1 point')+'</small><b>'+escape(node.name)+'</b><span>'+escape(node.desc)+'</span>';
        el.onclick=()=>R.buyTalent(branch,i);column.appendChild(el);
      });tree.appendChild(column);
    }
    $('ss-talents-close').textContent=R.talentPoints?'Garder mes points pour plus tard':'Revenir au combat';
  }
  function openTalents(fromRewards) {
    if(!fromRewards&&!['playing','paused'].includes(Game.state))return;
    R.talentResume=Game.state==='paused'?'paused':'playing';Game.state='talents';renderTalents();panel.classList.remove('hidden');
  }
  function closeTalents() {
    panel.classList.add('hidden');R.deferredTalents=true;
    if(R.pendingLevels||R.pendingChests)processRewards();else Game.state=R.talentResume||'playing';
  }
  function hideRunPanels() {
    for(const id of ['kill-screen','win-screen','levelup-overlay','pause-overlay','shop-overlay','talents-overlay','evolution-overlay','knowledge-overlay','settings-overlay','sanctuary-overlay','ss-stats-overlay','ss-run-setup','ss-bind-overlay'])$(id).classList.add('hidden');
    $('hud').classList.add('hidden');
    for(const key of Object.keys(Keys))Keys[key]=false;
  }
  backToTitle=function(){hideRunPanels();Game.state='title';$('class-screen').classList.add('hidden');$('title-screen').classList.remove('hidden');};
  $('class-back').onclick=()=>backToTitle();
  showClassSelect=function() {
    hideRunPanels();Game.state='classes';$('title-screen').classList.add('hidden');const box=$('class-cards');box.innerHTML='';
    for(const [id,c] of Object.entries(CLASSES)) {
      for(const spell of c.skills)Knowledge.mark(spell);
      const el=document.createElement('button');el.className='class-card';
      const sprite=Sprites.playerSprite(id,'S',false)||ART.player[id]?.S||ART.player.paladin.S;
      el.innerHTML='<img src="'+(sprite.src||sprite.toDataURL())+'" alt=""><h3>'+escape(c.name)+'</h3><p>'+escape(c.desc)+'</p><small>'+escape(c.skills.map(s=>C.spells[s].name).join(' · '))+'</small>';
      const progress=document.createElement('small');progress.className='ss-class-progress';progress.textContent=Acts.records[id].map((h,i)=>(h>=0?'✓':'○')+' '+(i+1)).join(' · ');el.appendChild(progress);
      const detail=document.createElement('small');detail.textContent=SurvivorStats.profiles[id].note;el.appendChild(detail);
      el.onclick=()=>showRunSetup(id);box.appendChild(el);
    }
    $('class-screen').classList.remove('hidden');
  };
  const start=startRun;
  startRun=function(cls){Acts.useClass(cls);renderHeat();setup.classList.add('hidden');start(cls);if(Acts.active>=0){Game.time=Acts.active*180;Game.minute=Acts.active*3;} $('talents-overlay').classList.add('hidden');$('evolution-overlay').classList.add('hidden');renderWeaponSlots();updateHUD();for(const w of Player.skills)if(SurvivorStats.activation(w.def)!=='passive'&&!w.binding)R.pendingBindings.push(w.id);if(R.pendingBindings.length)processRewards();};
  const statsPanel=document.createElement('div');statsPanel.id='ss-stats-overlay';statsPanel.className='overlay hidden';statsPanel.innerHTML='<div class="ss-stats-panel"><h2>Statistiques du héros</h2><p id="ss-stats-note"></p><div id="ss-stats-values"></div><button class="btn" id="ss-stats-close">Revenir</button></div>';$('game-container').appendChild(statsPanel);
  const statsButton=document.createElement('button');statsButton.id='ss-stats-button';statsButton.className='btn small';statsButton.textContent='Stats · C';ribbon.appendChild(statsButton);
  R.autoAim=localStorage.getItem('survivors_auto_aim')==='1';
  function aimControl(id,parent){const label=document.createElement('label');label.className='ss-aim-control';label.innerHTML='<input type="checkbox" id="'+id+'"> Visée automatique';parent.appendChild(label);$(id).checked=R.autoAim;$(id).onchange=()=>{R.autoAim=!!$(id).checked;localStorage.setItem('survivors_auto_aim',R.autoAim?'1':'0');$('ss-aim-setup').checked=$('ss-aim-hud').checked=R.autoAim;};}
  aimControl('ss-aim-setup',$('ss-setup-options'));aimControl('ss-aim-hud',ribbon);
  function openStats(){if(!['playing','paused'].includes(Game.state))return;R.statsResume=Game.state;Game.state='stats';const a=SurvivorStats.get(),pct=n=>Math.round(n*100)+' %',bonus=n=>(n>=0?'+':'')+pct(n);$('ss-stats-note').textContent=CLASSES[Player.classId].name+' · '+SurvivorStats.profiles[Player.classId].note+' Les rangs et talents ajoutent leurs effets propres aux compétences.';
    const rows=[['Dégâts généraux',bonus(a.power)],['Attaque CaC',bonus(a.melee)],['Attaque à distance',bonus(a.ranged)],['Vitesse',Math.round(Player.speed)+' unités/s'],['Armure',a.armor+' · réduction '+pct(Math.min(.6,a.armor*.02))],['Esquive',pct(a.dodge)],['Points de vie',Math.ceil(Player.hp)+' / '+Player.hpMax],['Mana',Math.ceil(Player.mana)+' / '+Player.manaMax],['Régénération mana',a.manaRegen+' /s'],['Critique',pct(a.crit)],['Dégâts des critiques',pct(a.critDamage)],['Vitesse d’attaque',bonus(a.attackSpeed)],['Réduction des cooldowns',bonus(a.cdr)]];
    $('ss-stats-values').innerHTML=rows.map(([name,value])=>'<div><span>'+name+'</span><b>'+value+'</b></div>').join('');statsPanel.classList.remove('hidden');}
  function closeStats(){statsPanel.classList.add('hidden');Game.state=R.statsResume||'playing';}
  statsButton.onclick=openStats;$('ss-stats-close').onclick=closeStats;addEventListener('keydown',e=>{if(e.code==='KeyC'){openStats();e.preventDefault();}else if(e.code==='Escape'&&Game.state==='stats'){closeStats();e.preventDefault();}});
  renderSkillBar=function() {
    const box=$('skill-bar');box.innerHTML='';
    const slots=[...Player.skills,...Array(Math.max(0,3-Player.skills.length)).fill(null),...Object.values(Player.weapons),...Array(Math.max(0,3-Object.keys(Player.weapons).length)).fill(null)];
    slots.forEach((w,i)=>{
      const el=document.createElement('div');el.className='skill-slot ss-slot'+(!w?' empty':'')+(i<3?' class-slot':' common-slot');
      if(w){const name=w.evolved?ultimates[w.id].name:w.def.name;el.dataset.ability=w.id;const activation=SurvivorStats.activation(w.def);if(i<3&&activation!=='passive'){el.onclick=()=>Player.cast(i);el.setAttribute('role','button');el.setAttribute('aria-label',name+' · touche '+keyName(w.binding));}el.innerHTML='<img src="'+icon(w.id)+'" alt="'+escape(name)+'"><span class="ss-rank">'+(w.evolved?'★':w.level)+'</span><div class="skill-cooldown"></div><div class="skill-name"><b>'+escape(name)+'</b><br>'+escape(w.def.desc)+'<br>'+ (i<3?'Compétence de classe':'Arme commune')+' · '+(w.evolved?'évolution':'rang '+w.level+'/5')+'<br>'+ (activation==='passive'?'Passive · automatique':activation==='aura'?'Aura · touche '+keyName(w.binding)+' · '+SurvivorStats.manaDrain(w.def)+' mana/s':'Active · touche '+keyName(w.binding))+'<br>Mana : '+SurvivorStats.manaCost(R.stats(w)).toFixed(1)+' · Recharge : '+R.stats(w).cd.toFixed(2)+' s</div>';}else el.textContent=i<3?'Classe':'Arme';
      if(w){const key=document.createElement('span');key.className='ss-hotkey';key.textContent=i<3&&SurvivorStats.activation(w.def)!=='passive'?keyName(w.binding):'AUTO';el.appendChild(key);}
      box.appendChild(el);
    });
    const passives=$('ss-passives');passives.innerHTML='';
    for(const [id,rank] of Object.entries(Player.passives)){const p=C.passives[id];if(!p)continue;const el=document.createElement('span');el.className='ss-passive';el.title=p.name+' · rang '+rank+'/5 · '+p.desc;el.innerHTML='<img src="'+icon(id)+'" alt="'+escape(p.name)+'"><small>'+rank+'</small>';passives.appendChild(el);}
  };
  renderWeaponSlots=()=>renderSkillBar();
  refreshSkillCooldowns=function(){for(const el of document.querySelectorAll('[data-ability]')){const w=R.state(el.dataset.ability);if(!w)continue;const stats=R.stats(w),cd=stats.cd;el.classList.toggle('mana-starved',SurvivorStats.manaCost(stats)>Player.mana&&w.cd<=0);el.classList.toggle('aura-enabled',!!w.enabled);el.querySelector('.skill-cooldown').style.transform='scaleY('+Math.min(1,(w.cd||0)/Math.max(.1,cd))+')';}};
  updateHUD=function(){legacy.updateHUD();const remaining=Acts.remaining();bossTimer.classList.toggle('hidden',remaining===null);bossTimer.classList.toggle('urgent',remaining!==null&&remaining<=30);if(remaining!==null){const seconds=Math.ceil(remaining);bossTimer.textContent='Acte '+(Acts.index+1)+' · Boss · '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' restantes';}$('ss-run-level').textContent='Niveau '+Player.level+' · Acte '+(Acts.index+1)+' · Chaleur '+Heat.active+' · ✓ '+Acts.cleared.filter(h=>h>=0).length+'/5';$('ss-talent-count').textContent=R.talentPoints;$('hp-label').textContent=Math.ceil(Player.hp)+' / '+Player.hpMax;$('mp-label').textContent=Math.ceil(Player.mana)+' / '+Player.manaMax;$('mp-fill').style.height=(Player.mana/Player.manaMax)*100+'%';};
  // Shops use the same caps and inventory APIs as level-up rewards.
  const manaPotion=SHOP_POOL.find(it=>it.id==='potionMP');if(manaPotion){manaPotion.name='Rune de refonte';manaPotion.desc='+1 relance de choix de progression.';}
  const shopRules={potionHP:[160,2],potionMP:[180,1],weaponUp:[360,2],armorUp:[270,2],reroll:[220,1],magnetNow:[120,2],maxHP:[520,1],essenceDust:[600,1]};
  for(const it of SHOP_POOL){const rule=shopRules[it.id];if(rule){it.cost=rule[0];it.limit=rule[1];}}
  buyShopItem=function(it) {
    it=SHOP_POOL.find(article=>article.id===it?.id);if(!it)return;
    const purchased=Player.shopPurchases||(Player.shopPurchases={});
    if((purchased[it.id]||0)>=it.limit){Sound.play('deny');toast('Stock épuisé pour cette descente.');return;}
    if(Player.gold<it.cost){Sound.play('deny');return;}
    let success=true;
    if(it.id==='weaponUp'){const ws=R.owned().filter(w=>w.level<5&&!w.evolved);if(!ws.length)success=false;else {const w=pick(ws);w.level++;}}
    else if(it.id==='armorUp')success=Player.gainPassive('armor');
    else if(it.id==='potionMP'||it.id==='reroll')Game.rerollsLeft++;
    else if(it.id==='potionHP')Player.heal(Player.hpMax);
    else if(it.id==='magnetNow')magnetAllGems();
    else if(it.id==='maxHP'){R.flatHP=(R.flatHP||0)+20;Player.hpMax+=20;Player.hp+=20;}
    else if(it.id==='essenceDust'){Meta.essence++;Meta.save();}
    else success=false;
    if(success){Player.gold-=it.cost;purchased[it.id]=(purchased[it.id]||0)+1;Sound.play('buy');renderWeaponSlots();renderShop();}else{Sound.play('deny');toast('Amélioration indisponible : limite atteinte.');}
  };

  SurvivorIntegration.updateCamera=function() {
    const world=currentMapWorld();if(!world){CAM.x=Player.x;CAM.y=Player.y;return;}
    CAM.zoom=Math.max(1,VW/world.w,VH/world.h);
    const hx=VW/(2*CAM.zoom),hy=VH/(2*CAM.zoom);
    CAM.x=clamp(Player.x,hx,world.w-hx);CAM.y=clamp(Player.y,hy,world.h-hy);
  };
  const oldShopAppear=Shopkeeper.appear;
  Shopkeeper.appear=function(){oldShopAppear.call(this);const world=currentMapWorld();if(world){this.x=clamp(this.x,60,world.w-60);this.y=clamp(this.y,60,world.h-60);}};
  draw=function() {
    ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#14110e';ctx.fillRect(0,0,VW,VH);ctx.imageSmoothingEnabled=false;
    SurvivorIntegration.updateCamera();
    const w2s=(x,y)=>[(x-CAM.x)*CAM.zoom+VW/2,(y-CAM.y)*CAM.zoom+VH/2];
    const map=currentMapImage(),world=currentMapWorld();
    if(map&&world){const [x,y]=w2s(0,0);ctx.drawImage(map,x,y,world.w*CAM.zoom,world.h*CAM.zoom);}
    else {const x=-((CAM.x*CAM.zoom)%512)-512,y=-((CAM.y*CAM.zoom)%512)-512;for(let yy=y;yy<VH;yy+=512)for(let xx=x;xx<VW;xx+=512)ctx.drawImage(ART.floorCanvas,xx,yy);}
    SurvivorBosses.draw(ctx,w2s,R);
    for(const corpse of R.corpses){const [x,y]=w2s(corpse.x,corpse.y);ctx.fillStyle='#635565';ctx.fillRect(x-4,y-1,8,2);}
    for(const f of R.fields){const [x,y]=w2s(f.x,f.y);ctx.fillStyle=hexToRgba(f.color,.12);ctx.strokeStyle=hexToRgba(f.color,.4);ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,f.r*CAM.zoom,0,TAU);ctx.fill();ctx.stroke();if(['aura','hurricane','whirl','shield','nova','curse','fissure','blizzard','corpse','cry','plague'].includes(f.ctx.s.mode)){ctx.globalAlpha=.5;SurvivorSpellArt.draw(ctx,f.ctx.id,x,y,f.r*2*CAM.zoom,R.now,0,true);ctx.globalAlpha=1;}}
    for(const item of pickups){
      const [x,y]=w2s(item.x,item.y);if(x<-30||y<-50||x>VW+30||y>VH+30)continue;
      const xp=['small','mid','big','giant'].includes(item.type),heal=['heart','flaskHP'].includes(item.type);
      ctx.save();ctx.fillStyle='rgba(12,9,7,.5)';ctx.beginPath();ctx.ellipse(x,y+4,xp?6:9,3,0,0,TAU);ctx.fill();ctx.shadowColor=heal?'#9b4540':xp?'#647d89':'#9d8357';ctx.shadowBlur=xp?5:7;
      const sprite=ART.gems[item.type]||ART[item.type]||(item.type==='essenceP'?ART.essence:null);
      if(sprite){const size=xp?Math.max(9,Math.min(14,sprite.width*1.4)):18;ctx.drawImage(sprite,x-size/2,y-size/2,size,size);}
      else if(item.type!=='equipment'){ctx.fillStyle='#b49c6c';ctx.fillRect(x-3,y-3,6,6);}
      ctx.restore();
    }
    if(Shopkeeper.active){const [x,y]=w2s(Shopkeeper.x,Shopkeeper.y);ctx.drawImage(ART.shopTent,x-24,y-30,48,34);}
    const bodies=[...enemies.filter(e=>!e.dead).map(e=>({kind:'enemy',body:e,y:e.y})),...R.allies.filter(a=>!a.dead).map(a=>({kind:'ally',body:a,y:a.y})),{kind:'player',body:Player,y:Player.y}].sort((a,b)=>a.y-b.y);
    for(const item of bodies) {
      const body=item.body,[x,y]=w2s(body.x,body.y);if(x<-100||x>VW+100||y<-100||y>VH+100)continue;
      let sprite,frame,width,height;
      if(item.kind==='player'){sprite=Sprites.playerSprite(Player.classId,Player.facing,Player.attackAnimT>0)||ART.player[Player.classId]?.S||ART.player.paladin.S;width=48;height=48;if(Player.invuln>0&&Math.floor(R.now*15)%2)ctx.globalAlpha=.5;}
      else if(item.kind==='enemy'){frame=body.boss?Sprites.bossSprite(body.sprite,body.bossBossAttackT>0?'attack':'idle',R.now*(body.bossTempo||1.2)):Sprites.monsterSprite(body.sprite,'idle',R.now);sprite=frame?.img||ART[body.sprite]||ART.fallen;width=body.boss?64:32;height=width;}
      else {
        const key=body.id.split('_')[1];
        if(key==='skeletons')frame=Sprites.monsterSprite('skeleton','idle',R.now);
        if(key==='valkyrie')sprite=Sprites.playerSprite('amazon','S',false);
        if(key==='shadow')sprite=Sprites.playerSprite('assassin','S',false);
        if(key==='wolves'||key==='grizzly'||body.turret){sprite=SurvivorSpellArt.get(body.id);frame={img:sprite,sx:(Math.floor(R.now*8)%4)*32,sw:32};}
        sprite=sprite||frame?.img||C.spells[body.id]?.image;width=key==='grizzly'?40:32;height=width;if(body.decoy)ctx.globalAlpha=.4;
      }
      if(sprite&&(!sprite.complete||sprite.naturalWidth!==0)){if(frame)ctx.drawImage(sprite,frame.sx,0,frame.sw,sprite.height,x-width/2,y-height+8,width,height);else ctx.drawImage(sprite,x-width/2,y-height+8,width,height);}
      else {ctx.fillStyle=item.kind==='enemy'?'#ab6e62':'#e4d6a2';ctx.fillRect(x-7,y-20,14,20);}
      ctx.globalAlpha=1;
      if(item.kind==='ally'){ctx.strokeStyle='#89c9b4';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y+3,width*.32,5,0,0,TAU);ctx.stroke();}
      if(item.kind==='enemy'&&body.cursedUntil>R.now)SurvivorSpellArt.draw(ctx,'necromancer_curse',x,y-height-10,14,R.now);
      if(item.kind==='enemy'&&(body.boss||body.elite||body.hp<body.hpMax)){const w=body.boss?70:28;ctx.fillStyle='#20141a';ctx.fillRect(x-w/2,y-height-3,w,4);ctx.fillStyle=body.boss?'#d47a65':'#bdac6c';ctx.fillRect(x-w/2,y-height-3,w*Math.max(0,body.hp/body.hpMax),4);}
    }
    for(const w of Object.values(Player.weapons))if((C.spells[w.id].mode==='orbit'||C.spells[w.id].weaponKind==='flail')){const s=R.stats(w);for(let i=0;i<s.count;i++){const a=w.orbitAngle+i*TAU/s.count;const [x,y]=w2s(Player.x+Math.cos(a)*s.radius*(s.evolved?1.2:1),Player.y+Math.sin(a)*s.radius*(s.evolved?1.2:1));ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.drawImage(SurvivorWeaponArt.get('flail'),-12,-12,24,24);ctx.restore();}}
    if(R.shieldHP>0){const [x,y]=w2s(Player.x,Player.y);SurvivorSpellArt.draw(ctx,'paladin_shield',x,y-12,64*CAM.zoom,R.now,0,true);ctx.strokeStyle='#e1ca80';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-12,24,0,TAU);ctx.stroke();}
    for(const p of R.bullets){const [x,y]=w2s(p.x,p.y);ctx.save();ctx.translate(x,y);ctx.scale(CAM.zoom,CAM.zoom);ctx.rotate(p.angle+p.age*(p.mode==='axe'||p.mode==='hammer'?7:0));
      const spellSprite=SurvivorSpellArt.projectile(p);if(spellSprite&&SurvivorSpellArt.draw(ctx,spellSprite,0,0,p.mode==='orb'?26:22,R.now)){ctx.restore();continue;}const sprite=projectileArt(p);if(p.ctx?.s?.weaponKind==='dagger')ctx.rotate(Math.PI/2);ctx.globalAlpha=.25;ctx.drawImage(sprite,-sprite.width/2-5,-sprite.height/2);ctx.globalAlpha=1;ctx.drawImage(sprite,-sprite.width/2,-sprite.height/2);ctx.restore();}
    for(const f of R.fx){const [x,y]=w2s(f.x,f.y),ratio=f.life/f.maxLife;ctx.strokeStyle=hexToRgba(f.color,Math.max(.2,ratio));ctx.lineWidth=f.kind==='warning'?2:1;ctx.beginPath();
      if(f.kind==='spell'){SurvivorSpellArt.draw(ctx,f.spellId,x,y,48,R.now);}
      else if(f.kind==='weapon'){ctx.save();ctx.translate(x,y);ctx.rotate((f.angle||0)+Math.PI/2+(f.weaponKind==='spear'?0:(1-ratio)*.8));ctx.drawImage(SurvivorWeaponArt.get(f.weaponKind),-16,-16,32,32);ctx.restore();}
      else if(f.kind==='slash'){ctx.lineWidth=3;ctx.arc(x,y,f.r*CAM.zoom,-Math.PI*.8,Math.PI*.1);ctx.stroke();ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,Math.max(2,f.r-4)*CAM.zoom,-Math.PI*.8,Math.PI*.1);ctx.stroke();}
      else{ctx.arc(x,y,f.r*CAM.zoom*(f.kind==='warning'?1:1.1-ratio*.15),0,TAU);ctx.stroke();if(f.kind==='warning'){ctx.fillStyle=hexToRgba(f.color,.08);ctx.fill();}}}
    if(Game.state==='playing'&&!R.autoAim&&R.aimPoint){const [x,y]=w2s(R.aimPoint.x,R.aimPoint.y);ctx.strokeStyle='#e4d3a0';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,7,0,TAU);ctx.moveTo(x-11,y);ctx.lineTo(x+11,y);ctx.moveTo(x,y-11);ctx.lineTo(x,y+11);ctx.stroke();}
    for(const l of lightning){const [x,y]=w2s(l.x1,l.y1),[xx,yy]=w2s(l.x2,l.y2);ctx.strokeStyle='#b1cfee';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo((x+xx)/2+7,(y+yy)/2-5);ctx.lineTo(xx,yy);ctx.stroke();}
    for(const p of particles){const [x,y]=w2s(p.x,p.y);ctx.globalAlpha=Math.max(0,p.life/p.maxLife);ctx.fillStyle=p.color;if(p.kind==='dmg'){ctx.font='bold '+p.size+'px serif';ctx.textAlign='center';ctx.fillText(p.text,x,y);}else ctx.fillRect(x,y,p.size,p.size);}
    ctx.globalAlpha=1;
    drawShopLocator(w2s);
    for(const boss of enemies)if(boss.boss&&!boss.dead)drawMapLocator(w2s,boss.x,boss.y,boss.name||'Boss','#c58a78');
    const bosses=enemies.filter(e=>e.boss&&!e.dead);if(bosses.length){const boss=bosses[0],w=Math.min(480,VW*.55);ctx.fillStyle='#170e12';ctx.fillRect((VW-w)/2,55,w,9);ctx.fillStyle='#b14e45';ctx.fillRect((VW-w)/2,55,w*Math.max(0,boss.hp/boss.hpMax),9);ctx.font='14px serif';ctx.textAlign='center';ctx.fillStyle='#dfc7a1';ctx.fillText(boss.name,VW/2,48);}
  };
  function mapLabel(text,x,y,color='#ffe092') {
    ctx.save();ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const width=ctx.measureText(text).width+12;
    ctx.fillStyle='rgba(8,9,13,.94)';ctx.fillRect(x-width/2,y-10,width,20);ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.restore();
  }
  function drawShopLocator(w2s) {
    if(!Shopkeeper.active)return;
    const [x,y]=w2s(Shopkeeper.x,Shopkeeper.y);
    if(x>=24&&x<=VW-24&&y>=75&&y<=VH-150){if(Shopkeeper.near())mapLabel('Boutique · E',x,y-40,'#bfa77b');return;}
    drawMapLocator(w2s,Shopkeeper.x,Shopkeeper.y,'Boutique','#cfb588');
  }
  function drawMapLocator(w2s,wx,wy,label,color) {
    const [sx,sy]=w2s(wx,wy);
    if(sx>=24&&sx<=VW-24&&sy>=75&&sy<=VH-150)return;
    const left=70,right=Math.max(left,VW-70),top=88,bottom=Math.max(top,VH-165);
    const cx=VW/2,cy=(top+bottom)/2,dx=sx-cx,dy=sy-cy;
    const tx=dx>0?(right-cx)/dx:dx<0?(left-cx)/dx:Infinity,ty=dy>0?(bottom-cy)/dy:dy<0?(top-cy)/dy:Infinity;
    const t=Math.min(tx,ty),x=cx+dx*t,y=cy+dy*t;
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));ctx.fillStyle=color;ctx.strokeStyle='#211811';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(-7,-7);ctx.lineTo(-3,0);ctx.lineTo(-7,7);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    ctx.save();ctx.font='bold 13px serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#211811';ctx.strokeText(label,x,y+20);ctx.fillStyle=color;ctx.fillText(label,x,y+20);ctx.restore();
  }
  const projectileCache={};
  function projectileArt(p) {
    const id=p.ctx?.id||'hostile',mode=p.mode;
    const map={amazon_multishot:'arrow',amazon_guided:'arrow',amazon_fury:'javelin',amazon_plague:'javelin',barbarian_throw:'axe',necromancer_spear:'boneSpear',paladin_hammer:'hammer',common_axes:'axe',common_knives:'swordS'};
    if(p.ctx?.s?.mode==='weapon')return SurvivorWeaponArt.get(p.ctx.s.weaponKind,true);
    const existing=ART.projectiles[map[id]||({axe:'axe',hammer:'hammer',frost:'icebolt'}[mode])];
    if(existing)return existing;
    const key=id+':'+mode;if(projectileCache[key])return projectileCache[key];
    const c=document.createElement('canvas');c.width=c.height=20;const g=c.getContext('2d');g.fillStyle=p.color;
    if(mode==='tornado'){for(let i=0;i<4;i++){g.fillRect(4+i,2+i*4,13-i*2,2);g.fillStyle=i%2?'#e2edf0':p.color;}}
    else if(id==='common_skulls'||mode==='homing'){g.fillRect(5,4,10,9);g.fillRect(7,13,6,3);g.fillStyle='#292233';g.fillRect(7,7,2,3);g.fillRect(11,7,2,3);g.fillRect(9,12,2,2);}
    else if(mode==='orb'||mode==='fireball'||mode==='hostile'||id==='sorceress_hydra'||id==='assassin_wake'){g.fillRect(5,4,11,11);g.fillRect(3,6,15,7);g.fillStyle=mode==='orb'?'#e8f8ff':'#fff0b5';g.fillRect(9,7,6,5);g.fillStyle=p.color;g.fillRect(0,7,4,2);g.fillRect(1,12,4,2);}
    else{g.fillRect(2,9,15,3);g.fillRect(11,6,3,3);g.fillRect(14,12,3,3);g.fillStyle='#faf0d6';g.fillRect(15,8,4,3);}
    projectileCache[key]=c;return c;
  }
  const petCache={};
  function petArt(kind) {
    if(petCache[kind])return petCache[kind];const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');
    g.fillStyle=kind==='grizzly'?'#93643e':'#b7c0c5';g.fillRect(5,10,23,13);g.fillRect(1,7,10,11);g.fillRect(6,23,4,6);g.fillRect(23,23,4,6);g.fillRect(1,3,4,7);g.fillRect(7,3,4,7);g.fillStyle='#26282a';g.fillRect(2,11,2,2);g.fillRect(0,15,3,3);petCache[kind]=c;return c;
  }
})();
