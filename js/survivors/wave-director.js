/* Population texture and role budgets, independent of strength/rate scaling. */
'use strict';
window.SurvivorWaveDirector=(()=>{
 const roles={zombie:'tank',ogre:'tank',sandDemon:'tank',undeadKnight:'tank',skeletonArcher:'ranged',boneMage:'caster',fungus:'caster',wraith:'caster',fallen:'runner',serpent:'runner',fireHound:'runner',spider:'runner',scarab:'fodder',skeleton:'fodder',batDemon:'fodder',goatD:'fodder'};
 const acts=[
  {types:['fallen','zombie','skeleton'],fodder:'skeleton',signature:'fallen',name:'Ruée des déchus'},
  {types:['scarab','serpent','sandDemon','goatD'],fodder:'scarab',signature:'serpent',name:'Traque des dunes'},
  {types:['fungus','spider','wraith'],fodder:'zombie',signature:'spider',name:'Essaim du marais'},
  {types:['fireHound','batDemon','ogre'],fodder:'batDemon',signature:'fireHound',name:'Meute infernale'},
  {types:['undeadKnight','skeletonArcher','wraith'],fodder:'skeleton',signature:'skeletonArcher',name:'Volée du givre'}
 ];
 const earlyPools=[['fallen','skeleton'],['scarab','serpent'],['zombie','spider'],['fireHound','batDemon'],['skeleton','undeadKnight']];
 const names={2:{zombie:'Hôte des spores'},4:{skeleton:'Sentinelle gelée'}};
 const state={act:0,lastTime:-1,lastKey:null,event:null};
 const elapsed=t=>Number.isFinite(t)?Math.max(0,t):0;
 const index=a=>Math.max(0,Math.min(4,Math.floor(Number(a)||0)));
 const phase=t=>t<60?'learning':t<90?'mixed':t<180?'rotation':t<300?'signature':'late';
 function eventAt(act,time){
  const t=elapsed(time),a=acts[index(act)];
  if(t>=90&&t<108)return {id:'lesson',start:90,end:108,prefer:a.types[Math.min(2,a.types.length-1)],label:'Nouvelle formation : observez les renforts'};
  if(t>=180&&t<200)return {id:'signature',start:180,end:200,prefer:a.signature,label:a.name};
  if(t>=300&&t<322)return {id:'rotation',start:300,end:322,prefer:a.fodder,label:'Les rangs se renouvellent'};
  return null;
 }
 function config(act,time,baseCfg={}){
  const a=index(act),t=elapsed(time),theme=acts[a],early=t<60,event=eventAt(a,t),maxEnemies=Math.max(1,Math.min(180,Math.floor(baseCfg.maxEnemies||180))),scale=maxEnemies/180;
  const roleCaps={tank:Math.max(1,Math.floor(12*scale)),ranged:Math.max(1,Math.floor(8*scale)),caster:Math.max(1,Math.floor(6*scale)),runner:Math.max(1,Math.floor(20*scale))};
  const types=(early?earlyPools[a]:theme.types).slice();
  // Existing art supplies ordinary melee fodder where all native families are budgeted.
  if(!types.includes(theme.fodder))types.push(theme.fodder);
  const weights={};for(const type of types){const role=type===theme.fodder?'fodder':roles[type]||'fodder';weights[type]=role==='fodder'?5:role==='runner'?3:role==='tank'?1.5:1;}
  if(early)weights[types[0]]*=1.4;
  if(event&&types.includes(event.prefer))weights[event.prefer]*=2;
  return {...baseCfg,act:a,time:t,phase:phase(t),types,weights,roleCaps,fodder:[...new Set([theme.fodder,...types.filter(type=>roles[type]==='fodder')])],maxEnemies,event,names:{...(baseCfg.names||{}),...(names[a]||{})}};
 }
 function choose(cfg,liveEnemies=[],rng=Math.random){
  const live=liveEnemies.filter(e=>e&&!e.dead),population=live.filter(e=>!e.boss&&!e.ssChampion);
  if(live.length>=(cfg.maxEnemies||180))return null;
  const fodder=new Set(cfg.fodder||[]),roleOf=type=>fodder.has(type)?'fodder':roles[type]||'fodder';
  const counts={};for(const e of population){const role=roleOf(e.type);counts[role]=(counts[role]||0)+1;}
  let candidates=(cfg.types||[]).filter(type=>{const role=roleOf(type);return !(role in (cfg.roleCaps||{}))||(counts[role]||0)<cfg.roleCaps[role];});
  // Never promote a capped dangerous role: reserve native fodder instead of bursting specialists.
  if(!candidates.length)candidates=(cfg.fodder||[]).filter(type=>(cfg.types||[]).includes(type)&&!(roleOf(type) in (cfg.roleCaps||{})));
  if(!candidates.length)return null;
  const weighted=candidates.map(type=>({type,weight:Math.max(0,Number(cfg.weights?.[type])||0)})).filter(v=>v.weight>0);
  if(!weighted.length)return candidates[0];
  const total=weighted.reduce((n,v)=>n+v.weight,0),value=rng(),draw=Math.max(0,Math.min(1-Number.EPSILON,Number.isFinite(value)?value:0))*total;let sum=0;
  for(const item of weighted){sum+=item.weight;if(draw<sum)return item.type;}
  return weighted[weighted.length-1].type;
 }
 function reset(){state.act=0;state.lastTime=-1;state.lastKey=null;state.event=null;}
 function update(time){
  if(typeof Game==='undefined'||Game.state!=='playing')return;
  const t=elapsed(time),act=index(window.SurvivorActs?.index||0);
  if(t<state.lastTime||act!==state.act){state.lastKey=null;state.event=null;}state.act=act;state.lastTime=t;
  const event=eventAt(act,t),key=event?`${act}:${event.id}`:null;
  if(key!==state.lastKey&&event&&typeof toast==='function')toast(event.label);
  state.lastKey=key;state.event=event;
 }
 return {config,choose,update,reset,eventAt,roles,acts,state};
})();
