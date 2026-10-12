/* Optional champion rewards. Pure stat transforms; no extra attacks or triggers. */
'use strict';
window.SurvivorRunOmens=(()=>{
  const companions=['amazon','necromancer','druid','assassin'];
  const radiusModes=new Set(['weapon','melee','frenzy','orbit','chain','pool','fissure','blizzard','aura','meteor','nova','corpse','curse','whirl','hurricane','cry','turret','fireball','plague']);
  const hasRadius=s=>s.radius>0&&(!!s.weaponKind||radiusModes.has(s.mode));
  const definitions=[
    {id:'iron_thread',name:'Fil de fer',icon:'⚔',description:'Armes communes : +18 % de dégâts, −12 % de portée.',target:'weapon'},
    {id:'inner_ember',name:'Braise intérieure',icon:'✦',description:'Attaques non physiques : +18 % de dégâts, intervalle +12 %.',target:'magic'},
    {id:'split_eye',name:'Œil fendu',icon:'◈',description:'+5 points de chance critique ; −10 % de dégâts.',target:'crit'},
    {id:'devouring_circle',name:'Cercle dévorant',icon:'◎',description:'Capacités à rayon effectif : +18 % de rayon, −12 % de dégâts.',target:'area'},
    {id:'guide_pact',name:'Pacte du guide',icon:'♧',description:'Compagnons : +18 % de dégâts, intervalle entre attaques +12 %. Aucun compagnon supplémentaire.',target:'companion',classes:companions},
    {id:'sealed_hourglass',name:'Sablier scellé',icon:'⌛',description:'Capacités à durée positive : +18 % de durée, −10 % de dégâts.',target:'duration'},
    {id:'short_beat',name:'Battement bref',icon:'◇',description:'Capacités à rayon effectif : intervalle −15 %, rayon −12 %.',target:'cooldown'},
    {id:'burning_stride',name:'Marche ardente',icon:'➤',description:'+15 % de vitesse de déplacement ; −10 % de dégâts.',target:'mobility'}
  ];
  let taken=[],earned=new Set(),queue=[],cards=[],deferred=false;
  const copy=d=>({...d,...(d.classes?{classes:[...d.classes]}:{})});
  const classId=()=>window.Player?.classId;
  function list(cls=classId()){return definitions.filter(d=>!d.classes||d.classes.includes(cls)).map(copy);}
  function draw(){
    if(cards.length||!queue.length||taken.length>=2)return;
    const pool=list().filter(d=>!taken.includes(d.id));
    while(cards.length<3&&pool.length){const r=window.SurvivorRunRng?window.SurvivorRunRng.random('offers'):Math.random();cards.push(pool.splice(Math.floor(r*pool.length),1)[0].id);}
  }
  function reset(){taken=[];earned=new Set();queue=[];cards=[];deferred=false;}
  function earn(encounterId){
    const state=window.SurvivorEncounters?.state;
    const e=state?.encounters.find(e=>e.id===encounterId);
    if(!e||e.final||![120,240].includes(e.at)||!e.defeated||!e.entity?.dead||e.entity.encounterRunId!==state.runId||earned.has(encounterId)||earned.size>=2)return false;
    earned.add(encounterId);queue.push(encounterId);deferred=false;draw();return true;
  }
  function choices(){draw();return cards.map(id=>copy(definitions.find(d=>d.id===id)));}
  function choose(id){
    if(!queue.length||taken.length>=2||!cards.includes(id)||taken.includes(id))return false;
    taken.push(id);queue.shift();cards=[];deferred=false;draw();return true;
  }
  function defer(){if(!queue.length)return false;deferred=true;return true;}
  function resume(){if(!queue.length)return false;deferred=false;return true;}
  function applyStats(s){
    const out={...s};let damage=1,cd=1,radius=1,duration=1,crit=0;
    for(const id of taken){
      if(id==='iron_thread'&&s.group==='common'&&s.mode==='weapon'){damage*=1.18;if(hasRadius(s))radius*=.88;}
      if(id==='inner_ember'&&s.element&&s.element!=='physical'){damage*=1.18;cd*=1.12;}
      if(id==='split_eye'){crit+=.05;damage*=.9;}
      if(id==='devouring_circle'&&hasRadius(s)){radius*=1.18;damage*=.88;}
      if(id==='guide_pact'&&s.mode==='companion'){damage*=1.18;cd*=1.12;}
      if(id==='sealed_hourglass'&&s.duration>0){duration*=1.18;damage*=.9;}
      if(id==='short_beat'&&hasRadius(s)){cd*=.85;radius*=.88;}
      if(id==='burning_stride')damage*=.9;
    }
    if(Number.isFinite(s.dmg))out.dmg=s.dmg*Math.min(1.35,damage);
    if(Number.isFinite(s.cd))out.cd=s.cd*Math.max(.5,cd);
    if(Number.isFinite(s.radius))out.radius=s.radius*radius;
    if(Number.isFinite(s.duration))out.duration=s.duration*duration;
    if(Number.isFinite(s.crit))out.crit=Math.min(.75,s.crit+crit);
    return out;
  }
  function applyPlayerSpeed(speed){return Number.isFinite(speed)?speed*(taken.includes('burning_stride')?1.15:1):speed;}
  return {reset,earn,choices,choose,defer,resume,list,applyStats,applyPlayerSpeed,get pending(){return queue.length>0&&taken.length<2;},get deferred(){return deferred;},get owned(){return taken.map(id=>copy(definitions.find(d=>d.id===id)));}};
})();
