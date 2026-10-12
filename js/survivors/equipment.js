/* Persistent equipment and shared stash. No DOM or combat dependencies. */
'use strict';
window.SurvivorEquipment=(()=>{
 const KEY='survivors_equipment_v1',PAGE_SIZE=30,CLASSES=['paladin','sorceress','amazon','necromancer','druid','barbarian','assassin'];
 const slots={head:'Tête',neck:'Cou',shoulder:'Épaules',torso:'Torse',wrist:'Poignets',hands:'Gants',ring1:'Anneau gauche',ring2:'Anneau droit',legs:'Jambières',feet:'Bottes',mainhand:'Main principale',offhand:'Seconde main'};
 const rarities=[
  {name:'Commun',color:'#a4a4a4',affixes:0,mul:1}, {name:'Peu commun',color:'#68bf73',affixes:1,mul:1.25},
  {name:'Rare',color:'#6ea9ff',affixes:2,mul:1.55}, {name:'Très rare',color:'#edce63',affixes:3,mul:1.9},
  {name:'Légendaire',color:'#f29946',affixes:4,mul:2.35}, {name:'Ancien',color:'#ed6262',affixes:4,mul:3}
 ];
 const stats={hp:{name:'Vie',percent:false},manaMax:{name:'Mana',percent:false},manaRegen:{name:'Régénération mana /s',percent:false},armor:{name:'Armure',percent:false},power:{name:'Dégâts généraux',percent:true},melee:{name:'Dégâts de mêlée',percent:true},ranged:{name:'Dégâts à distance',percent:true},crit:{name:'Chance de critique',percent:true},critDamage:{name:'Dégâts critiques',percent:true},attackSpeed:{name:'Vitesse d’attaque',percent:true},cdr:{name:'Réduction de recharge',percent:true},dodge:{name:'Esquive',percent:true},moveSpeed:{name:'Vitesse de déplacement',percent:true}};
 const affixes=[
  {id:'owl',name:'du hibou',stats:{manaMax:[4,9],manaRegen:[.1,.25]}},
  {id:'wolf',name:'du loup',stats:{melee:[.015,.035],attackSpeed:[.005,.015]}},
  {id:'bear',name:'de l’ours',stats:{hp:[3,7],armor:[.1,.25]}},
  {id:'falcon',name:'du faucon',stats:{ranged:[.015,.035],crit:[.003,.008]}},
  {id:'fox',name:'du renard',stats:{dodge:[.005,.012],moveSpeed:[.005,.015]}},
  {id:'tiger',name:'du tigre',stats:{crit:[.004,.009],critDamage:[.025,.06]}},
  {id:'turtle',name:'de la tortue',stats:{armor:[.3,.6],hp:[2,4]}},
  {id:'eagle',name:'de l’aigle',stats:{attackSpeed:[.01,.025],ranged:[.01,.02]}},
  {id:'serpent',name:'du serpent',stats:{cdr:[.008,.02],manaRegen:[.1,.2]}},
  {id:'stag',name:'du cerf',stats:{moveSpeed:[.01,.025],hp:[2,5]}},
  {id:'dragon',name:'du dragon',stats:{power:[.012,.03],manaMax:[3,6]}},
  {id:'phoenix',name:'du phénix',stats:{hp:[3,6],manaRegen:[.15,.3]}}
 ];
 const bases=[
  ['cap','Calotte de cuir','head','cap',{armor:.3}],['helm','Heaume de fer','head','helm',{armor:.5}],['crown','Diadème runique','head','crown',{manaMax:5}],
  ['amulet','Amulette d’ambre','neck','amulet',{manaRegen:.15}],['talisman','Talisman d’os','neck','talisman',{manaMax:4}],
  ['pauldrons','Épaulières de fer','shoulder','pauldrons',{armor:.4}],['mantle','Mantelet de cuir','shoulder','mantle',{dodge:.004}],
  ['robe','Robe tissée','torso','robe',{manaMax:6}],['mail','Cotte de mailles','torso','mail',{armor:.6}],['plate','Cuirasse de fer','torso','plate',{armor:.8}],
  ['bracers','Brassards rivetés','wrist','bracers',{armor:.3}],['wraps','Bandelettes runiques','wrist','wraps',{manaRegen:.1}],
  ['gloves','Gants de cuir','hands','gloves',{attackSpeed:.008}],['gauntlets','Gantelets d’acier','hands','gauntlets',{armor:.3}],
  ['ring','Anneau d’argent','ring','ring',{crit:.003}],['signet','Sceau de cuivre','ring','signet',{hp:3}],
  ['greaves','Grèves de fer','legs','greaves',{armor:.5}],['leggings','Jambières de cuir','legs','leggings',{hp:4}],
  ['boots','Bottes de voyage','feet','boots',{moveSpeed:.01}],['sabatons','Solerets de fer','feet','sabatons',{armor:.4}],
  ['sword','Épée courte','weapon','sword',{power:.025},1],['dagger','Dague courbe','weapon','dagger',{power:.015,attackSpeed:.012},1],
  ['axe','Hache de guerre','weapon','axe',{power:.03},1],['mace','Masse de fer','weapon','mace',{power:.025,armor:.2},1],
  ['wand','Baguette d’if','weapon','wand',{power:.02,manaRegen:.15},1],['claw','Griffe d’acier','weapon','claw',{power:.02,crit:.003},1],
  ['greatsword','Espadon','weapon','greatsword',{power:.06},2],['greataxe','Hache d’exécution','weapon','greataxe',{power:.07},2],
  ['staff','Bâton runique','weapon','staff',{power:.045,manaMax:8},2],['bow','Arc long','weapon','bow',{power:.04,ranged:.02},2],
  ['crossbow','Arbalète lourde','weapon','crossbow',{power:.055,crit:.005},2],['scythe','Faux rituelle','weapon','scythe',{power:.05,manaRegen:.25},2]
 ].map(([id,name,slot,sprite,base,hands=0])=>({id,name,slot,sprite,base,hands}));
 const uniques=[
  {base:'helm',name:'Veilleur des cryptes',stats:{armor:1.2}}, {base:'amulet',name:'Œil de la nuit',stats:{manaRegen:.8}},
  {base:'pauldrons',name:'Rempart des exilés',stats:{hp:12}}, {base:'plate',name:'Cœur du bastion',stats:{hp:16}},
  {base:'bracers',name:'Liens du sablier',stats:{cdr:.04}}, {base:'gloves',name:'Serres de l’aube',stats:{attackSpeed:.06}},
  {base:'ring',name:'Promesse du chasseur',stats:{crit:.025}}, {base:'signet',name:'Sceau du dernier roi',stats:{power:.05}},
  {base:'greaves',name:'Piliers de cendre',stats:{armor:1.3}}, {base:'boots',name:'Pas du spectre',stats:{moveSpeed:.06}},
  {base:'sword',name:'Murmure d’acier',stats:{critDamage:.15}}, {base:'dagger',name:'Dent de minuit',stats:{attackSpeed:.07}},
  {base:'wand',name:'Écho des étoiles',stats:{manaRegen:1}}, {base:'greatsword',name:'Jugement du crépuscule',stats:{power:.1}},
  {base:'staff',name:'Racine des anciens',stats:{manaMax:25}}, {base:'bow',name:'Serment du vent',stats:{ranged:.1}}
 ];
 const milestones=[{id:'eq_collector',name:'Collectionneur',desc:'Ramasser 25 équipements',key:'found',target:25},
  {id:'eq_hunter',name:'Chasseur de reliques',desc:'Ramasser un légendaire ou un ancien',key:'legendary',target:1},
  {id:'eq_conqueror',name:'Fléau des gardiens',desc:'Vaincre 10 boss',key:'bosses',target:10},
  {id:'eq_ancient',name:'Mémoire des anciens',desc:'Ramasser un objet ancien',key:'ancient',target:1}];
 const fresh=()=>({version:1,serial:0,tabs:2,stash:Array(60).fill(null),heroes:Object.fromEntries(CLASSES.map(c=>[c,Object.fromEntries(Object.keys(slots).map(s=>[s,null]))])),counts:{found:0,legendary:0,ancient:0,bosses:0},unlocked:[]});
 const previousQuality=[1,1.12,1.28,1.45,1.65,2];
 const round=n=>Math.round(n*10000)/10000;
 const add=(a,b)=>{for(const [k,v]of Object.entries(b))a[k]=round((a[k]||0)+v);return a;};
 let state=fresh(),error='';
 function validStats(value){return value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([k,v])=>stats[k]&&Number.isFinite(v)&&v>=0&&v<=200);}
 function validItem(it){return it&&typeof it.id==='string'&&it.id.length<80&&bases.some(b=>b.id===it.baseId)&&Number.isInteger(it.rarity)&&it.rarity>=0&&it.rarity<6&&Number.isInteger(it.level)&&it.level>=1&&it.level<=40&&typeof it.name==='string'&&it.name.length<160&&validStats(it.stats)&&Array.isArray(it.affixes)&&it.affixes.length<=4&&it.affixes.every(a=>a&&affixes.some(f=>f.id===a.id)&&validStats(a.stats))&&(!it.special||validStats(it.special));}
 function load(){state=fresh();error='';try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');if(!raw||raw.version!==1)return;const next=fresh(),seen=new Set();let migrated=false;
  next.serial=Math.max(0,Math.min(1e12,Math.floor(Number(raw.serial)||0)));next.unlocked=milestones.filter(m=>raw.unlocked?.includes(m.id)).map(m=>m.id);next.tabs=2+next.unlocked.length;next.stash=Array(next.tabs*PAGE_SIZE).fill(null);
  const take=it=>{if(!validItem(it)||seen.has(it.id))return null;seen.add(it.id);
   if(it.qualityVersion!==2){const ratio=rarities[it.rarity].mul/previousQuality[it.rarity];for(const [k,v]of Object.entries(it.stats)){const fixed=it.special?.[k]||0;it.stats[k]=round(Math.max(0,v-fixed)*ratio+fixed);}for(const a of it.affixes)for(const k of Object.keys(a.stats))a.stats[k]=round(a.stats[k]*ratio);it.qualityVersion=2;migrated=true;}
   return it;};
  for(let i=0;i<next.stash.length;i++)next.stash[i]=take(raw.stash?.[i]);
  for(const cls of CLASSES)for(const slot of Object.keys(slots)){const it=raw.heroes?.[cls]?.[slot],b=bases.find(b=>b.id===it?.baseId);if(b&&fits(b,slot)&&!(slot==='offhand'&&bases.find(b=>b.id===next.heroes[cls].mainhand?.baseId)?.hands===2))next.heroes[cls][slot]=take(it);}
  for(const k of Object.keys(next.counts))next.counts[k]=Math.max(0,Math.min(1e9,Math.floor(Number(raw.counts?.[k])||0)));state=next;if(migrated)save();
 }catch(e){error='Sauvegarde d’équipement illisible : nouveau coffre chargé.';}}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state));error='';return true;}catch(e){error='Sauvegarde indisponible : garde cette page ouverte.';return false;}}
 function fail(message){error=message;return false;}
 function fits(b,slot){return b.slot==='weapon'?['mainhand','offhand'].includes(slot)&&(slot!=='offhand'||b.hands===1):b.slot==='ring'?['ring1','ring2'].includes(slot):b.slot===slot;}
 function generate({rarity,level=1,baseId,rng=()=>window.SurvivorRunRng?SurvivorRunRng.random('loot'):Math.random(),boss=false}={}){
  if(!Number.isInteger(rarity)||rarity<0||rarity>5){const weights=boss?[.12,.25,.3,.25,.07,.01]:[.47,.28,.16,.07,.018,.002];let roll=rng();rarity=weights.findIndex(w=>(roll-=w)<0);if(rarity<0)rarity=5;}
  level=Math.max(1,Math.min(40,Math.floor(level)||1));
  const pool=rarity>=4&&!baseId?uniques.map(u=>bases.find(b=>b.id===u.base)):bases;
  const b=bases.find(b=>b.id===baseId)||pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];
  const unique=rarity>=4?uniques.find(u=>u.base===b.id):null,quality=rarities[rarity],scale=quality.mul*(1+.0125*(level-1));
  const values={};for(const [k,v]of Object.entries(b.base))values[k]=round(v*scale);
  const selected=[],available=[...affixes];for(let i=0;i<quality.affixes;i++){const a=available.splice(Math.min(available.length-1,Math.floor(rng()*available.length)),1)[0];const rolled={};for(const [k,[min,max]]of Object.entries(a.stats))rolled[k]=round((rarity===5?max:min+(max-min)*rng())*scale*(b.hands===2?1.7:1));add(values,rolled);selected.push({id:a.id,stats:rolled});}
  const special=unique?Object.fromEntries(Object.entries(unique.stats).map(([k,v])=>[k,round(v*(rarity===5?1.3:1))])):null;if(special)add(values,special);
  const name=(unique?unique.name:b.name)+(selected.length?' '+affixes.find(a=>a.id===selected[0].id).name:'');
  return {qualityVersion:2,id:'eq-'+(++state.serial)+'-'+Math.floor(rng()*0xffffff).toString(16),baseId:b.id,rarity,level,name,stats:values,affixes:selected,special};
 }
 function progress(){const unlocked=[];for(const m of milestones)if(!state.unlocked.includes(m.id)&&state.counts[m.key]>=m.target){state.unlocked.push(m.id);state.tabs++;state.stash.push(...Array(PAGE_SIZE).fill(null));unlocked.push(m);}return unlocked;}
 function owns(id){return state.stash.some(it=>it?.id===id)||Object.values(state.heroes).some(h=>Object.values(h).some(it=>it?.id===id));}
 function insert(it,{found=false}={}){if(!validItem(it)||owns(it.id))return fail('Objet invalide ou déjà possédé.');const pos=state.stash.indexOf(null);if(pos<0)return fail('Coffre plein : vends un objet ou libère un emplacement.');state.stash[pos]=it;if(found){state.counts.found++;if(it.rarity>=4)state.counts.legendary++;if(it.rarity===5)state.counts.ancient++;}const unlocked=progress();save();return {pos,unlocked};}
 function equip(cls,index,slot){const hero=state.heroes[cls],it=state.stash[index];if(!hero||!it)return fail('Choisis un objet du coffre.');const b=bases.find(b=>b.id===it.baseId);if(!fits(b,slot))return fail('Cet objet ne va pas dans cet emplacement.');
  const returned=[];if(hero[slot])returned.push(hero[slot]);if(slot==='mainhand'&&b.hands===2&&hero.offhand)returned.push(hero.offhand);if(slot==='offhand'&&bases.find(b=>b.id===hero.mainhand?.baseId)?.hands===2)returned.push(hero.mainhand);
  const spaces=[index,...state.stash.map((v,i)=>v===null?i:-1).filter(i=>i>=0&&i!==index)];if(returned.length>spaces.length)return fail('Il faut une case libre pour ranger les deux armes.');
  state.stash[index]=null;if(slot==='mainhand'&&b.hands===2)hero.offhand=null;if(slot==='offhand'&&bases.find(b=>b.id===hero.mainhand?.baseId)?.hands===2)hero.mainhand=null;hero[slot]=it;returned.forEach((v,i)=>state.stash[spaces[i]]=v);save();return true;
 }
 function unequip(cls,slot,destination){const hero=state.heroes[cls];if(!hero?.[slot])return false;if(destination!==undefined&&(!Number.isInteger(destination)||destination<0||destination>=state.stash.length||state.stash[destination]))return fail('Dépose cet objet dans une case vide du coffre.');const pos=destination===undefined?state.stash.indexOf(null):destination;if(pos<0)return fail('Coffre plein : impossible de retirer cet objet.');state.stash[pos]=hero[slot];hero[slot]=null;save();return true;}
 function moveCell(from,to){if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=state.stash.length||to>=state.stash.length||!state.stash[from])return fail('Déplacement invalide.');[state.stash[from],state.stash[to]]=[state.stash[to],state.stash[from]];save();return true;}
 function move(index,page){if(!Number.isInteger(page)||page<0||page>=state.tabs||!state.stash[index])return fail('Destination invalide.');if(Math.floor(index/PAGE_SIZE)===page)return true;const start=page*PAGE_SIZE;const offset=state.stash.slice(start,start+PAGE_SIZE).indexOf(null);if(offset<0)return fail('Cet onglet est plein.');state.stash[start+offset]=state.stash[index];state.stash[index]=null;save();return true;}
 // Budget applies to aggregate combat bonuses, preserving collectible item rolls.
 const gearCaps=Object.freeze({power:.35,melee:.25,ranged:.25,attackSpeed:.30,crit:.15,critDamage:.40,cdr:.20,dodge:.10,moveSpeed:.15,hp:80,armor:8,manaMax:45,manaRegen:3});
 function rawTotals(cls){const sum={};for(const it of Object.values(state.heroes[cls]||{}))if(it)add(sum,it.stats);return sum;}
 function totals(cls){const sum=rawTotals(cls);for(const key of Object.keys(sum))if(Number.isFinite(gearCaps[key]))sum[key]=Math.min(gearCaps[key],sum[key]);return sum;}
 function replacements(cls,index,slot){const it=state.stash[index],hero=state.heroes[cls];if(!it||!hero)return [];const b=bases.find(b=>b.id===it.baseId);const out=hero[slot]?[hero[slot]]:[];if(slot==='mainhand'&&b.hands===2&&hero.offhand)out.push(hero.offhand);if(slot==='offhand'&&bases.find(b=>b.id===hero.mainhand?.baseId)?.hands===2)out.push(hero.mainhand);return out;}
 function value(it){return Math.round((8+it.level*1.2)*[1,1.8,3.2,5.5,12,24][it.rarity]);}
 function sell(index){const it=state.stash[index];if(!it)return false;state.stash[index]=null;save();return value(it);}
 load();return {KEY,PAGE_SIZE,classes:CLASSES,slots,rarities,stats,affixes,bases,uniques,milestones,get state(){return state;},get error(){return error;},save,load,generate,insert,equip,unequip,totals,rawTotals,gearCaps,replacements,value,sell,move,moveCell,progress,fits,
  bossKill(){state.counts.bosses++;const unlocked=progress();save();return unlocked;},
  label(k,v){return '+'+(stats[k].percent?Math.round(v*1000)/10+' %':Math.round(v*100)/100)+' '+stats[k].name;},
  dropChance(enemy){return enemy.boss?1:enemy.elite?.15:.003;}
 };
})();
