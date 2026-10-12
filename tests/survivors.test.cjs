// Dependency-free integration/behavior tests of the real browser scripts in a DOM shim.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const nodes=new Map();
const drawing=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),measureText:s=>({width:s.length*6})},{get:(o,k)=>k in o?o[k]:()=>{}});
class Element {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.style={};this.disabled=false;this.width=32;this.height=32;this.classes=new Set();this.classList={add:(...xs)=>xs.forEach(x=>this.classes.add(x)),remove:(...xs)=>xs.forEach(x=>this.classes.delete(x)),toggle:(x,v)=>v?this.classes.add(x):this.classes.delete(x),contains:x=>this.classes.has(x)};}
 set innerHTML(v){this._html=v;this.children=[];for(const [,id]of v.matchAll(/id="([^"]+)"/g))if(!nodes.has(id))nodes.set(id,new Element());}
 get innerHTML(){return this._html||'';}
 appendChild(n){this.children.push(n);if(n.id)nodes.set(n.id,n);return n;}
 querySelector(sel){if(!this.selectors)this.selectors={};return this.selectors[sel]||(this.selectors[sel]=new Element());}
 querySelectorAll(){return this.children;}
 addEventListener(){} setAttribute(name,value){this[name]=value;}
 getContext(){return drawing;}toDataURL(){return 'data:image/png;base64,';}
}
const document={getElementById(id){if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);},createElement:tag=>new Element(tag),querySelectorAll:()=>[],head:new Element('head')};
class ImageMock {
 set src(v){this._src=v;this.complete=true;this.width=this.height=v.includes('tiles')?1254:v.includes('boss_')?64:v.includes('sprites/')?48:32;this.naturalWidth=this.width;queueMicrotask(()=>{if(this.onload)this.onload();});}get src(){return this._src;}
}
const storage=new Map(),events=new Map();
const sandbox={console,document,Image:ImageMock,URLSearchParams,location:{search:'',reload(){}},innerWidth:1280,innerHeight:720,performance:{now:()=>0},requestAnimationFrame(){},addEventListener(type,handler){if(!events.has(type))events.set(type,[]);events.get(type).push(handler);},setTimeout(){},navigator:{},localStorage:{getItem(key){return storage.get(key)||null;},setItem(key,value){storage.set(key,value);}},fetch:()=>Promise.resolve({ok:true,json:()=>Promise.resolve({maps:[]})})};
sandbox.window=sandbox;vm.createContext(sandbox);
for(const f of ['helpers','systems','art','assets','data','entities','levels','main'])vm.runInContext(fs.readFileSync(path.join(root,'js',f+'.js'),'utf8'),sandbox,{filename:f+'.js'});
for(const f of ['catalog','bosses','runtime','equipment','stats','weapon-art','spell-art','integration','equipment-ui','hud-controls'])vm.runInContext(fs.readFileSync(path.join(root,'js/survivors',f+'.js'),'utf8'),sandbox,{filename:f+'.js'});
const run=src=>vm.runInContext(src,sandbox);
const C=sandbox.SurvivorCatalogue,R=sandbox.SurvivorRuntime;
const player=run('Player'),game=run('Game'),enemies=run('enemies');
function reset(cls='sorceress'){run(`Game.reset('${cls}');Game.state='playing';Sound.enabled=false;`);}
function enemy(x=1050,y=1024){return run(`spawnEnemy('zombie',${x},${y})`);}
function autoBind(){while(game.state==='binding'){const code=Array.from({length:9},(_,i)=>'Digit'+(i+1)).find(c=>!player.skills.some(w=>w.binding===c));assert.ok(R.assignKey(code));}}
let passed=0;function test(name,fn){fn();passed++;console.log('PASS',name);}

test('initial title draw is safe before the first run reset',()=>run('draw()'));

