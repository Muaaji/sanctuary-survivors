'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'../js/survivors/replay.js'),'utf8');
function setup(raw,blocked=false){let saved=raw;const s={window:{},localStorage:{getItem(){if(blocked)throw Error();return saved;},setItem(k,v){if(blocked)throw Error();saved=v;}}};vm.runInNewContext(source,s);return {r:s.window.SurvivorReplay,saved:()=>saved};}
const {r,saved}=setup();const day='2026-10-12T23:59:59Z',seed=r.seedFor('sorceress',1,day);
assert.equal(seed,r.seedFor('sorceress',1,'2026-10-13T01:59:59+02:00'));assert.notEqual(seed,r.seedFor('sorceress',1,'2026-10-13'));assert.notEqual(seed,r.seedFor('paladin',1,day));assert.notEqual(seed,r.seedFor('sorceress',2,day));assert.throws(()=>r.seedFor('x',0));assert.throws(()=>r.seedFor('x',1,'invalid'));
assert.equal(r.start('paladin',1).seed,null);r.setMode('daily');assert.equal(r.start('sorceress',1,{date:day}).seed,seed);
const snapshot={result:'dead',time:123,level:7,heat:{density:2,bad:Infinity},email:'private',outgoing:{effective:123}};
assert.ok(r.finish(snapshot));assert.equal(r.finish(snapshot),null);assert.equal(r.entries().length,1);assert.equal(r.entries()[0].email,undefined);assert.equal(r.entries()[0].heat.bad,undefined);assert.ok(r.format(r.entries()[0]).includes('2:03'));
for(let i=0;i<25;i++){r.start('paladin',1,{date:'2026-10-12'});r.finish({...snapshot,time:i});}assert.equal(r.entries().length,10);assert.equal(setup(saved()).r.entries().length,10);
const copy=r.entries();copy[0].heat.density=99;assert.equal(r.entries()[0].heat.density,2);
r.setMode('normal');assert.ok(r.replayLatest());assert.ok(r.start('paladin',1).seed);assert.equal(r.start('paladin',1).seed,null);
assert.equal(setup('{bad').r.entries().length,0);assert.equal(setup('{}').r.entries().length,0);assert.equal(setup(' '.repeat(50001)).r.entries().length,0);assert.equal(setup('[{"classId":"x"}]').r.entries().length,0);
const fallback=setup(null,true).r;fallback.start('paladin',1);assert.ok(fallback.finish(snapshot));assert.equal(fallback.entries().length,1);assert.equal(fallback.finish(snapshot),null);
assert.equal(r.finish({result:'win',time:NaN,level:1}),null);assert.ok(r.finish({...snapshot,result:'win'}));
console.log('PASS replay: UTC seeds, class/act separation, bounded history, idempotence, safe JSON and storage fallback');
