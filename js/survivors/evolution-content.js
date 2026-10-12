/* Original common-weapon evolutions. Input is R.stats after its legacy evolution block. */
'use strict';
window.SurvivorEvolutionContent=(()=>{
  const profiles={
    common_knives:{kind:'dagger',damage:1.15,area:1,cooldown:.9,count:0,pierce:2,crit:.10,effect:'Dagues précises : +2 perforations, +10 points critiques ; cadence +11 %.'},
    common_axes:{kind:'axe',damage:1.15,area:1,cooldown:1,count:0,pierce:2,speed:1.2,effect:'Hache traversante : +2 perforations et projectile 20 % plus rapide ; retour existant.'},
    common_embers:{kind:'bow',damage:1.1,area:1,cooldown:1,count:1,speed:1.25,effect:'Arc tendu : une flèche supplémentaire, projectiles 25 % plus rapides.'},
    common_blades:{kind:'sword',damage:1,area:1.12,cooldown:1,count:1,effect:'Épée enchaînée : une taille supplémentaire, portée +12 %.'},
    common_flasks:{kind:'spear',damage:1.2,area:1.45,cooldown:1,count:0,effect:'Lance de ligne : estocade 45 % plus longue, sans frappe supplémentaire.'},
    common_frost:{kind:'crossbow',damage:1.2,area:1,cooldown:1,count:0,pierce:3,speed:1.15,effect:'Arbalète traversante : +3 perforations et carreaux 15 % plus rapides.'},
    common_storm:{kind:'scythe',damage:1.15,area:1.35,cooldown:1,count:0,effect:'Faux étendue : balayage circulaire 35 % plus large, sans seconde frappe.'},
    common_seal:{kind:'mace',damage:1,area:1,cooldown:1,count:1,strikeInterval:.12,effect:'Masse insistante : seconde frappe étourdissante ; intervalle entre frappes de 0,12 s.'},
    common_skulls:{kind:'sling',damage:.9,area:1,cooldown:.95,count:0,ricochet:2,effect:'Fronde dispersée : +2 rebonds ; dégâts par impact −10 %, recharge −5 %.'},
    common_comets:{kind:'flail',damage:.85,area:.9,cooldown:1,count:2,effect:'Fléau serré : deux masses orbitales supplémentaires ; rayon −10 %, dégâts par impact −15 %.'}
  };
  const finite=(v,fallback)=>Number.isFinite(v)?v:fallback;
  const bound=(v,min,max,fallback)=>Math.max(min,Math.min(max,finite(v,fallback)));
  function describe(id){const p=profiles[id];return p?{id,weaponKind:p.kind,effect:p.effect,weaponRank:5,passiveRank:1,...p}:null;}
  function applyStats(s){
    if(!s)return s;
    const out={...s,mods:s.mods?{...s.mods}:s.mods},p=profiles[s.id];
    if(!p||!s.evolved||s.group!=='common'||s.mode!=='weapon'||s.weaponKind!==p.kind)return out;
    // Undo only the current common generic block, then apply behavior-specific budget.
    const baseCount=Math.max(0,finite(s.count,1)-(['axe','sling'].includes(p.kind)?0:1));
    const baseRicochet=Math.max(0,finite(s.ricochet,0)-(p.kind==='sling'?2:0));
    out.dmg=bound(finite(s.dmg,0)/1.35*p.damage,0,100000,0);
    out.radius=bound(finite(s.radius,0)/1.15*p.area,0,1000,0);
    out.cd=bound(finite(s.cd,.85)/.85*p.cooldown,.05,60,1);
    out.count=Math.floor(bound(baseCount+p.count,1,12,1));
    out.pierce=Math.floor(bound(finite(s.pierce,0)+(p.pierce||0),0,8,0));
    out.ricochet=Math.floor(bound(baseRicochet+(p.ricochet||0),0,8,0));
    out.crit=bound(finite(s.crit,0)+(p.crit||0),0,.75,0);
    if(p.strikeInterval)out.strikeInterval=p.strikeInterval;
    out.speed=bound(finite(s.speed,360)*(p.speed||1),1,1200,360);
    return out;
  }
  function finalStats(w,s){return applyStats({...s,evolved:!!(w&&w.evolved)});}
  return {describe,applyStats,finalStats,ids:()=>Object.keys(profiles)};
})();
