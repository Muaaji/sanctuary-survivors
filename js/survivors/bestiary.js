/* Persistent encounters discovered through the existing Knowledge storage. */
'use strict';
window.SurvivorBestiary=(()=>{
 const roles={runner:'Approche rapide puis ruée annoncée ; sortir du couloir de charge.',charger:'Charge annoncée ; contourner son couloir puis profiter de sa récupération.',bulwark:'Adversaire robuste au contact ; garder une issue pour le contourner.',flanker:'Approche latérale ; surveiller les côtés pendant le déplacement.',poison:'Pose une zone de poison annoncée ; quitter le cercle avant son activation.',web:'Pose une toile annoncée qui ralentit ; éviter de traverser la zone active.',archer:'Tire à distance ; se déplacer latéralement pour éviter ses projectiles.',pursuer:'Poursuit le héros et menace au contact ; conserver de l’espace.'};
 const role=type=>window.SurvivorEnemyRoles?.families[type]||'pursuer';
 const status=key=>window.SurvivorKnowledge?.status?.(key)||0;
 function entries(){
  const out=[];
  if(typeof ENEMY_BASE!=='undefined')for(const [type,d]of Object.entries(ENEMY_BASE))out.push({key:'enemy:'+type,id:type,type,name:d.name,family:'Monstres ordinaires',role:role(type),desc:type==='wraith'?'Poursuit au contact ; en montagne, annonce aussi un cercle de givre à éviter.':roles[role(type)],act:d.act,imagePath:null,sprite:d.sprite});
  for(const d of window.SurvivorEncounters?.catalog?.()||[])out.push({key:'champion:'+d.sprite,id:d.sprite,type:d.type,name:d.name,family:'Champions',role:role(d.type),desc:roles[role(d.type)]+' Champion intermédiaire de l’acte '+(d.act+1)+'.',act:d.act,index:d.index,imagePath:'assets/sprites/champions/'+d.sprite+'.png',sprite:d.sprite});
  const finals=window.SurvivorEncounters?.finalCatalog?.()||(typeof BOSSES!=='undefined'?BOSSES.map((d,act)=>({id:d.id,name:d.name,sprite:d.sprite,act})):[]);
  for(const d of finals)out.push({key:'boss:'+d.id,id:d.id,name:d.name,family:'Boss finaux',role:'final',desc:'Boss final de l’acte '+(d.act+1)+' : ses attaques sont annoncées ; sa défaite termine cet acte.',act:d.act,sprite:d.sprite,imagePath:null});
  return out.map(d=>({...d,status:status(d.key)}));
 }
 function key(entity){
  if(!entity)return null;
  if(entity.ssChampion){const sprite=entity.ssChampionSprite;if(!sprite)return null;return 'champion:'+sprite;}
  if(entity.boss){const id=entity.id;if(!id)return null;return 'boss:'+id;}
  return entity.type?'enemy:'+entity.type:null;
 }
 function mark(entity,defeated){
  const knowledge=window.SurvivorKnowledge;if(!knowledge?.mark)return false;
  const id=key(entity);if(!id||!entries().some(e=>e.key===id))return false;
  knowledge.mark(id,defeated);return true;
 }
 return {entries,seen:entity=>mark(entity,false),defeated:entity=>mark(entity,true)};
})();
