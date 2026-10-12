/* Debug/run RNG. No global Math.random replacement; disabled by default. */
'use strict';
window.SurvivorRunRng=(()=>{
  const streams=['combat','waves','offers','loot','visual'];
  let seed=null,current='combat',states=new Map(),counts={};
  function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function reset(value){seed=value==null?null:String(value);current='combat';states=new Map();counts={};return seed;}
  function random(stream=current){if(seed===null)return Math.random();if(!streams.includes(stream))throw new Error('Unknown RNG stream: '+stream);
    let a=states.has(stream)?states.get(stream):hash(seed+'\0'+stream);a=(a+0x6D2B79F5)>>>0;states.set(stream,a);counts[stream]=(counts[stream]||0)+1;
    let t=Math.imul(a^(a>>>15),a|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;
  }
  function withStream(stream,fn){if(!streams.includes(stream))throw new Error('Unknown RNG stream: '+stream);const previous=current;current=stream;try{return fn();}finally{current=previous;}}
  return {reset,random,withStream,streams,get enabled(){return seed!==null;},snapshot(){return {seed,current,counts:{...counts},states:Object.fromEntries(states)};}};
})();
