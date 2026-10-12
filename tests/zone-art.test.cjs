'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function load(){const math=Object.create(Math);math.random=()=>{throw new Error('visuals must not use RNG');};const s={window:null,Math:math};s.window=s;vm.createContext(s);vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/survivors/zone-art.js'),'utf8'),s);return s.SurvivorZoneArt;}
function canvas(){const calls=[],stack=[],c={globalAlpha:1,createRadialGradient:(...args)=>({type:'radial',args,stops:[],addColorStop(at,color){this.stops.push([at,color]);}})};for(const method of ['translate','beginPath','moveTo','lineTo','closePath','fill','stroke','fillRect','arc','ellipse'])c[method]=(...args)=>{for(const a of args)if(typeof a==='number')assert.ok(Number.isFinite(a));calls.push([method,...args,typeof c.fillStyle==='object'?JSON.parse(JSON.stringify(c.fillStyle)):c.fillStyle,c.strokeStyle,c.globalAlpha]);};c.save=()=>{stack.push(c.globalAlpha);calls.push(['save']);};c.restore=()=>{assert.ok(stack.length);c.globalAlpha=stack.pop();calls.push(['restore']);};return {c,calls,stack};}
const modes=[['nova','poison'],['nova','magic'],['corpse','fire'],['fireball','fire'],['blizzard','cold'],['fissure','fire'],['aura','fire'],['shield','magic'],['curse','magic'],['plague','poison'],['whirl','physical'],['hurricane','cold']];
test('all families render deterministically with bounded finite canvas commands and restored opacity',()=>{
 const a=load();for(const [mode,element]of modes){const x=canvas(),y=canvas();const o={mode,element,age:.2,duration:.7};assert.equal(a.draw(x.c,mode,10,20,240,4,o),true);a.draw(y.c,mode,10,20,240,4,o);assert.deepEqual(x.calls,y.calls);assert.ok(x.calls.length<450,mode+' bounded commands');assert.equal(x.c.globalAlpha,1);assert.equal(x.stack.length,0);}
});
test('same paused runtime time freezes texture; advancing time animates distinct families',()=>{
 const a=load();for(const [mode,element]of modes){const x=canvas(),y=canvas();a.draw(x.c,mode,0,0,200,1,{mode,element});a.draw(y.c,mode,0,0,200,2,{mode,element});assert.notDeepEqual(x.calls,y.calls,mode);}
});
test('invalid or unsupported fields return false without painting; large radii bounded',()=>{
 const a=load(),x=canvas();for(const size of [NaN,Infinity,-1,0])assert.equal(a.draw(x.c,'nova',0,0,size,0,{mode:'nova'}),false);assert.equal(a.draw(x.c,'weapon',0,0,200,0,{mode:'weapon'}),false);assert.equal(x.calls.length,0);assert.equal(a.draw(x.c,'nova',0,0,1e9,0,{mode:'nova',element:'cold',age:0,duration:.7}),true);assert.ok(x.calls.length<450);
});
test('burst visual outlives unchanged damage field and is throttled without recursive jobs',()=>{
 const {createHarness}=require('./helpers/game-harness.cjs'),h=createHarness();h.run("Game.reset('sorceress');Game.state='playing'");const R=h.runtime,s=h.sandbox.SurvivorCatalogue.sorceress_fireball||h.sandbox.SurvivorCatalogue.spells.sorceress_fireball;R.burst(s,100,100);assert.equal(R.fields[0].until-R.now,.15);assert.equal(R.fx.filter(f=>f.kind==='zoneSpell').length,1);assert.equal(R.fx.find(f=>f.kind==='zoneSpell').maxLife,.7);R.burst(s,100,100);assert.equal(R.fx.filter(f=>f.kind==='zoneSpell').length,1);assert.equal(R.jobs.length,0);assert.equal(R.fields.length,2);
});
test('poison nova expands with normalized lifetime while poison pools retain local drift',()=>{
 const a=load(),early=canvas(),late=canvas(),normalized=canvas(),pool=canvas();
 a.draw(early.c,'necromancer_nova',0,0,200,4,{mode:'nova',element:'poison',age:.07,duration:.7});
 a.draw(late.c,'necromancer_nova',0,0,200,4,{mode:'nova',element:'poison',age:.56,duration:.7});
 a.draw(normalized.c,'necromancer_nova',0,0,200,4,{mode:'nova',element:'poison',age:1.12,duration:1.4});
 assert.deepEqual(late.calls,normalized.calls,'same lifetime fraction gives same wave');
 const radius=c=>c.calls.filter(call=>call[0]==='ellipse').reduce((sum,p)=>sum+Math.hypot(p[1],p[2]),0)/18;
 assert.ok(radius(late)>radius(early)*3,'spore ring travels outward');
 assert.ok(late.calls.some(call=>call[0]==='stroke'),'radial filaments accompany spores');
 a.draw(pool.c,'assassin_venom',0,0,200,4,{mode:'venom',element:'poison',age:.56,duration:.7});
 assert.ok(!pool.calls.some(call=>call[0]==='stroke'),'stationary pool uses smoke rather than nova filaments');
});
