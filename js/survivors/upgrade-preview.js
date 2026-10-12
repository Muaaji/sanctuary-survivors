/* Read-only upgrade previews. Numbers are reference values, never measured DPS. */
'use strict';
window.SurvivorUpgradePreview=(()=>{
  const fmt=n=>Number(n.toFixed(2)).toLocaleString('fr-FR');
  const pair=(a,b,unit='')=>(a===null?'—':fmt(a))+ ' → '+fmt(b)+unit;
  function passive(opt){
    const C=SurvivorCatalogue,id=opt.id,p=C.passives[id];if(!p)return '';
    const rank=Player.passives[id]||0,next=Math.min(p.maxLevel||5,opt.level||rank+1);
    const a=SurvivorStats.get(),delta=next-rank;
    const additive={power:['Bonus de dégâts généraux',.08],melee:['Bonus de mêlée',.08],ranged:['Bonus à distance',.08],duration:['Bonus de durée',.1],area:['Bonus de rayon',.04],speed:['Bonus de déplacement',.04],attackSpeed:['Bonus de vitesse d’attaque compatible',.06],critDamage:['Bonus au multiplicateur critique',.12]};
    if(additive[id]){const [label,step]=additive[id];return label+' : '+pair(rank*step*100,next*step*100,' points de %')+'.';}
    if(id==='crit')return 'Chance critique : '+pair(a.crit*100,Math.min(.75,a.crit+.02*delta)*100,' %')+' (plafond 75 %).';
    if(id==='dodge')return 'Esquive : '+pair(a.dodge*100,Math.min(.45,a.dodge+.03*delta)*100,' %')+' (plafond 45 %).';
    if(id==='cooldown')return 'Réduction globale des délais : '+pair(a.cdr*100,Math.min(.5,a.cdr+.04*delta)*100,' %')+' ; chaque capacité ajoute ses propres bonus.';
    if(id==='armor')return 'Armure : '+pair(a.armor,a.armor+delta)+' ; réduction : '+pair(Math.min(.6,a.armor*.02)*100,Math.min(.6,(a.armor+delta)*.02)*100,' %')+'.';
    if(id==='mana')return 'Mana max : '+pair(a.manaMax,a.manaMax+15*delta)+' ; régénération : '+pair(a.manaRegen,a.manaRegen+.5*delta,'/s')+'.';
    if(id==='magnet')return 'Rayon de ramassage : '+pair(80*(1+.2*rank),80*(1+.2*next))+' unités.';
    if(id==='vitality')return 'Bonus de PV de base : '+pair(rank*10,next*10,' %')+' ; les PV plats ne sont pas multipliés.';
    if(id==='amount')return 'Arcs/arbalètes : vitesse des projectiles +'+pair(rank*10,next*10,' %')+' ; projectiles bonus '+pair((rank>=2?1:0)+(rank>=5?1:0),(next>=2?1:0)+(next>=5?1:0))+'.';
    return 'Rang '+rank+' → '+next+' · '+p.desc;
  }
  function describe(opt){
    if(!opt||!opt.id)return '';
    if(opt.kind==='passive')return passive(opt);
    const d=SurvivorCatalogue.spells[opt.id];if(!d)return '';
    const R=SurvivorRuntime,S=SurvivorStats,w=R.state(opt.id);
    const before=w?R.stats({...w}):null;
    const after=R.stats({id:opt.id,level:opt.kind==='ultimate'?5:Math.min(5,opt.level||((w?.level||0)+1)),evolved:opt.kind==='ultimate'||!!w?.evolved});
    const change=(key,unit='')=>pair(before?before[key]:null,after[key],unit);
    const segments=[];
    if(d.mode==='shield'){
      const shield=s=>Player.hpMax*.15*(1+.15*Math.floor(s.level/2)+(s.mods.shield||0))*(s.evolved?1.5:1);
      segments.push('Absorption '+pair(before?shield(before):null,shield(after),' PV'));
    }else if(d.mode==='curse'){
      segments.push('Dégâts physiques reçus +'+pair(before?(before.evolved?40:25):null,after.evolved?40:25,' %')+' (moitié pour Explosion morbide)');
    }else if(d.mode==='companion'){
      segments.push('Dégâts de référence par attaque '+change('dmg'),'PV par compagnon '+change('allyHP'),'Compagnons prévus '+change('count')+' (plafond global 8)');
    }else if(d.mode==='plague'){
      segments.push('Impact de référence '+change('dmg'),'Poison du nuage '+pair(before?before.dmg*.5:null,after.dmg*.5,' dégâts/s'));
    }else if(d.mode==='venom'||d.element==='poison'&&['nova','pool'].includes(d.mode)){
      segments.push('Poison de référence '+change('dmg',' dégâts/s'));
      if(d.mode==='venom')segments.push('Poison appliqué pendant 2 s par touche physique directe');
    }else if(['fissure','blizzard','hurricane','whirl','pool'].includes(d.mode)){
      segments.push('Zone de référence '+change('dmg',' dégâts/s'));
    }else{
      segments.push('Dégâts de référence '+change('dmg'));
    }
    segments.push((d.mode==='companion'?'Intervalle d’attaque ':'Recharge ')+change('cd',' s'));
    if(after.duration)segments.push('Durée '+change('duration',' s'));
    if(after.radius&&!['hammer','tornado','spear','companion','turret','venom'].includes(d.mode))segments.push('Rayon '+change('radius'));
    if(d.mode!=='companion'&&after.count>1)segments.push('Quantité de référence '+change('count'));
    if(S.activation(after)==='aura')segments.push('Activation '+pair(before?S.manaCost(before):null,S.manaCost(after),' mana')+' ; entretien '+S.manaDrain(after)+' mana/s');
    else segments.push('Mana '+pair(before?S.manaCost(before):null,S.manaCost(after)));
    return (w?'':'Nouveau · ')+segments.join(' ; ')+'.';
  }
  return {describe};
})();