test('catalog: 45 abilities, 16 passives, 10 recipes, 84 linked talents',()=>{assert.equal(Object.keys(C.spells).length,45);assert.equal(Object.keys(C.passives).length,16);assert.equal(Object.keys(C.recipes).length,10);assert.equal(Object.values(C.trees).flat().flatMap(b=>b.nodes).length,84);for(const tree of Object.values(C.trees))for(const b of tree){assert.equal(b.nodes.length,4);for(const id of b.skills)assert.ok(C.spells[id]);}});
test('seven classes have one correct starter and reset all run state',()=>{for(const cls of Object.keys(C.trees)){reset(cls);assert.equal(player.skills.length,1);assert.equal(player.skills[0].def.group,cls);assert.equal(Object.keys(player.weapons).length,0);assert.equal(R.talents.size,0);assert.equal(R.talentPoints,0);assert.equal(player.canCast(0),sandbox.SurvivorStats.activation(player.skills[0].def)!=='passive');}});
test('inventory caps and class isolation are enforced by acquisition APIs',()=>{reset();for(const s of Object.values(C.spells))if(s.group==='sorceress')player.gainClassSkill(s.id);for(const s of Object.values(C.spells))if(s.group==='common')player.gainWeapon(s.id);for(const p of Object.keys(C.passives))player.gainPassive(p);assert.equal(player.skills.length,3);assert.equal(Object.keys(player.weapons).length,3);assert.equal(Object.keys(player.passives).length,6);assert.equal(player.gainClassSkill('amazon_multishot'),false);});
test('vitality scales additively, caps at 5 and does not leak across runs',()=>{reset();const base=player.hpMax;for(let i=0;i<8;i++)player.gainPassive('vitality');assert.equal(player.hpMax,Math.round(base*1.5));assert.equal(player.passives.vitality,5);reset();assert.equal(player.hpMax,base);});
test('all 45 abilities, with their class capstone, execute finite combat frames',()=>{
 for(const s of Object.values(C.spells)) {
  reset(s.group==='common'?'sorceress':s.group);player.skills=[];player.weapons={};
  if(s.group==='common')player.gainWeapon(s.id);else player.gainClassSkill(s.id);
  const w=R.state(s.id);w.level=5;
  if(s.group==='common'){w.evolved=true;player.passives[C.recipes[s.id].passive]=3;}
  else {for(const branch of C.trees[s.group])if(branch.skills.includes(s.id))for(const node of branch.nodes)R.talents.add(node.id);}
  for(let k=0;k<18;k++){const e=enemy(1024+Math.cos(k)*(30+Math.floor(k/6)*80),1024+Math.sin(k)*(30+Math.floor(k/6)*80));e.hp=e.hpMax=10000;}
  for(let k=0;k<3;k++)R.corpses.push({x:1060+k*10,y:1024,until:8});
  for(let tick=0;tick<160;tick++){player.update(.05);for(let j=0;j<player.skills.length;j++)R.activate(j);R.tick(.05);R.updateEnemies(.05);R.updateBullets(.05);R.updateFields(.05);}
  for(const p of R.bullets)assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y),s.id+' projectile coordinates');
  for(const e of enemies){assert.ok(Number.isFinite(e.hp),s.id+' HP');assert.ok(Number.isFinite(e.x)&&Number.isFinite(e.y),s.id+' position');}
  if(!['shield','venom','curse'].includes(s.mode))assert.ok((R.damageBySkill[s.id]||0)>0,s.id+' must actually deal its own damage');
  if(s.mode==='shield')assert.ok(R.shieldHP>=0);
  if(s.mode==='venom')assert.ok(R.venomUntil>0);
  if(s.mode==='curse')assert.ok(enemies.some(e=>e.cursedUntil>0));
  assert.ok(R.fields.length<=100,s.id+' area budget');assert.ok(R.bullets.length<=350,s.id+' projectile budget');
  assert.ok(R.allies.filter(a=>!a.turret&&!a.decoy).length<=8,s.id+' summon cap');
 }
});
test('every talent prerequisite, minimum level and single capstone is enforced',()=>{for(const cls of Object.keys(C.trees)){reset(cls);const tree=C.trees[cls];player.level=4;R.talentPoints=8;assert.equal(R.buyTalent(tree[0],0),false);player.level=40;assert.equal(R.buyTalent(tree[0],1),false);for(let i=0;i<4;i++)assert.equal(R.buyTalent(tree[0],i),true);for(let i=0;i<3;i++)assert.equal(R.buyTalent(tree[1],i),true);assert.equal(R.buyTalent(tree[1],3),false);assert.equal(R.talentPoints,1);}});
test('multiple-level XP burst keeps all normal choices and awards talent points',()=>{reset();player.xp=800;run('checkLevelUp()');const gained=player.level-1;assert.equal(R.pendingLevels,gained);assert.equal(R.talentPoints,Math.floor(player.level/5));let choices=0;while(R.pendingLevels){const card=document.getElementById('levelup-cards').children[0];assert.ok(card);card.onclick();autoBind();choices++;if(choices>40)throw Error('reward loop');}assert.equal(choices,gained);assert.ok(['talents','playing'].includes(game.state));});
test('ten common ultimates require rank five and one passive then appear at the next level',()=>{for(const recipe of Object.values(C.recipes)){reset();player.gainWeapon(recipe.weapon);const w=R.state(recipe.weapon);w.level=4;player.passives[recipe.passive]=1;assert.equal(R.ultimateEligible(w.id),false);w.level=5;player.passives[recipe.passive]=0;assert.equal(R.ultimateEligible(w.id),false);player.passives[recipe.passive]=1;const choices=run('buildUpgradeOptions')();const ultimate=choices.find(o=>o.kind==='ultimate');assert.ok(ultimate);assert.equal(ultimate.id,w.id);assert.equal(run('applyUpgrade')(ultimate),true);assert.equal(w.evolved,true);assert.equal(R.ultimateEligible(w.id),false);assert.equal(run('applyUpgrade')(ultimate),false);assert.equal(Object.keys(player.weapons).length,1);}});
test('all class spells evolve with an associated talent and retain their slot',()=>{for(const [cls,tree] of Object.entries(C.trees))for(const d of Object.values(C.spells).filter(d=>d.group===cls)){reset(cls);player.skills=[];player.gainClassSkill(d.id);const w=R.state(d.id);w.level=5;assert.equal(R.ultimateEligible(d.id),false);const branch=tree.find(b=>b.skills.includes(d.id));R.talents.add(branch.nodes[0].id);assert.equal(R.ultimateEligible(d.id),true);const before=R.stats(w);const opt=run('buildUpgradeOptions()').find(o=>o.kind==='ultimate');assert.ok(opt);assert.equal(run('applyUpgrade')(opt),true);const after=R.stats(w);if(before.dmg>0)assert.ok(after.dmg>before.dmg);assert.ok(after.cd<before.cd);assert.equal(player.skills.length,1);run('renderSkillBar()');}});
test('knowledge records shown choices, acquisitions and unknowns without revealing all candidates',()=>{reset();const k=sandbox.SurvivorKnowledge;k.entries={};assert.equal(k.status('common_axes'),0);const opts=run('drawUpgradeCards')(new Element());for(const o of opts)assert.equal(k.status(o.id),1);const unshown=Object.keys(C.passives).find(id=>!opts.some(o=>o.id===id));assert.equal(k.status(unshown),0);run('applyUpgrade')(opts[0]);assert.equal(k.status(opts[0].id),2);k.mark(opts[0].id);assert.equal(k.status(opts[0].id),2);assert.equal(JSON.parse(storage.get('survivors_knowledge'))[opts[0].id],2);reset();assert.equal(k.status(opts[0].id),2);k.open();assert.equal(game.state,'knowledge');document.getElementById('ss-library-close').onclick();assert.equal(game.state,'playing');});
test('poison stacking refreshes one source, caps at three; bosses resist hard control',()=>{reset('necromancer');const e=enemy();const s=C.spells.necromancer_nova;for(let i=0;i<5;i++)R.dot(e,'poison','source'+i,10+i,3,{s,id:s.id});assert.equal(e.ssDots.length,3);const old=e.ssDots.find(d=>d.source==='source4');R.dot(e,'poison','source4',16,5,{s,id:s.id});assert.equal(e.ssDots.length,3);assert.equal(old.until,5);e.boss=true;R.control(e,'slow',2,.9);R.control(e,'freeze',1);R.control(e,'stun',1);assert.equal(e.ssSlow,.15);assert.ok(!e.ssStopUntil);e.boss=false;R.control(e,'freeze',1);const until=e.ssStopUntil;R.now=.5;R.control(e,'freeze',1);assert.equal(e.ssStopUntil,until);});
test('chest flow queues multiple pickups without losing upgrades',()=>{reset();R.pendingChests=2;R.processRewards();autoBind();assert.equal(R.pendingChests,0);assert.equal(game.state,'playing');});
test('secondary trail effects expire instead of recursively sustaining themselves',()=>{reset('barbarian');player.skills=[];player.gainClassSkill('barbarian_whirl');for(const n of C.trees.barbarian[1].nodes)R.talents.add(n.id);enemy();const w=R.state('barbarian_whirl'),s=R.stats(w);R.cast(w,s);for(let i=0;i<200;i++){R.now+=.05;R.updateFields(.05);}assert.equal(R.fields.length,0);});
test('all maps drawn safely even when loaded: regression for legacy w2s TDZ',()=>{reset();run("Sprites.maps=[{file:'test',suggested_world_size:[2048,2048]}];Sprites.mapImages.test={width:1254,height:1254};draw()");});
test('end condition requires the final boss rather than only the timer',()=>{reset();sandbox.SurvivorActs.index=4;sandbox.SurvivorActs.elapsed=179.99;game.time=899.99;run('updateProgress(.05)');assert.notEqual(game.state,'win');assert.equal(sandbox.SurvivorActs.phase,'boss');run('Run.bossKills.archdemon=true;updateProgress(.05)');assert.equal(game.state,'win');});
test('all 21 capstone identifiers have concrete effect handlers',()=>{const impl=fs.readFileSync(path.join(root,'js/survivors/runtime.js'),'utf8')+fs.readFileSync(path.join(root,'js/survivors/integration.js'),'utf8');for(const tree of Object.values(C.trees))for(const b of tree)assert.ok(impl.includes(b.nodes[3].mods.special),b.id);});
test('retry hides death, victory and reward panels before hero selection',()=>{
 reset();for(const id of ['kill-screen','win-screen','levelup-overlay','talents-overlay','evolution-overlay'])document.getElementById(id).classList.remove('hidden');
 run('showClassSelect()');assert.equal(game.state,'classes');
 for(const id of ['kill-screen','win-screen','levelup-overlay','talents-overlay','evolution-overlay','hud'])assert.ok(document.getElementById(id).classList.contains('hidden'),id);
 assert.ok(!document.getElementById('class-screen').classList.contains('hidden'));run('backToTitle()');assert.equal(game.state,'title');
});
test('level-up draws freely across eligible families, with cap-aware fallback',()=>{
 reset();const box=new Element();let sameFamily=false;for(let i=0;i<100;i++){const choices=run('drawUpgradeCards')(box);assert.equal(choices.length,3);assert.equal(new Set(choices.map(o=>o.id)).size,3);if(new Set(choices.map(o=>o.kind)).size<3)sameFamily=true;}assert.ok(sameFamily,'no forced family distribution');
 for(const d of Object.values(C.spells).filter(d=>d.group==='sorceress').slice(0,3)){player.gainClassSkill(d.id);R.state(d.id).level=5;}
 const choices=run('drawUpgradeCards')(box);assert.equal(choices.length,3);assert.ok(!choices.some(o=>o.kind==='class'));assert.equal(new Set(choices.map(o=>o.id)).size,3);
});
test('full spell and passive slots only offer owned upgrades',()=>{
 reset();for(const d of Object.values(C.spells).filter(d=>d.group==='sorceress'))player.gainClassSkill(d.id);
 for(const d of Object.values(C.spells).filter(d=>d.group==='common'))player.gainWeapon(d.id);
 for(const id of Object.keys(C.passives).slice(0,6))player.gainPassive(id);
 const owned=new Set([...player.skills.map(w=>w.id),...Object.keys(player.weapons),...Object.keys(player.passives)]);
 const choices=run('buildUpgradeOptions')();assert.ok(choices.length>0);assert.ok(choices.every(o=>owned.has(o.id)));
 assert.equal(Object.keys(player.passives).length,6);
 for(let i=0;i<50;i++)assert.ok(run('drawUpgradeCards')(new Element()).every(o=>owned.has(o.id)));
});
test('shop exits by Escape, E and button resume combat even with a stale menu state',()=>{
 for(const code of ['Escape','KeyE','button']){
  reset();game.prevState='title';run('Keys.right=true;openShop()');assert.equal(game.state,'shop');assert.equal(run('Keys.right'),false);
  assert.ok(!document.getElementById('shop-overlay').classList.contains('hidden'));run('Keys.up=true');
  if(code==='button')document.getElementById('shop-close').onclick();else for(const fn of events.get('keydown')||[])fn({code,target:{tagName:'DIV'},preventDefault(){}});
  assert.equal(game.state,'playing',code);assert.equal(run('Keys.up'),false);assert.ok(document.getElementById('shop-overlay').classList.contains('hidden'));
  const time=game.time;run('updateProgress(.1)');assert.ok(game.time>time);
 }
});
test('shop prices and per-run stock prevent repeated permanent stat purchases',()=>{
 reset();player.gold=10000;const item=run("SHOP_POOL.find(it=>it.id==='maxHP')"),base=player.hpMax;
 assert.equal(item.cost,520);assert.equal(item.limit,1);run('buyShopItem')(item);assert.equal(player.hpMax,base+20);const gold=player.gold;
 run('buyShopItem')(item);assert.equal(player.gold,gold);assert.equal(player.hpMax,base+20);
 run('Shopkeeper.appear()');run('buyShopItem')(item);assert.equal(player.gold,gold);
 reset();assert.deepEqual(Object.keys(player.shopPurchases),[]);player.gold=10000;run('buyShopItem')(item);assert.equal(player.shopPurchases.maxHP,1);
 const armor=run("SHOP_POOL.find(it=>it.id==='armorUp')");for(let n=0;n<3;n++)run('buyShopItem')(armor);assert.equal(player.passives.armor,2);assert.equal(player.shopPurchases.armorUp,2);
});
test('shop smoke: eight services apply effects, reject insufficient gold and reset stock',()=>{
 const items=run('SHOP_POOL');
 for(const item of items){reset();player.gold=item.cost-1;const gold=player.gold;run('buyShopItem')(item);assert.equal(player.gold,gold,item.id);assert.equal(player.shopPurchases[item.id],undefined,item.id);}
 reset();player.gold=10000;player.hp=1;player.gainWeapon('common_knives');
 const buy=id=>run('buyShopItem')(items.find(i=>i.id===id));
 buy('potionHP');assert.equal(player.hp,player.hpMax);
 let rerolls=game.rerollsLeft;buy('potionMP');assert.equal(game.rerollsLeft,rerolls+1);buy('reroll');assert.equal(game.rerollsLeft,rerolls+2);
 const weapon=player.weapons.common_knives;buy('weaponUp');assert.equal(weapon.level,2);buy('armorUp');assert.equal(player.passives.armor,1);
 const hp=player.hpMax;buy('maxHP');assert.equal(player.hpMax,hp+20);
 const essence=run('Meta.essence');buy('essenceDust');assert.equal(run('Meta.essence'),essence+1);buy('magnetNow');assert.equal(player.shopPurchases.magnetNow,1);
 reset();player.gold=10000;const gold=player.gold;buy('weaponUp');assert.equal(player.gold,gold);assert.equal(player.shopPurchases.weaponUp,undefined);
 player.gainWeapon('common_knives');player.weapons.common_knives.level=5;buy('weaponUp');assert.equal(player.gold,gold);
});
test('camera covers every map edge and also handles viewports bigger than a map',()=>{
 reset();run("Sprites.maps=[{file:'test',suggested_world_size:[2048,2048]}]");
 for(const [x,y] of [[24,24],[2024,24],[24,2024],[2024,2024]]){player.x=x;player.y=y;run('SurvivorIntegration.updateCamera()');const cam=run('CAM'),vw=run('VW'),vh=run('VH');assert.ok(cam.x-vw/(2*cam.zoom)>=-1e-6);assert.ok(cam.y-vh/(2*cam.zoom)>=-1e-6);assert.ok(cam.x+vw/(2*cam.zoom)<=2048+1e-6);assert.ok(cam.y+vh/(2*cam.zoom)<=2048+1e-6);}
 run('Sprites.maps[0].suggested_world_size=[320,240];SurvivorIntegration.updateCamera()');assert.ok(run('CAM.zoom')>1);run('Sprites.maps[0].suggested_world_size=[2048,2048]');
});
test('fast projectiles hit crossed targets, including point-blank enemies',()=>{
 reset();const e=enemy(1025,1024);e.hp=e.hpMax=1000;const s=R.stats(player.skills[0]);R.bullet(s,1024,1024,0,R.context(s),{speed:1000});R.updateBullets(.05);assert.ok(e.hp<1000);
});
test('melee combos switch target after a kill instead of wasting later strikes',()=>{
 reset('paladin');const targets=[enemy(1050,1024),enemy(1058,1024),enemy(1066,1024)];for(const e of targets)e.hp=1;
 const w=player.skills[0];R.cast(w,R.stats(w));for(let i=0;i<8;i++)R.tick(.05);assert.ok(targets.every(e=>e.dead));
});
test('heat snapshots each run, scales enemies and remains finite at large levels',()=>{
 const heat=sandbox.SurvivorHeat;for(const record of Object.values(sandbox.SurvivorActs.records))record.fill(0);heat.set(0);reset();const base=enemy();const hp=base.hpMax,dmg=base.dmg;
 heat.set(10);reset();const harder=enemy();assert.ok(harder.hpMax>hp);assert.ok(harder.dmg>dmg);heat.set(20);assert.equal(heat.active,10);
 for(const value of [0,10,1000,1e300]){heat.set(value);assert.ok(heat.selected<=30);for(const factor of Object.values(heat.factors(heat.selected)))assert.ok(Number.isFinite(factor)&&factor>=0);}
 heat.set(0);reset();assert.equal(enemy().hpMax,hp);
});
test('acts lock heat until completion and retry snapshots contracts and destination',()=>{
 const acts=sandbox.SurvivorActs,heat=sandbox.SurvivorHeat;acts.useClass('sorceress');acts.selected=2;acts.cleared[2]=-1;heat.set(30);reset();assert.equal(heat.active,0);
 acts.records.amazon[2]=-1;run("startRun('amazon')");assert.equal(game.time,360);assert.equal(run('currentActIndex()'),2);
 game.time=539.9;acts.elapsed=179.9;run('updateProgress(.2);Run.bossKills.summoner=true;updateProgress(.01)');assert.equal(game.state,'win');assert.equal(acts.cleared[2],0);
 document.getElementById('ss-hotter').onclick();assert.equal(game.state,'playing');assert.equal(player.classId,'amazon');assert.equal(player.level,1);assert.equal(game.time,360);assert.equal(heat.active,1);
 heat.ranks={xp:5,elite:5,speed:5};heat.refresh();run("startRun('amazon')");const before=player.xp;run("collectPickup({type:'big',gemValue:10})");assert.equal(player.xp-before,5);assert.equal(heat.factors().elite,.2);
 heat.ranks.xp=0;assert.equal(heat.factors().xp,.5);acts.selected=-1;heat.set(0);reset();
});
test('act records and heat unlocks belong exclusively to the selected class',()=>{
 const acts=sandbox.SurvivorActs,heat=sandbox.SurvivorHeat;acts.selected=0;acts.records.paladin.fill(-1);acts.records.sorceress.fill(-1);
 acts.useClass('paladin');heat.active=4;acts.complete(0);assert.equal(acts.cleared[0],4);assert.ok(acts.unlocked());
 acts.useClass('sorceress');assert.equal(acts.cleared[0],-1);assert.equal(acts.unlocked(),false);
 let stored;const originalSetItem=sandbox.localStorage.setItem;sandbox.localStorage.setItem=(key,value)=>{if(key==='survivors_contracts')stored=JSON.parse(value);};heat.save();assert.equal(stored.version,2);assert.equal(stored.byClass.paladin[0],4);assert.equal(stored.byClass.sorceress[0],-1);sandbox.localStorage.setItem=originalSetItem;
 acts.selected=-1;heat.set(0);reset();
});
test('attributes affect melee, ranged, attack cadence, crit damage and mana upgrades',()=>{
 reset('barbarian');const melee=R.stats(player.skills[0]);player.gainPassive('melee');assert.ok(R.stats(player.skills[0]).dmg>melee.dmg);
 player.gainWeapon('common_knives');const ranged=R.stats(R.state('common_knives'));player.gainPassive('ranged');assert.ok(R.stats(R.state('common_knives')).dmg>ranged.dmg);
 const cd=R.stats(player.skills[0]).cd;player.gainPassive('attackSpeed');assert.ok(R.stats(player.skills[0]).cd<cd);
 const mana=player.manaMax;player.gainPassive('mana');assert.equal(player.manaMax,mana+15);
 const e=enemy();e.hp=e.hpMax=1000;player.gainPassive('critDamage');const s={...R.stats(player.skills[0]),crit:1};R.damage(e,10,R.context(s));assert.ok(Math.abs((1000-e.hp)-10*s.critDamage)<1e-6);
 reset('barbarian');assert.equal(player.manaMax,mana);assert.equal(player.passives.attackSpeed,undefined);
});
test('mana starvation delays magic casts and regeneration resumes them',()=>{
 reset('sorceress');enemy();player.mana=0;R.tick(.1);assert.equal(R.bullets.filter(p=>!p.ctx.s.basic).length,0);player.update(5);assert.ok(player.mana>0);R.activate(0);R.tick(.1);assert.ok(R.bullets.length>0);assert.ok(player.mana>=0&&player.mana<player.manaMax);
});
test('armor reduces damage and class dodge prevents a hit',()=>{
 reset('paladin');const hp=player.hp;player.takeDamage(10);assert.ok(Math.abs(player.hp-(hp-10*.94))<1e-6);
 reset('assassin');run('var previousRandom=Math.random;Math.random=()=>0');const before=player.hp;player.takeDamage(100);assert.equal(player.hp,before);run('Math.random=previousRandom');
});
test('hero selection opens setup before starting; launch snapshots the selected hero and act',()=>{
 reset('paladin');const before=game.time;run('showClassSelect()');const cards=document.getElementById('class-cards').children;cards[1].onclick();
 assert.equal(game.state,'setup');assert.equal(sandbox.SurvivorActs.classId,'sorceress');assert.equal(player.classId,'paladin');assert.equal(game.time,before);
 assert.ok(document.getElementById('class-screen').classList.contains('hidden'));assert.ok(!document.getElementById('ss-run-setup').classList.contains('hidden'));
 document.getElementById('ss-act').value='1';document.getElementById('ss-act').onchange();document.getElementById('ss-launch').onclick();autoBind();
 assert.equal(game.state,'playing');assert.equal(player.classId,'sorceress');assert.equal(sandbox.SurvivorActs.active,1);assert.equal(game.time,180);assert.ok(document.getElementById('ss-run-setup').classList.contains('hidden'));
 run('SurvivorIntegration.showRunSetup("sorceress")');document.getElementById('ss-setup-back').onclick();assert.equal(game.state,'classes');assert.ok(document.getElementById('ss-run-setup').classList.contains('hidden'));sandbox.SurvivorActs.selected=-1;reset();
});
test('common weapons are all physical, mana-free and mechanically distinct',()=>{
 const weapons=Object.values(C.spells).filter(s=>s.group==='common');assert.equal(new Set(weapons.map(s=>s.weaponKind)).size,10);for(const s of weapons){assert.equal(s.element,'physical');assert.equal(s.mode,'weapon');assert.equal(sandbox.SurvivorStats.manaCost(s),0);}
 reset('sorceress');player.skills=[];player.gainWeapon('common_embers');player.mana=0;const e=enemy();R.tick(.1);assert.ok(R.bullets.some(p=>p.ctx.id==='common_embers'));assert.equal(player.mana,0);
});
test('a three-spell caster exhausts mana, keeps a basic attack, and benefits from mana investment',()=>{
 function simulate(rank){reset('sorceress');player.gainClassSkill('sorceress_orb');player.gainClassSkill('sorceress_chain');for(let i=0;i<rank;i++)player.gainPassive('mana');const e=enemy(1100,1024);e.hp=e.hpMax=1e7;
  let low=0;for(let i=0;i<1800;i++){player.update(.05);for(let j=0;j<player.skills.length;j++)R.activate(j);R.tick(.05);R.updateBullets(.05);R.updateFields(.05);if(player.mana<10)low++;assert.ok(player.mana>=0);}
  return {bySpell:{...R.casts},casts:Object.values(R.casts).reduce((n,c)=>n+c,0),waits:R.manaWaits,low,damage:e.hpMax-e.hp};}
 const base=simulate(0),invested=simulate(5);assert.ok(Object.values(base.bySpell).every(n=>n>0)&&Object.keys(base.bySpell).length===3,'all spells receive mana fairly');assert.ok(base.waits>0&&base.low>200,'mana must constrain sustained spell casting');assert.ok(base.damage>0,'free basic attack remains available');assert.ok(invested.casts>base.casts,'mana passive must allow more casts');console.log('MANA',JSON.stringify({base,invested}));
});
test('active spells wait for input, aim at supplied coordinates, pay mana and respect cooldown',()=>{
 reset('sorceress');const e=enemy();R.tick(.1);assert.equal(R.casts.sorceress_fireball,undefined);const before=player.mana;
 assert.equal(R.activate(0,{x:1024,y:800}),true);assert.ok(player.mana<before);const p=R.bullets.find(p=>p.ctx.id==='sorceress_fireball');assert.ok(Math.abs(p.angle+Math.PI/2)<.001);
 const mana=player.mana;assert.equal(R.activate(0),false);assert.equal(player.mana,mana);game.state='paused';assert.equal(R.activate(0),false);
});
test('passives are free and auras drain mana only while toggled on, then stop at exhaustion',()=>{
 reset('necromancer');const mana=player.mana;R.corpses.push({x:1030,y:1024,until:8});enemy();R.tick(.1);assert.equal(player.mana,mana);assert.equal(R.activate(0),false);assert.ok(R.allies.length>0);
 reset('paladin');player.gainClassSkill('paladin_holyfire');const w=player.skills[1];assert.equal(R.activate(1),true);const before=player.mana;R.tick(1);assert.ok(player.mana<before);assert.equal(w.enabled,true);
 assert.equal(R.activate(1),true);const off=player.mana;R.tick(1);assert.equal(player.mana,off);assert.equal(w.enabled,false);
 w.cd=0;player.mana=20;R.activate(1);player.mana=.01;R.tick(1);assert.equal(w.enabled,false);assert.ok(player.mana>=0);
});
test('receiving an active pauses rewards for a unique non-reserved shortcut',()=>{
 reset('sorceress');run("applyUpgrade({kind:'class',id:'sorceress_orb'})");R.processRewards();assert.equal(game.state,'binding');assert.equal(R.assignKey('KeyW'),false);assert.equal(game.state,'binding');assert.equal(R.assignKey('KeyF'),true);assert.equal(R.state('sorceress_orb').binding,'KeyF');
 run("applyUpgrade({kind:'class',id:'sorceress_chain'})");R.processRewards();assert.equal(R.assignKey('KeyF'),false);assert.equal(R.assignKey('Digit2'),true);assert.equal(game.state,'playing');
 run("applyUpgrade({kind:'class',id:'sorceress_orb'})");assert.equal(R.pendingBindings.length,0);
 reset('necromancer');assert.equal(R.pendingBindings.length,0);
});
test('automatic aim ignores cursor and can be toggled back to manual during play',()=>{
 reset('sorceress');const e=enemy(1150,1024);R.aimPoint={x:1024,y:800};R.autoAim=true;assert.equal(R.activate(0),true);const bullet=R.bullets.find(p=>p.ctx.id==='sorceress_fireball');assert.ok(Math.abs(bullet.angle)<.001);
 const checkbox=document.getElementById('ss-aim-hud');checkbox.checked=false;checkbox.onchange();assert.equal(R.autoAim,false);assert.equal(document.getElementById('ss-aim-setup').checked,false);
 player.skills[0].cd=0;R.bullets=[];assert.equal(R.activate(0),true);assert.ok(Math.abs(R.bullets[0].angle+Math.PI/2)<.001);
});
test('base HP is reduced by 40 percent for all heroes and hearts heal only ten percent',()=>{
 for(const cls of Object.keys(C.trees)){reset(cls);const multiplier=run(`CLASSES['${cls}'].hpMul`);assert.equal(player.baseHP,Math.round(60*multiplier));player.hp=1;run("collectPickup({type:'heart'})");assert.equal(player.hp,1+Math.max(4,Math.round(player.hpMax*.1)));}
});
test('weapon recipes use meaningful stat partners and class synergies grant actual damage',()=>{
 assert.equal(C.recipes.common_comets.passive,'area');assert.equal(C.recipes.common_storm.passive,'area');assert.equal(C.recipes.common_embers.passive,'amount');
 reset('sorceress');const w=player.skills[0],before=R.stats(w).dmg;player.gainClassSkill('sorceress_hydra');assert.ok(R.stats(w).dmg>before);
});
test('bosses have distinct telegraphed cycles, bounded summons and phase-two cadence',()=>{
 const defs=run('BOSSES'),results=[];
 for(const def of defs){reset();player.invuln=1e9;const boss=run('spawnBoss')(def);boss.hp=boss.hpMax;const seen=new Set();
  for(let i=0;i<300;i++){R.tick(.1);R.updateEnemies(.1);R.updateBullets(.1);seen.add(boss.lastMechanic);}
  seen.delete(undefined);assert.ok(seen.size>=2,def.id);results.push([...seen].sort().join(','));assert.ok(R.hazards.every(z=>z.start<z.end));assert.ok(enemies.filter(e=>e.broodOwner===boss&&!e.dead).length<=6);
  boss.hp=boss.hpMax*.4;boss.nextBossAction=0;sandbox.SurvivorBosses.tick(boss,.1,R);assert.equal(boss.phase,2);assert.ok(boss.nextBossAction-R.now<=3.31);
  boss.dead=true;R.tick(.1);assert.ok(!R.hazards.some(z=>z.owner===boss));
 }
 assert.equal(new Set(results).size,5);
});
test('spell sheets exist for all 35 class skills and their declared aura modes',()=>{
 for(const spell of Object.values(C.spells).filter(s=>s.group!=='common')){assert.ok(fs.existsSync(path.join(root,'assets/survivors/spells',spell.id+'.png')));if(['aura','hurricane','whirl','shield','nova','curse','fissure','blizzard','corpse','cry','plague'].includes(spell.mode))assert.ok(fs.existsSync(path.join(root,'assets/survivors/spells',spell.id+'-ground.png')));}
});
test('amplify damage affects physical attacks, not fireballs; skeletons require corpses',()=>{
 reset('necromancer');R.tick(.1);assert.equal(R.allies.length,0);R.corpses.push({x:1030,y:1024,until:8});R.tick(.1);assert.equal(R.allies.length,1);
 const e=enemy();e.hp=e.hpMax=1000;e.cursedUntil=10;e.curseBonus=.25;const oldRandom=run('Math.random');sandbox.restoreRandom=oldRandom;run('Math.random=()=>.99');R.damage(e,10,{id:'test',s:{element:'fire',mode:'fireball',crit:0}});assert.equal(e.hp,990);R.damage(e,10,{id:'test',s:{element:'physical',crit:0}});assert.equal(e.hp,977.5);run('Math.random=restoreRandom');
});
test('healing drops are rare across a deterministic five-thousand-monster sample',()=>{
 reset();const ps=run('pickups');ps.length=0;run('var healRandomBackup=Math.random;var healSeed=731;Math.random=()=>{healSeed=(healSeed*1664525+1013904223)>>>0;return healSeed/4294967296;}');
 for(let i=0;i<5000;i++)run('dropLoot({x:1024,y:1024,boss:false,elite:false,xp:1})');run('Math.random=healRandomBackup');const heals=ps.filter(p=>p.type==='heart'||p.type==='flaskHP').length;assert.ok(heals>0&&heals<65);console.log('HEALING',heals,'healing drops / 5000 monsters');
});
test('attack speed accelerates weapons rather than caster spells',()=>{
 reset('sorceress');const fireCD=R.stats(player.skills[0]).cd;player.gainPassive('attackSpeed');assert.equal(R.stats(player.skills[0]).cd,fireCD);player.gainWeapon('common_embers');const bowCD=R.stats(R.state('common_embers')).cd;player.gainPassive('attackSpeed');assert.ok(R.stats(R.state('common_embers')).cd<bowCD);
});

