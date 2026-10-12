#!/usr/bin/env node
'use strict';
// Bounded diagnostic bot; executes the browser combat pipeline without drawing.
const {createHarness}=require('../tests/helpers/game-harness.cjs');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const projectRoot=path.resolve(__dirname,'..');
const loadedScripts=[...fs.readFileSync(path.join(projectRoot,'index.html'),'utf8').matchAll(/<script src="([^"?]+)(?:\?[^" ]*)?"/g)].map(m=>m[1]);
const codeVersion={node:process.version,sha256:Object.fromEntries([...loadedScripts,'scripts/balance-runs.cjs','tests/helpers/game-harness.cjs'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(projectRoot,file))).digest('hex')]))};
const arg=name=>process.argv.find(x=>x.startsWith('--'+name+'='))?.split('=').slice(1).join('=');
const screen=process.argv.includes('--progression-screen');
const duration=Number(arg('seconds')||(screen?120:360)),dt=Number(arg('dt')||.05);
if(!(duration>0&&duration<=480&&dt>0&&dt<=.05))throw Error('seconds must be (0,480], dt (0,.05]');
const seeds=(arg('seeds')||'baseline-1').split(','),classes=(arg('classes')||(screen?'paladin':'paladin,sorceress,amazon,necromancer,druid,barbarian,assassin')).split(',');
if(seeds.length*classes.length*(screen?24:1)>28)throw Error('Maximum 28 diagnostic runs per invocation');
function simulate(cls,seed,config={act:Number(arg('act')||1),heat:Number(arg('heat')||0),gear:arg('gear')||'naked',meta:arg('meta')||'none'}){
 const h=createHarness({seed}),{player:p,game:g,runtime:r,sandbox:s}=h;
 if(![1,2,3,4,5].includes(config.act)||![0,6,30].includes(config.heat)||!['naked','low','high-offense','high-defense'].includes(config.gear)||!['none','max'].includes(config.meta))throw Error('Invalid diagnostic progression configuration');
 applyEquipment(h,cls,config.gear);
 if(config.meta==='max')h.run('Meta.upgrades={vital:5,might:5,swift:5,fortune:5}');
 const heatVector=Object.fromEntries(['hp','damage','speed','elite','xp','rate'].map(id=>[id,config.heat/6]));
 s.SurvivorActs.selected=config.act-1;s.SurvivorActs.records[cls][config.act-1]=0;s.SurvivorHeat.ranks=heatVector;s.SurvivorHeat.refresh();
 h.run(`Game.reset(${JSON.stringify(cls)});Game.state='playing';Sound.enabled=false;`);
 s.SurvivorRunRng.reset(seed);
 let incoming=0,actions=0,totalXP=0,lastXP=p.xp,previousLevel=p.level;
 const takeDamage=p.takeDamage;p.takeDamage=function(...args){const before=this.hp,result=takeDamage.apply(this,args);incoming+=Math.max(0,before-this.hp);return result;};
 const step=h.run(`(dt)=>{updateProgress(dt);if(Game.state!=='playing')return;let ix=(Keys.right?1:0)-(Keys.left?1:0),iy=(Keys.down?1:0)-(Keys.up?1:0);if(ix&&iy){ix*=.707;iy*=.707;}Player.x+=ix*Player.speed*dt;Player.y+=iy*Player.speed*dt;const world=currentMapWorld();if(world){Player.x=clamp(Player.x,24,world.w-24);Player.y=clamp(Player.y,24,world.h-24);}if(ix||iy)Player.facing=facing8(ix,iy);Player.update(dt);Wave.update(dt);Shopkeeper.update(dt);updateWeapons(dt);updateEnemies(dt);updateProjectiles(dt);updateZones(dt);updatePickups(dt);updateTraps(dt);updateParticles(dt);updateToasts(dt);}`);
 const keys=h.run('Keys'),pickups=h.run('pickups'),checkpoints=[];
 function settle(){for(let guard=0;guard<100;guard++){
  if(g.state==='binding'){const code=Array.from({length:9},(_,i)=>'Digit'+(i+1)).find(c=>!p.skills.some(w=>w.binding===c));r.assignKey(code);actions++;}
  else if(g.state==='levelup'){const card=h.document.getElementById('levelup-cards').children.find(x=>typeof x.onclick==='function');if(!card)throw Error('No reward card');card.onclick();actions++;}
  else if(g.state==='omens'){const card=h.document.getElementById('ss-omens-cards').children.find(x=>typeof x.onclick==='function');if(!card)throw Error('No omen card');card.onclick();actions++;}
  else if(g.state==='evolution'){const card=h.document.getElementById('ss-evolution-cards').children.find(x=>typeof x.onclick==='function');if(!card)throw Error('No evolution card');card.onclick();actions++;}
  else if(g.state==='talents'){const tree=s.SurvivorCatalogue.trees[cls],starter=p.skills[0].id;const branches=[...tree].sort((a,b)=>Number(b.skills.includes(starter))-Number(a.skills.includes(starter)));for(const branch of branches)for(let i=0;i<branch.nodes.length;i++)if(r.canBuyTalent(branch,i)){r.buyTalent(branch,i);actions++;}h.document.getElementById('ss-talents-close').onclick();}
  else return;
 }throw Error('Reward loop exceeds bound');}
 function record(at){const damage=Object.values(r.damageBySkill).reduce((a,b)=>a+b,0);return {checkpoint:at,activeTime:+g.time.toFixed(2),state:g.state,level:p.level,xp:p.xp,xpNext:p.xpNext,totalXpCollected:totalXP,hp:+p.hp.toFixed(2),mana:+p.mana.toFixed(2),damage:+damage.toFixed(2),dps:+(damage/Math.max(dt,g.time)).toFixed(2),incomingHpDamage:+incoming.toFixed(2),manaWaits:r.manaWaits,kills:p.kills??h.run('Run.kills'),damageBySkill:{...r.damageBySkill},telemetry:s.SurvivorTelemetry?.snapshot?.()??null};}
 let elapsed=0,next=120;
 settle();
 for(let tick=0;tick<Math.ceil(duration/dt)&&g.state==='playing';tick++){
  // Inputs every 200 ms: seek nearby XP, repel nearby enemies, stay in the arena.
  if(tick%Math.max(1,Math.round(.2/dt))===0){
   const melee=['paladin','barbarian','assassin'].includes(cls),target=r.nearest(p.x,p.y,350);
   let x=1024-p.x,y=1024-p.y,best=220;
   for(const q of pickups){const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<best){best=d;x=q.x-p.x;y=q.y-p.y;}}
   if(target){const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),contact=p.r+target.r+12;
    if(melee){const ready=r.basicCD<=.2||p.skills.some((w,i)=>w.def.mode==='melee'&&p.canCast(i)),reach=Math.min(65,p.skills[0].def.radius||65),desired=Math.max(contact+3,reach-target.r);
     if(d>desired+5){x=dx;y=dy;}else if(d<contact||!ready&&d<contact+30){x=-dx;y=-dy;}else{x=-dy*.25;y=dx*.25;}
    }
    if(melee)r.aimPoint={x:target.x,y:target.y};
   }
   for(const e of h.enemies){if(e.dead||e===target&&melee)continue;const d=Math.hypot(e.x-p.x,e.y-p.y),safe=melee?p.r+e.r+12:95;if(d<safe){x+=(p.x-e.x)*3;y+=(p.y-e.y)*3;}}
   if(Math.hypot(x,y)<8){x=Math.cos(elapsed*.3)*30;y=Math.sin(elapsed*.3)*30;}
   keys.right=x>8;keys.left=x< -8;keys.down=y>8;keys.up=y< -8;
   for(let i=0;i<p.skills.length;i++){const w=p.skills[i],activation=s.SurvivorStats.activation(w.def),inRange=target&&(w.def.mode!=='melee'||Math.hypot(target.x-p.x,target.y-p.y)<r.stats(w).radius+target.r);
    if((!melee||inRange)&&activation!=='passive'&&!(activation==='aura'&&w.enabled)&&p.canCast(i)){r.activate(i,melee?r.aimPoint:null);actions++;}}

  }
  step(dt);elapsed+=dt;
  // XP awards can cross levels before this observation: reconstruct cost consumed.
  let cost=previousLevel===1?12:Math.round(10+previousLevel*4.5+Math.pow(previousLevel,1.12)*1.5),consumed=0;
  for(let level=previousLevel;level<p.level;level++){consumed+=cost;cost=Math.round(10+(level+1)*4.5+Math.pow(level+1,1.12)*1.5);}
  totalXP+=Math.max(0,p.xp-lastXP+consumed);lastXP=p.xp;previousLevel=p.level;
  settle();if(elapsed+1e-7>=next){checkpoints.push(record(next));next+=120;}
 }
 for(;next<=duration;next+=120)checkpoints.push({...record(next),unreached:true});
 return {class:cls,seed,dt,configuration:{...config,heatVector},requestedDuration:duration,simulatedDuration:+elapsed.toFixed(2),actions,checkpoints,final:record(null),rng:s.SurvivorRunRng.snapshot()};
}
function applyEquipment(h,cls,variant){
 const E=h.sandbox.SurvivorEquipment,bases={head:'helm',neck:'amulet',shoulder:'pauldrons',torso:'plate',wrist:'bracers',hands:'gloves',ring1:'signet',ring2:'signet',legs:'greaves',feet:'boots',mainhand:'sword',offhand:'dagger'};
 if(variant==='naked')return;
 for(const [slot,baseId]of Object.entries(bases)){
  const desired=variant==='high-defense'?['bear','turtle','phoenix','owl']:['dragon','tiger','wolf','eagle'];let available=E.affixes.map(a=>a.id),n=0;
  const rng=()=>{if(n<4){const ix=available.indexOf(desired[n++]),value=(ix+.1)/available.length;available.splice(ix,1);return value;}return .5;};
  const item=E.generate({baseId,rarity:variant==='low'?0:5,level:variant==='low'?1:40,rng:variant==='low'?()=>.5:rng}),inserted=E.insert(item);
  if(!inserted||!E.equip(cls,inserted.pos,slot))throw Error('Profile equipment rejected: '+slot);
 }
}
function equipmentProfiles(){
 const rows=[];
 for(const cls of ['paladin','sorceress'])for(const variant of ['naked','low','high-offense','high-defense','high-meta']){
  const h=createHarness(),E=h.sandbox.SurvivorEquipment;applyEquipment(h,cls,variant);
  if(variant==='high-meta')h.run('Meta.upgrades={vital:5,might:5,swift:5,fortune:5}');
  h.run(`Game.reset('${cls}');Game.state='playing'`);const attributes=h.sandbox.SurvivorStats.get(),stats=h.runtime.stats(h.player.skills[0]);
  rows.push({class:cls,variant,attributes,hpMax:h.player.hpMax,speed:h.player.speed,starterDamage:stats.dmg,starterCooldown:stats.cd,expectedSingleHitDps:stats.dmg*(1+attributes.crit*(attributes.critDamage-1))/stats.cd,gear:E.totals(cls),rawGear:E.rawTotals(cls),gearCaps:E.gearCaps});
 }
 return {protocol:'generated-equipment-profiles-v1',codeVersion,note:'Real engine stats; expected damage of one hit per cooldown, no mana/target/area simulation. Twelve valid slots; ancient level40 with named four-affix profiles is a diagnostic stress case, not a loot probability estimate.',rows};
}
if(process.argv.includes('--equipment-profiles'))console.log(JSON.stringify(equipmentProfiles(),null,2));
else{const started=performance.now(),runs=[];for(const seed of seeds)for(const cls of classes){
 if(screen)for(const act of [1,5])for(const heat of [0,6,30])for(const gear of ['naked','high-offense'])for(const meta of ['none','max'])runs.push(simulate(cls,seed,{act,heat,gear,meta}));
 else runs.push(simulate(cls,seed));
 }
 console.log(JSON.stringify({protocol:'diagnostic-bot-v3-omens',codeVersion,inputInterval:.2,rewardPolicy:'first displayed upgrade, omen or evolution card',talentPolicy:'starter branch first then catalogue order',equipment:screen?'per-run configuration':arg('gear')||'none equipped, pickups allowed',meta:screen?'per-run configuration':arg('meta')||'fresh in-memory storage',elapsedWallSeconds:+((performance.now()-started)/1000).toFixed(3),runs},null,2));}
