'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function load(){const context={window:{},MINUTE_SCALING:[1,2,6],Game:{minute:2},enemies:[],Player:{x:0,y:0,r:8,takeDamage(n){this.hit=n;}},CAM:{zoom:1}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/survivors/act-waves.js'),'utf8'),context);return {api:context.window.SurvivorActWaves,context};}
test('all autonomous act themes stay isolated and restart with light populations',()=>{
 const {api}=load();for(let i=0;i<5;i++){assert.equal(api.config(i,0).types.length,1);assert.deepEqual(Array.from(api.config(i,120).types),Array.from(api.themes[i].types));}
});
test('combat growth continues beyond final boss without increasing motion or density indefinitely',()=>{
 const {api}=load();let last=api.factors(0);for(const t of [120,360,600,3600,86400,31536000]){const next=api.factors(t);assert.ok(next.hp>last.hp&&next.damage>last.damage);assert.ok(Number.isFinite(next.hp)&&Number.isFinite(next.damage));assert.ok(next.speed<1.3);assert.ok(api.config(4,t).rate<=4.8);last=next;}
});
test('legacy campaign scaling is removed while heat and elite factors remain exactly once',()=>{
 const {api}=load(),e={hpMax:600,hp:300,dmg:24,speed:60,type:'undeadKnight',elite:true};api.scaleEnemy(e,0,4);assert.equal(e.hpMax,100);assert.equal(e.hp,50);assert.equal(e.dmg,24);api.scaleEnemy(e,600,4);assert.equal(e.hpMax,100);api.refresh(e,600);assert.equal(e.dmg,24*api.factors(600).damage);assert.equal(e.hp,50);
});
test('boss spawn health snapshots remain unchanged during live damage escalation',()=>{
 const {api}=load(),boss={boss:true,hpMax:1000,hp:1000,dmg:40,speed:25};api.scaleEnemy(boss,360,4);const hp=boss.hpMax;api.refresh(boss,1200);assert.equal(boss.hpMax,hp);assert.ok(boss.dmg>40*api.factors(360).damage);
});
test('frost impact warns for a full second, has fixed position, and can be dodged',()=>{
 const {api,context}=load();context.window.SurvivorRuntime={now:3,enemySlowUntil:0};const e={type:'wraith',hpMax:28,hp:28,dmg:11,speed:45,x:50,y:0};api.scaleEnemy(e,0,4);context.enemies.push(e);api.update(.1,3);assert.equal(e.ssFrostWarn.until,4);api.update(.1,3.9);assert.equal(context.Player.hit,undefined);context.Player.x=100;api.update(.1,4);assert.equal(context.Player.hit,undefined);context.Player.x=0;api.update(.1,8);context.window.SurvivorRuntime.now=9;api.update(.1,9);assert.ok(context.Player.hit>0);assert.equal(context.window.SurvivorRuntime.enemySlowUntil,10.2);
});
