/* Local run history and reproducible starting seeds; never a recording of inputs. */
'use strict';
window.SurvivorReplay=(()=>{
 const KEY='survivor-run-history-v1',LIMIT=10;
 let mode='normal',current=null,finished=false,serial=0,nextSeed=null,history=[];
 const identifier=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,48}$/.test(v)?v:null;
 const number=(v,max)=>Number.isFinite(v)&&v>=0?Math.min(max,v):0;
 const actOf=v=>Number.isInteger(v)&&v>=1&&v<=5?v:1;
 const seedOf=v=>typeof v==='string'&&v.length>0&&v.length<=160?v:null;
 function day(value){const d=value===undefined?new Date():value instanceof Date?value:new Date(value);if(!Number.isFinite(d.getTime()))throw new TypeError('Invalid UTC date');return d.toISOString().slice(0,10);}
 function ranks(value){const out={};if(value&&typeof value==='object'&&!Array.isArray(value))for(const [k,v]of Object.entries(value).slice(0,16))if(identifier(k)&&Number.isInteger(v)&&v>=0&&v<=100)Object.defineProperty(out,k,{value:v,enumerable:true});return out;}
 function clean(e){if(!e||typeof e!=='object'||!identifier(e.classId)||!['win','dead'].includes(e.result)||!Number.isInteger(e.act)||e.act<1||e.act>5||typeof e.token!=='string'||e.token.length>100||!/^\d{4}-\d{2}-\d{2}$/.test(e.date)||!Number.isFinite(e.time)||e.time<0||!Number.isFinite(e.level)||e.level<1)return null;
  return {token:e.token,date:e.date,mode:e.mode==='daily'?'daily':'normal',seed:seedOf(e.seed),classId:e.classId,act:e.act,heat:ranks(e.heat),result:e.result,time:number(e.time,86400),level:Math.floor(number(e.level,10000))};}
 try{const raw=localStorage.getItem(KEY);if(raw&&raw.length<=50000){const parsed=JSON.parse(raw);if(Array.isArray(parsed))history=parsed.slice(0,LIMIT).map(clean).filter(Boolean);}}catch(_){}
 function seedFor(classId,act,date){if(!identifier(classId))throw new TypeError('Invalid class');if(actOf(act)!==act)throw new TypeError('Invalid act');return 'daily-v1:'+day(date)+':'+classId+':'+act;}
 function start(classId,act,options={}){if(!identifier(classId))throw new TypeError('Invalid class');act=actOf(act);const date=day(options.date);const seed=seedOf(options.seed)||nextSeed||(mode==='daily'?seedFor(classId,act,date):null);nextSeed=null;current={token:Date.now().toString(36)+'-'+(++serial)+'-'+Math.random().toString(36).slice(2,10),mode,date,seed,classId,act};finished=false;return {...current};}
 function finish(snapshot){if(!current||finished||!snapshot||!['win','dead'].includes(snapshot.result))return null;const entry=clean({...current,result:snapshot.result,time:snapshot.time,level:snapshot.level,heat:snapshot.heat});if(!entry)return null;finished=true;history=[entry,...history.filter(e=>e.token!==entry.token)].slice(0,LIMIT);try{localStorage.setItem(KEY,JSON.stringify(history));}catch(_){}return JSON.parse(JSON.stringify(entry));}
 function entries(){return JSON.parse(JSON.stringify(history));}
 function format(e){return e.date+' · '+e.classId+' · acte '+e.act+' · '+(e.mode==='daily'?'parcours du jour':'partie libre')+' · '+(e.result==='win'?'victoire':'défaite')+' · '+Math.floor(e.time/60)+':'+String(Math.floor(e.time%60)).padStart(2,'0')+' · niv. '+e.level;}
 return {get mode(){return mode;},setMode(value){if(!['normal','daily'].includes(value))throw new TypeError('Invalid run mode');mode=value;nextSeed=null;return mode;},seedFor,start,finish,entries,format,replayLatest(){const e=history[0];if(!e?.seed)return null;nextSeed=e.seed;return JSON.parse(JSON.stringify(e));}};
})();
