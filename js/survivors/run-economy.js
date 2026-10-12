/* Economy contract: initial extraction of current rules, no automatic hooks. */
'use strict';
window.SurvivorRunEconomy=(()=>{
 const rank=value=>Math.max(0,Math.min(5,Math.floor(Number(value)||0)));
 const shopRules=Object.freeze(Object.fromEntries(Object.entries({potionHP:[160,2],potionMP:[180,1],weaponUp:[360,2],armorUp:[270,2],reroll:[220,1],magnetNow:[120,2],maxHP:[520,1],essenceDust:[600,1]}).map(([id,[cost,limit]])=>[id,Object.freeze({cost,limit})])));
 const gems=Object.freeze({small:1,mid:3,big:10,giant:60});
 function xpToLevel(level){const n=Number.isFinite(Number(level))?Math.max(1,Math.min(40,Math.floor(Number(level)||1))):1;return n===1?12:Math.round(10+n*4.5+Math.pow(n,1.12)*1.5);}
 function heatVector(value={}){return Object.fromEntries(['hp','damage','speed','elite','xp','rate'].map(id=>[id,rank(value[id])]));}
 function heatReward(value={}){return 1+.15*Object.values(heatVector(value)).reduce((a,b)=>a+b,0);}
 function heatFactors(value={}){const v=heatVector(value);return {hp:1+.2*v.hp,damage:1+.15*v.damage,speed:1+.08*v.speed,elite:.04*v.elite,xp:1-.1*v.xp,rate:1+.15*v.rate,reward:heatReward(v)};}
 const metaRules=Object.freeze({vital:Object.freeze({perRank:.15,maxRank:5}),might:Object.freeze({perRank:.08,maxRank:5}),swift:Object.freeze({perRank:.04,maxRank:5}),fortune:Object.freeze({perRank:.1,maxRank:5})});
 function metaBonus(id,value=0){const rule=metaRules[id];return rule?1+rank(value)*rule.perRank:1;}
 return Object.freeze({version:1,xpToLevel,levelCap:40,chestGold:50,maxedChestGold:100,shopRules,gems,coinValue:Object.freeze({min:4,max:9}),heatVector,heatReward,heatFactors,victoryEssence:value=>Math.floor(5*heatReward(value)),metaRules,metaBonus});
})();
