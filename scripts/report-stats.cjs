'use strict';
// Runs the actual browser formulas without DOM, equipment, meta upgrades or combat.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
function createContext() {
  const context = {console, Player:{classId:'sorceress',passives:{},skills:[],weapons:{}}, metaBonus:()=>1};
  context.window=context;
  vm.createContext(context);
  for(const file of ['js/data.js','js/survivors/catalog.js','js/survivors/evolution-content.js','js/survivors/runtime.js','js/survivors/stats.js']) {
    vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  }
  context.SurvivorRuntime.reset();
  return context;
}
function buildReport() {
  const c=createContext(), C=c.SurvivorCatalogue, S=c.SurvivorStats, R=c.SurvivorRuntime;
  const profiles=Object.keys(S.profiles).map(cls=>{c.Player.classId=cls;return {class:cls,...S.get(cls,true)};});
  const rows=[];
  for(const d of Object.values(C.spells)) {
    c.Player.classId=d.group==='common'?'sorceress':d.group;
    c.Player.passives={};R.talents.clear();c.Player.skills=[];c.Player.weapons={};
    for(const rank of [1,2,3,4,5,'ultime']) {
      const s=R.stats({id:d.id,level:rank==='ultime'?5:rank,evolved:rank==='ultime'});
      rows.push({id:d.id,class:c.Player.classId,rank,element:s.element,mode:s.mode,category:S.category(s),attackSpeed:S.usesAttackSpeed(s),activation:S.activation(s),damage:s.dmg,cd:s.cd,count:s.count,radius:s.radius,duration:s.duration,pierce:s.pierce,ricochet:s.ricochet||0,speed:s.speed,strikeInterval:s.strikeInterval||.18,jumps:s.jumps,crit:s.crit,critDamage:s.critDamage,mana:S.manaCost(s),drain:S.activation(s)==='aura'?S.manaDrain(s):0,allyHP:s.allyHP||0});
    }
  }
  return {assumptions:'Rangs sans équipement/méta/passifs/talents/synergies ; classe native, armes communes sur Sorcière. Ultime isolé sans bonus du prérequis. Ultimes communs calculés avec leurs profils spécifiques ; combos et Présages inactifs. Dégâts de formule, pas DPS mesuré.',profiles,rows};
}
const number=n=>Number(n.toFixed(3));
function markdown(report) {
  const lines=['# Matrice calculée des capacités','',report.assumptions,'','Reproduire : `node scripts/report-stats.cjs` ; données exactes : `node scripts/report-stats.cjs --json`.','','| Capacité | Classe | Rang | Élément / catégorie | Activation | VA | Dégâts | Délai s | Nb | Rayon | Durée s | Perce / chaîne / rebonds | Vitesse projectile | Intervalle frappe s | Crit % / × | Mana / drain s | PV allié |','|---|---|---|---|---|---|---:|---:|---:|---:|---:|---|---:|---:|---|---|---:|'];
  for(const r of report.rows)lines.push(`| ${r.id} | ${r.class} | ${r.rank} | ${r.element} / ${r.category} | ${r.activation} | ${r.attackSpeed?'oui':'non'} | ${number(r.damage)} | ${number(r.cd)} | ${r.count} | ${number(r.radius)} | ${number(r.duration)} | ${r.pierce} / ${r.jumps} / ${r.ricochet} | ${number(r.speed)} | ${number(r.strikeInterval)} | ${number(r.crit*100)} / ${number(r.critDamage)} | ${r.mana} / ${r.drain} | ${number(r.allyHP)} |`);
  return lines.join('\n')+'\n';
}
if(require.main===module) {const report=buildReport();process.stdout.write(process.argv.includes('--json')?JSON.stringify(report,null,2)+'\n':markdown(report));}
module.exports={createContext,buildReport,markdown};
