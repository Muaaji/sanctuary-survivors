// Dependency-free integration/behavior tests of the real browser scripts in a DOM shim.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
function createHarness({seed}={}) {
const nodes=new Map();
const drawing=new Proxy({createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}}),measureText:s=>({width:s.length*6})},{get:(o,k)=>k in o?o[k]:()=>{}});
class Element {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.style={};this.disabled=false;this.width=32;this.height=32;this.classes=new Set();this.classList={add:(...xs)=>xs.forEach(x=>this.classes.add(x)),remove:(...xs)=>xs.forEach(x=>this.classes.delete(x)),toggle:(x,v)=>v?this.classes.add(x):this.classes.delete(x),contains:x=>this.classes.has(x)};}
 set innerHTML(v){this._html=v;this.children=[];for(const [,id]of v.matchAll(/id="([^"]+)"/g))if(!nodes.has(id))nodes.set(id,new Element());}
 get innerHTML(){return this._html||'';}
 appendChild(n){this.children.push(n);if(n.id)nodes.set(n.id,n);return n;}
 insertBefore(n){return this.appendChild(n);} remove(){} focus(){} after(){} contains(n){return this.children.includes(n);}
 querySelector(sel){if(!this.selectors)this.selectors={};return this.selectors[sel]||(this.selectors[sel]=new Element());}
 querySelectorAll(){return this.children;}
 addEventListener(){} setAttribute(name,value){this[name]=value;}
 getContext(){return drawing;}toDataURL(){return 'data:image/png;base64,';}
}
const document={addEventListener(){},getElementById(id){if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);},createElement:tag=>new Element(tag),querySelectorAll:()=>[],head:new Element('head')};
class ImageMock {
 set src(v){this._src=v;this.complete=true;this.width=this.height=v.includes('tiles')?1254:v.includes('boss_')?64:v.includes('sprites/')?48:32;this.naturalWidth=this.width;queueMicrotask(()=>{if(this.onload)this.onload();});}get src(){return this._src;}
}
const storage=new Map(),events=new Map();
const sandbox={getComputedStyle:()=>({zIndex:0}),matchMedia:()=>({matches:false,addEventListener(){}}),MutationObserver:class {observe(){} disconnect(){}},console:{log(){},warn(){},error(){}},document,Image:ImageMock,URLSearchParams,location:{search:'',reload(){}},innerWidth:1280,innerHeight:720,performance:{now:()=>0},requestAnimationFrame(){},addEventListener(type,handler){if(!events.has(type))events.set(type,[]);events.get(type).push(handler);},setTimeout(){},navigator:{},localStorage:{getItem(key){return storage.get(key)||null;},setItem(key,value){storage.set(key,value);}},fetch:()=>Promise.resolve({ok:true,json:()=>Promise.resolve({maps:[]})})};
sandbox.window=sandbox;vm.createContext(sandbox);
const scripts=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^"?]+)(?:\?[^" ]*)?"/g)].map(m=>m[1]);
if(!scripts.includes('js/survivors/run-rng.js'))scripts.unshift('js/survivors/run-rng.js');
if(!scripts.includes('js/survivors/run-economy.js'))scripts.unshift('js/survivors/run-economy.js');
for(const f of scripts)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox,{filename:f});
const run=src=>vm.runInContext(src,sandbox);
if(seed!==undefined)sandbox.SurvivorRunRng.reset(seed);
return {sandbox,run,document,nodes,events,storage,player:run('Player'),game:run('Game'),enemies:run('enemies'),runtime:sandbox.SurvivorRuntime};
}
module.exports={createHarness};
