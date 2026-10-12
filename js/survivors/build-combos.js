/* Optional cross-branch build windows. No extra attacks, jobs or recursive triggers. */
'use strict';
window.SurvivorBuildCombos=(()=>{
  const WINDOW=2,COOLDOWN=6;
  const definitions=[
    {id:'amazon_vengeance',classId:'amazon',name:'Traque vénéneuse',source:'amazon_plague',target:'amazon_guided',bonus:{crit:.05},effect:'+5 points de chance critique des Traits guidés'},
    {id:'sorceress_conduction',classId:'sorceress',name:'Conduction ardente',source:'sorceress_fireball',target:'sorceress_chain',bonus:{radius:.12},effect:'+12 % de portée des sauts de Chaîne d’éclairs'},
    {id:'necromancer_marrow',classId:'necromancer',name:'Moelle toxique',source:'necromancer_nova',target:'necromancer_spear',bonus:{damage:.10},effect:'+10 % de dégâts de référence de Lance d’os'},
    {id:'paladin_oath',classId:'paladin',name:'Serment du rempart',source:'paladin_shield',target:'paladin_hammer',bonus:{crit:.05},effect:'+5 points de chance critique des Marteaux bénis'},
    {id:'barbarian_echo',classId:'barbarian',name:'Écho du défi',source:'barbarian_cry',target:'barbarian_throw',bonus:{crit:.05},effect:'+5 points de chance critique de Double lancer'},
    {id:'druid_ashwind',classId:'druid',name:'Vent de cendres',source:'druid_fissure',target:'druid_tornado',bonus:{damage:.10},effect:'+10 % de dégâts de référence de Tornade'},
    {id:'assassin_opening',classId:'assassin',name:'Ouverture électrique',source:'assassin_sentry',target:'assassin_claw',bonus:{damage:.10},effect:'+10 % de dégâts de référence de Griffe'}
  ];
  let windowId=null,until=0,readyAt=0;
  const definition=id=>definitions.find(d=>d.id===id);
  const owns=d=>d.classId===Player.classId&&[d.source,d.target].every(id=>(SurvivorRuntime.state(id)?.level||0)>=3);
  const live=d=>windowId===d.id&&SurvivorRuntime.now<until&&owns(d);
  const copy=d=>({...d,bonus:{...d.bonus},requirements:[d.source,d.target].map(id=>({id,rank:3})),window:WINDOW,cooldown:COOLDOWN});
  function list(classId=Player.classId){return definitions.filter(d=>d.classId===classId).map(copy);}
  function active(){return definitions.filter(owns).map(d=>({...copy(d),active:live(d),remaining:live(d)?Math.max(0,until-SurvivorRuntime.now):0,readyIn:Math.max(0,readyAt-SurvivorRuntime.now)}));}
  function preview(id){
    const d=definition(id);if(!d)return '';
    const C=SurvivorCatalogue;
    return d.name+' : '+C.spells[d.source].name+' + '+C.spells[d.target].name+' au rang 3. Lancer '+C.spells[d.source].name+' donne '+d.effect+' pendant 2 s ; délai partagé 6 s. '+(owns(d)?'Combo prêt.':'Prérequis incomplets.');
  }
  function onCast(s,ctx={}){
    if(!s||ctx.secondary||ctx.periodic||ctx.ally||s.secondary||s.periodic||s.ally)return false;
    const now=SurvivorRuntime.now;if(!Number.isFinite(now)||now<readyAt)return false;
    const d=definitions.find(d=>d.source===s.id&&owns(d));if(!d)return false;
    windowId=d.id;until=now+WINDOW;readyAt=now+COOLDOWN;return true;
  }
  function statsBonus(s){
    if(!s)return {};
    const d=definitions.find(d=>d.target===s.id&&live(d));return d?{...d.bonus}:{};
  }
  function apply(s){
    const b=statsBonus(s);return {...s,dmg:s.dmg*(1+Math.min(.10,b.damage||0)),radius:s.radius*(1+Math.min(.12,b.radius||0)),crit:Math.min(.75,s.crit+(Math.min(.05,b.crit||0)))};
  }
  function reset(){windowId=null;until=0;readyAt=0;}
  return {list,active,preview,onCast,statsBonus,apply,reset};
})();