const E=sandbox.SurvivorEquipment;
function cleanEquipment(){storage.delete(E.KEY);E.load();}
function gear(baseId,rarity=2,level=1){return E.generate({baseId,rarity,level,rng:()=>.25});}
function store(it){const result=E.insert(it);assert.ok(result,E.error);return result.pos;}
test('inventory drag handlers equip, unequip into exact cells and swap stash items',()=>{
 cleanEquipment();reset('paladin');const sword=gear('sword'),helm=gear('helm');store(sword);store(helm);E.open();
 const event={preventDefault(){},dataTransfer:{setData(){}}};
 document.getElementById('eq-grid').children[0].ondragstart(event);
 const slots=document.getElementById('eq-slots').children;slots.find(el=>el.dataset.slot==='mainhand').ondrop(event);
 assert.equal(E.state.heroes.paladin.mainhand.id,sword.id);assert.equal(E.state.stash[0],null);
 document.getElementById('eq-slots').children.find(el=>el.dataset.slot==='mainhand').ondragstart(event);document.getElementById('eq-grid').children[5].ondrop(event);
 assert.equal(E.state.heroes.paladin.mainhand,null);assert.equal(E.state.stash[5].id,sword.id);
 document.getElementById('eq-grid').children[5].ondragstart(event);document.getElementById('eq-grid').children[1].ondrop(event);
 assert.equal(E.state.stash[1].id,sword.id);assert.equal(E.state.stash[5].id,helm.id);
 document.getElementById('eq-grid').children[1].ondragstart(event);document.getElementById('eq-slots').children.find(el=>el.dataset.slot==='head').ondrop(event);
 assert.equal(E.state.heroes.paladin.head,null);assert.equal(E.state.stash[1].id,sword.id);
 E.close();E.load();assert.equal(E.state.stash[5].id,helm.id);cleanEquipment();reset();
});
test('equipment: seven empty heroes, twelve slots, six rarities and real sprite files',()=>{
 cleanEquipment();assert.equal(E.state.tabs,2);assert.equal(E.state.stash.length,60);assert.equal(Object.keys(E.slots).length,12);
 for(const cls of E.classes)assert.ok(Object.values(E.state.heroes[cls]).every(it=>it===null));
 for(const b of E.bases){assert.ok(fs.existsSync(path.join(root,'assets/survivors/equipment',b.sprite+'.png')));for(let rarity=0;rarity<6;rarity++){const it=gear(b.id,rarity,40);assert.equal(it.rarity,rarity);assert.equal(it.affixes.length,E.rarities[rarity].affixes);assert.equal(new Set(it.affixes.map(a=>a.id)).size,it.affixes.length);assert.ok(Object.values(it.stats).every(v=>Number.isFinite(v)&&v>=0));assert.ok(E.value(it)>0);}}
});
test('equipment: two rings and two one-handed weapons belong to one hero and persist across runs',()=>{
 cleanEquipment();const sword=gear('sword'),dagger=gear('dagger'),ring=gear('ring'),signet=gear('signet');
 for(const [it,slot]of [[sword,'mainhand'],[dagger,'offhand'],[ring,'ring1'],[signet,'ring2']])assert.ok(E.equip('sorceress',store(it),slot));
 assert.equal(E.state.heroes.sorceress.offhand.id,dagger.id);assert.equal(E.state.heroes.paladin.mainhand,null);
 assert.ok(E.totals('sorceress').power>sword.stats.power);reset();const bonus=sandbox.SurvivorStats.get().power;reset();assert.equal(sandbox.SurvivorStats.get().power,bonus);
 E.save();E.load();assert.equal(E.state.heroes.sorceress.mainhand.id,sword.id);assert.equal(E.state.heroes.sorceress.ring2.id,signet.id);
 cleanEquipment();
});
test('equipment: two-handed swaps are atomic at full capacity and offhand clears a two-hander',()=>{
 cleanEquipment();const sword=gear('sword'),dagger=gear('dagger'),two=gear('greatsword');E.equip('paladin',store(sword),'mainhand');E.equip('paladin',store(dagger),'offhand');const index=store(two);
 while(E.state.stash.includes(null))store(gear('cap',0));const before=JSON.stringify(E.state);assert.equal(E.equip('paladin',index,'mainhand'),false);assert.equal(JSON.stringify(E.state),before);
 E.sell(1);assert.ok(E.equip('paladin',index,'mainhand'));assert.equal(E.state.heroes.paladin.offhand,null);assert.ok(E.state.stash.some(it=>it?.id===sword.id)&&E.state.stash.some(it=>it?.id===dagger.id));
 const di=E.state.stash.findIndex(it=>it?.id===dagger.id);assert.ok(E.equip('paladin',di,'offhand'));assert.equal(E.state.heroes.paladin.mainhand,null);assert.ok(E.state.stash.some(it=>it?.id===two.id));
 assert.equal(E.equip('paladin',E.state.stash.findIndex(it=>it?.id===two.id),'head'),false);cleanEquipment();
});
test('equipment: tab moves, unlock achievements and duplicates cannot lose or clone items',()=>{
 cleanEquipment();const it=gear('helm'),pos=store(it);assert.ok(E.move(pos,1));assert.equal(E.state.stash[pos],null);assert.equal(E.state.stash[30].id,it.id);assert.equal(E.insert(it),false);assert.equal(E.move(30,6),false);
 E.state.counts.found=24;const result=E.insert(gear('ring',5),{found:true});assert.equal(result.unlocked.length,3);assert.equal(E.state.tabs,5);for(let i=0;i<10;i++)E.bossKill();assert.equal(E.state.tabs,6);assert.equal(E.state.stash.length,180);E.bossKill();assert.equal(E.state.tabs,6);
 E.load();assert.equal(E.state.tabs,6);assert.equal(E.state.stash[30].id,it.id);cleanEquipment();
});
test('equipment: damage, HP, mana, armor, speed and cooldown affect actual combat and never heal by swapping',()=>{
 cleanEquipment();reset();const initial=sandbox.SurvivorStats.get(),hp=player.hpMax,mana=player.manaMax,speed=player.speed,dmg=R.stats(player.skills[0]).dmg;
 const it=gear('robe');it.stats={hp:15,manaMax:20,manaRegen:1,armor:2,power:.1,crit:.05,critDamage:.1,attackSpeed:.1,cdr:.1,moveSpeed:.05,dodge:.03};const pos=store(it);E.equip('sorceress',pos,'torso');E.recalc();assert.equal(player.hpMax,hp+15);assert.equal(player.hp,hp);assert.equal(player.manaMax,mana+20);assert.equal(player.mana,mana);assert.ok(player.speed>speed);assert.ok(R.stats(player.skills[0]).dmg>dmg);assert.ok(R.stats(player.skills[0]).cd<player.skills[0].def.cd);assert.equal(sandbox.SurvivorStats.get().armor,initial.armor+2);
 player.hp=10;player.mana=5;E.unequip('sorceress','torso');E.recalc();E.equip('sorceress',pos,'torso');E.recalc();assert.equal(player.hp,10);assert.equal(player.mana,5);const beforeVital=player.hpMax;player.gainPassive('vitality');assert.equal(player.hpMax,Math.round(player.baseHP*1.1+15));assert.equal(player.hp,10+player.hpMax-beforeVital);reset();assert.equal(player.hp,player.hpMax);assert.equal(player.mana,player.manaMax);cleanEquipment();reset();
});
test('equipment: full stash keeps ground drops, and victory collects gear before stopping the run',()=>{
 cleanEquipment();reset();while(E.state.stash.includes(null))store(gear('cap',0));const it=gear('sword'),p=run("mkPickup(Player.x,Player.y,'equipment')");p.item=it;p.r=8;run('pickups').push(p);run('updatePickups(.1)');assert.ok(run('pickups').some(p=>p.item?.id===it.id));assert.equal(E.state.counts.found,0);
 E.sell(0);run('updatePickups(.1)');assert.ok(!run('pickups').some(p=>p.item?.id===it.id));assert.equal(E.state.counts.found,1);E.sell(1);
 const final=gear('helm'),loot=run("mkPickup(Player.x+500,Player.y,'equipment')");loot.item=final;run('pickups').push(loot);run('winSequence()');assert.ok(E.state.stash.some(it=>it?.id===final.id));assert.equal(game.state,'win');cleanEquipment();reset();
});
test('equipment: merchant stock purchases once, checks gold/capacity, then allows sale',()=>{
 cleanEquipment();reset();game.state='shop';player.gold=10000;run('renderShop()');const rows=document.getElementById('shop-items').children.slice(-6);const buy=rows[0].children[0],gold=player.gold;buy.onclick();assert.ok(player.gold<gold);assert.equal(E.state.stash.filter(Boolean).length,1);const after=player.gold;buy.onclick();assert.equal(player.gold,after);
 E.open();assert.equal(game.state,'equipment');assert.ok(document.getElementById('eq-hero').disabled);document.getElementById('eq-grid').children[0].onclick();const detail=document.getElementById('eq-detail'),sell=detail.children.find(el=>el.textContent?.startsWith('Vendre'));assert.ok(sell);sell.onclick();assert.ok(player.gold>after);assert.equal(E.state.stash.filter(Boolean).length,0);E.close();assert.equal(game.state,'shop');cleanEquipment();reset();
});
test('merchant rejects gear without gold or space and preserves stock across reopenings',()=>{
 cleanEquipment();reset();game.state='shop';player.gold=0;run('renderShop()');let row=document.getElementById('shop-items').children.slice(-6)[0],buy=row.children[0];assert.equal(buy.disabled,true);buy.onclick();assert.equal(player.gold,0);assert.equal(E.state.stash.filter(Boolean).length,0);
 player.gold=10000;while(E.state.stash.includes(null))store(gear('cap',0));run('renderShop()');row=document.getElementById('shop-items').children.slice(-6)[0];buy=row.children[0];assert.equal(buy.disabled,true);const before=JSON.stringify(E.state),gold=player.gold;buy.onclick();assert.equal(player.gold,gold);assert.equal(JSON.stringify(E.state),before);
 E.sell(0);run('renderShop()');row=document.getElementById('shop-items').children.slice(-6)[0];row.children[0].onclick();assert.ok(player.gold<gold);const after=player.gold;run('closeShop();openShop()');row=document.getElementById('shop-items').children.slice(-6)[0];assert.equal(row.children[0].disabled,true);row.children[0].onclick();assert.equal(player.gold,after);cleanEquipment();reset();
});
test('equipment: menu pauses and restores preparation and play; I is reserved from spell bindings',()=>{
 cleanEquipment();game.state='setup';sandbox.SurvivorActs.useClass('amazon');E.open();assert.equal(game.state,'equipment');assert.equal(document.getElementById('eq-hero').value,'amazon');E.close();assert.equal(game.state,'setup');reset();E.open();E.close();assert.equal(game.state,'playing');
 player.skills=[];player.gainClassSkill('sorceress_fireball');R.pendingBindings=['sorceress_fireball'];game.state='binding';assert.equal(R.assignKey('KeyI'),false);assert.ok(R.assignKey('Digit1'));cleanEquipment();reset();
});
test('equipment: stronger rarity factors migrate saved rolls once without scaling relic properties',()=>{
 cleanEquipment();const old=[1,1.12,1.28,1.45,1.65,2];
 const ids=[];for(let rarity=0;rarity<6;rarity++){const item=gear('helm',rarity);const ratio=old[rarity]/E.rarities[rarity].mul;for(const [k,v]of Object.entries(item.stats)){const fixed=item.special?.[k]||0;item.stats[k]=(v-fixed)*ratio+fixed;}for(const a of item.affixes)for(const k of Object.keys(a.stats))a.stats[k]*=ratio;delete item.qualityVersion;store(item);ids.push(item.id);}
 const before=JSON.parse(storage.get(E.KEY));E.load();for(let rarity=0;rarity<6;rarity++){const previous=before.stash[rarity],item=E.state.stash[rarity];assert.equal(item.id,ids[rarity]);assert.equal(item.qualityVersion,2);for(const [k,v]of Object.entries(previous.stats)){const fixed=previous.special?.[k]||0;assert.ok(Math.abs(item.stats[k]-((v-fixed)*E.rarities[rarity].mul/old[rarity]+fixed))<.0001);}assert.equal(JSON.stringify(item.special),JSON.stringify(previous.special));}
 const migrated=JSON.stringify(E.state);E.load();assert.equal(JSON.stringify(E.state),migrated);cleanEquipment();reset();
});
test('equipment: malformed saves and invalid or duplicate item payloads recover safely',()=>{
 cleanEquipment();const it=gear('cap'),pos=store(it);const raw=JSON.parse(storage.get(E.KEY));raw.stash[1]=raw.stash[0];raw.stash[2]={...it,id:'malformed',affixes:[{id:'owl',stats:{invalid:5}}]};storage.set(E.KEY,JSON.stringify(raw));E.load();assert.ok(E.state.stash[pos]);assert.equal(E.state.stash[1],null);assert.equal(E.state.stash[2],null);assert.equal(E.insert({...it,id:'bad',stats:{hp:NaN}}),false);
 storage.set(E.KEY,'{broken');E.load();assert.equal(E.state.stash.filter(Boolean).length,0);assert.equal(E.state.tabs,2);cleanEquipment();reset();
});
test('boss hooks pull on a successful hit and poison persists briefly after leaving its pool',()=>{
 reset('sorceress');const owner={dead:false,x:950,y:1024};R.now=1;R.hazards.push({owner,shape:'line',x:950,y:1024,angle:0,length:300,width:20,start:0,end:4,next:0,dmg:5,hook:true});const x=player.x;sandbox.SurvivorBosses.updateHazards(.1,R);assert.ok(player.x<x);
 reset('sorceress');R.now=1;R.hazards.push({owner,shape:'circle',x:1024,y:1024,angle:0,r:50,start:0,end:4,next:0,dmg:2,poison:true});sandbox.SurvivorBosses.updateHazards(.1,R);assert.ok(R.playerPoisonUntil>R.now);const hp=player.hp;player.x=1500;player.update(1.2);R.now=2.2;sandbox.SurvivorBosses.updateHazards(.1,R);assert.ok(player.hp<hp);
});
test('hydra heads fire individual bolts rather than target-range-sized explosions',()=>{
 reset('sorceress');player.gainClassSkill('sorceress_hydra');const e=enemy(1120,1024);e.hp=e.hpMax=1000;const w=R.state('sorceress_hydra');R.cast(w,R.stats(w));R.updateAllies(.3);const heads=R.bullets.filter(p=>p.ctx.id==='sorceress_hydra');assert.equal(heads.length,3);assert.ok(heads.every(p=>p.mode==='projectile'));
});
test('quiver bonuses benefit bows and crossbows, not flails or caster fireballs',()=>{
 reset('sorceress');player.gainWeapon('common_embers');player.gainWeapon('common_comets');const fire=R.stats(player.skills[0]),bow=R.stats(R.state('common_embers')),flail=R.stats(R.state('common_comets'));player.gainPassive('amount');player.gainPassive('amount');assert.equal(R.stats(R.state('common_embers')).count,bow.count+1);assert.ok(R.stats(R.state('common_embers')).speed>bow.speed);assert.equal(R.stats(R.state('common_comets')).count,flail.count);assert.equal(R.stats(player.skills[0]).count,fire.count);assert.equal(R.stats(player.skills[0]).speed,fire.speed);
});
test('act boss appears at exactly three minutes and locks map, wave tier and future bosses',()=>{
 const acts=sandbox.SurvivorActs;acts.selected=-1;reset();run('updateProgress(179.9)');assert.equal(acts.phase,'waves');assert.equal(enemies.filter(e=>e.boss).length,0);run('updateProgress(.1)');assert.equal(acts.phase,'boss');assert.equal(acts.boss.id,'butcher');assert.equal(acts.remaining(),120);assert.equal(run('currentActIndex()'),0);
 const timer=run('Wave.timer');run('Wave.update(60);updateProgress(60)');assert.equal(run('Wave.timer'),timer);assert.equal(acts.index,0);assert.equal(run('Game.minute'),2);assert.equal(enemies.filter(e=>e.boss).length,1);assert.equal(run('Wave.bossSpawned.insectQueen'),undefined);assert.equal(acts.remaining(),60);
 run('updateHUD()');assert.ok(document.getElementById('ss-boss-timer').textContent.includes('1:00'));assert.ok(!document.getElementById('ss-boss-timer').classList.contains('hidden'));reset();
});
test('boss death starts the next full act only then, and keeps the previous record',()=>{
 const acts=sandbox.SurvivorActs;acts.selected=-1;reset();acts.cleared[0]=-1;run('updateProgress(180)');const boss=acts.boss;run('updateProgress(45)');R.damage(boss,1e9);assert.ok(boss.dead);run('updateProgress(.01)');assert.equal(acts.index,1);assert.equal(acts.phase,'waves');assert.equal(acts.elapsed,0);assert.equal(acts.cleared[0],sandbox.SurvivorHeat.active);assert.equal(run('currentActIndex()'),1);assert.equal(acts.deadline,null);
 run('updateProgress(179.99)');assert.equal(acts.phase,'waves');run('updateProgress(.01)');assert.equal(acts.boss.id,'insectQueen');assert.equal(acts.remaining(),120);assert.ok(game.time>405);reset();
});
test('two-minute timeout defeats even an invulnerable hero and explains the failed act',()=>{
 const acts=sandbox.SurvivorActs;acts.selected=-1;reset();acts.cleared[0]=-1;player.invuln=1e9;run('updateProgress(180);updateProgress(119.99)');assert.equal(game.state,'playing');assert.equal(run('currentActIndex()'),0);run('updateProgress(.01)');assert.equal(game.state,'dead');assert.equal(player.hp,0);assert.equal(acts.phase,'failed');assert.equal(acts.cleared[0],-1);assert.ok(game.defeatReason.includes('2 minutes'));assert.ok(document.getElementById('kill-screen').querySelector('p').textContent.includes('Le Boucher'));reset();assert.equal(game.defeatReason,'');assert.equal(acts.phase,'waves');
});
test('menus freeze the boss deadline, and a kill before expiry beats the timeout',()=>{
 const acts=sandbox.SurvivorActs;acts.selected=-1;reset();run('updateProgress(180)');const left=acts.remaining();for(const state of ['paused','equipment','stats','talents','levelup','shop','settings']){game.state=state;run('updateProgress(200)');assert.equal(acts.remaining(),left);}game.state='playing';run('updateProgress(119.99)');R.damage(acts.boss,1e9);run('updateProgress(.01)');assert.equal(game.state,'playing');assert.equal(acts.index,1);assert.equal(acts.phase,'waves');reset();
});
test('single-act mode spawns only its own boss at the end and wins without advancing',()=>{
 const acts=sandbox.SurvivorActs;acts.selected=3;reset('amazon');run('updateProgress(180)');assert.equal(acts.boss.id,'spiderDemon');assert.equal(run('currentActIndex()'),3);assert.equal(enemies.filter(e=>e.boss).length,1);R.damage(acts.boss,1e9);run('updateProgress(.01)');assert.equal(game.state,'win');assert.equal(acts.index,3);assert.equal(acts.phase,'finished');acts.selected=-1;reset();
});
test('five act clocks and five boss victories are required to complete the campaign',()=>{
 const acts=sandbox.SurvivorActs;acts.selected=-1;reset();const defs=run('BOSSES');for(let i=0;i<5;i++){run('updateProgress(180)');assert.equal(acts.index,i);assert.equal(acts.boss.id,defs[i].id);R.damage(acts.boss,1e9);run('updateProgress(.01)');assert.equal(game.state,i===4?'win':'playing');}assert.equal(acts.phase,'finished');assert.ok(defs.every(d=>run('Run.bossKills')[d.id]));reset();
});
test('boss acceleration keeps charge, tell and impact times consistent and pools full-length',()=>{
 const B=sandbox.SurvivorBosses;reset();const boss=run('spawnBoss(BOSSES[0])');B.tick(boss,.1,R);assert.ok(Math.abs(boss.nextBossAction-3.75)<1e-8);assert.ok(Math.abs(R.hazards[0].start-.8/1.2)<1e-8);assert.ok(Math.abs((R.hazards[0].end-R.hazards[0].start)-.25)<1e-8);
 boss.attackIndex=1;boss.nextBossAction=0;R.hazards=[];R.jobs=[];B.tick(boss,.1,R);assert.ok(Math.abs(R.jobs[0].at-R.hazards[0].start)<1e-8);R.now=R.jobs[0].at;R.jobs[0].fn();assert.ok(Math.abs((boss.bossChargeUntil-R.now)-.75)<1e-8);
 reset();const queen=run('spawnBoss(BOSSES[1])');B.tick(queen,.1,R);assert.ok(Math.abs(R.hazards[0].start-1/1.2)<1e-8);assert.ok(Math.abs((R.hazards[0].end-R.hazards[0].start)-4.5)<1e-8);reset();
});
console.log(`\n${passed} suites passed. All 45 abilities and 84 talent definitions exercised.`);
if(process.env.SURVIVORS_STRESS==='1') {
 for(const cls of Object.keys(C.trees)) {
  reset(cls);player.level=40;player.invuln=1e9;
  for(const s of Object.values(C.spells).filter(s=>s.group===cls).slice(1,3))player.gainClassSkill(s.id);
  for(const id of ['common_knives','common_axes','common_embers']){player.gainWeapon(id);R.state(id).level=8;R.state(id).evolved=true;}
  for(const w of player.skills)w.level=5;
  for(const id of ['crit','area','power','armor','duration','cooldown'])for(let j=0;j<5;j++)player.gainPassive(id);
  for(const node of C.trees[cls][0].nodes)R.talents.add(node.id);
  for(let tick=0;tick<16000;tick++) {
   run('updateProgress(.1)');if(['win','dead'].includes(game.state))break;
   player.update(.1);for(let j=0;j<player.skills.length;j++)if(!player.skills[j].enabled)R.activate(j);R.tick(.1);R.updateEnemies(.1);R.updateBullets(.1);R.updateFields(.1);run('updateParticles(.1)');
   if(tick%10===0){run('magnetAllGems()');run('updatePickups(.1)');}
   const ls=run('lightning');for(const l of ls)l.life-=.1;for(let k=ls.length-1;k>=0;k--)if(ls[k].life<=0)ls.splice(k,1);
   run('Wave.update(.1)');
   assert.ok(R.bullets.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)),cls+' finite bullets');
   assert.ok(R.fields.length<=100&&R.bullets.length<=350,cls+' budgets');
  }
  console.log('STRESS',cls,JSON.stringify({time:Math.round(game.time),kills:player.kills,state:game.state,bosses:run('Object.keys(Run.bossKills)'),areas:R.fields.length,bullets:R.bullets.length}));
 }
}

