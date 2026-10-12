/* Character attributes. Percentage bonuses stack additively; attack speed and cooldown have separate roles. */
'use strict';
window.SurvivorStats={
 profiles:{
  paladin:{melee:.15,ranged:-.10,armor:3,dodge:0,mana:80,regen:2,crit:0,critDamage:0,attackSpeed:-.05,cdr:0,note:'+15 % mêlée, +3 armure ; −10 % distance, −5 % vitesse d’attaque.'},
  sorceress:{melee:-.20,ranged:.05,armor:0,dodge:0,mana:140,regen:3.5,crit:0,critDamage:0,attackSpeed:0,cdr:.05,note:'+40 mana, +5 % recharge ; −20 % mêlée, faible vie et armure.'},
  amazon:{melee:-.10,ranged:.15,armor:0,dodge:.05,mana:90,regen:2,crit:.03,critDamage:0,attackSpeed:0,cdr:0,note:'+15 % distance, +3 % critique, +5 % esquive ; −10 % mêlée.'},
  necromancer:{melee:-.15,ranged:0,armor:0,dodge:0,mana:130,regen:3,crit:0,critDamage:.15,attackSpeed:-.05,cdr:0,note:'+30 mana, +15 points de dégâts critiques ; −15 % mêlée, −5 % vitesse d’attaque.'},
  druid:{melee:.05,ranged:.05,armor:1,dodge:0,mana:110,regen:4.5,crit:0,critDamage:-.10,attackSpeed:0,cdr:0,note:'+5 % mêlée et distance, +1 armure ; −10 points de dégâts critiques.'},
  barbarian:{melee:.20,ranged:-.15,armor:2,dodge:0,mana:60,regen:1.5,crit:0,critDamage:.10,attackSpeed:.05,cdr:-.05,note:'+20 % mêlée, +5 % vitesse d’attaque ; −15 % distance, −5 % recharge, −40 mana.'},
  assassin:{melee:.10,ranged:0,armor:0,dodge:.10,mana:80,regen:2,crit:.05,critDamage:.20,attackSpeed:.10,cdr:0,note:'+10 % esquive et vitesse d’attaque, +5 % critique ; −20 mana, faible vie.'}
 },
 get(cls=Player.classId,base=false){const p=this.profiles[cls],rank=id=>base?0:(Player.passives[id]||0);
  const result={melee:p.melee+.08*rank('melee'),ranged:p.ranged+.08*rank('ranged'),power:.08*rank('power')+(CLASSES[cls].dmgMul||1)-1+(base?0:metaBonus('might')-1),armor:p.armor+rank('armor')+(!base&&SurvivorRuntime.shieldHP>0?3:0),dodge:Math.min(.45,p.dodge+.03*rank('dodge')),manaMax:p.mana+15*rank('mana'),manaRegen:p.regen+.5*rank('mana'),crit:Math.min(.75,.05+p.crit+.02*rank('crit')),critDamage:2+p.critDamage+.12*rank('critDamage'),attackSpeed:p.attackSpeed+.06*rank('attackSpeed')+(!base&&SurvivorRuntime.frenzyUntil>SurvivorRuntime.now?.2:0),cdr:Math.max(-.25,Math.min(.5,p.cdr+.04*rank('cooldown')))};
  if(!base&&window.SurvivorEquipment){const gear=SurvivorEquipment.totals(cls);for(const key of Object.keys(result))if(Number.isFinite(gear[key]))result[key]+=gear[key];result.crit=Math.min(.75,result.crit);result.dodge=Math.min(.45,result.dodge);result.cdr=Math.min(.5,Math.max(-.25,result.cdr));}
  return result;
 },
 category(s){if(s.attackType)return s.attackType;return ['melee','frenzy','whirl','orbit','companion'].includes(s.mode)?'melee':'ranged';},
 usesAttackSpeed(s){if(s.mode==='weapon'||s.mode==='companion')return true;if(s.group==='amazon'&&['fan','projectile','homing','javelin','plague'].includes(s.mode))return true;if(s.group==='assassin'&&s.mode==='turret')return true;return s.element==='physical'&&['melee','frenzy','whirl','orbit','projectile','fan'].includes(s.mode);},
 activation(s){if(s.group==='common'||s.basic||s.mode==='companion'||s.mode==='venom'||s.element==='physical'&&['melee','projectile','fan'].includes(s.mode))return 'passive';if(['aura','hurricane'].includes(s.mode))return 'aura';return 'active';},
 manaDrain(s){return s.mode==='hurricane'?6:4;},
 manaCost(s){if(this.activation(s)==='passive')return 0;if(s.group==='common'||s.basic)return 0;if(s.mode==='companion')return 12;if(s.mode==='fan')return 4;if(s.element==='physical'&&['melee','projectile'].includes(s.mode))return 0;return Math.round(Math.min(22,s.mode==='aura'?5:7+s.cd*1.5));}
};