if(process.env.SURVIVORS_BALANCE==='1'){
for(const rank of [1,3,5])for(const scenario of ['boss','crowd']){
 const row={rank,scenario};
 for(const cls of Object.keys(C.trees)){
 reset(cls);player.invuln=1e9;player.skills[0].level=rank;if(cls==='necromancer')for(let i=0;i<3;i++)R.corpses.push({x:1024+i*10,y:1024,until:8});
 if(rank>1){player.gainWeapon('common_knives');R.state('common_knives').level=rank;player.passives.power=2;player.passives.cooldown=2;}
 const targets=[];for(let k=0;k<(scenario==='boss'?1:12);k++){const e=enemy(1024+Math.cos(k*6.28/12)*180,1024+Math.sin(k*6.28/12)*180);e.hp=e.hpMax=1e7;e.dmg=0;if(scenario==='boss')e.boss=true;targets.push(e);}
 for(let t=0;t<1200;t++){player.update(.05);for(let j=0;j<player.skills.length;j++)R.activate(j);R.tick(.05);R.updateEnemies(.05);R.updateBullets(.05);R.updateFields(.05);}
 row[cls]=Math.round(targets.reduce((v,e)=>v+e.hpMax-e.hp,0)/60);
 }
 console.log('BALANCE',JSON.stringify(row));
}

}
