/* Standalone combat rules. Loaded after the legacy engine; no legacy file rewrite. */
'use strict';
window.SurvivorRuntime = (() => {
  const C = SurvivorCatalogue;
  const gemTypes = new Set(['small', 'mid', 'big', 'giant']);
  const R = {
    now: 0, hazards: [], enemySlowUntil: 0, bullets: [], fields: [], allies: [], corpses: [], fx: [], jobs: [],
    pendingLevels: 0, talentPoints: 0, talents: new Set(), ultimate: null,
    pendingChests: 0, spectralAt: 8, serial: 0, lastMotion: {x: 1, y: 0},
    cooldowns: {}, hits: {}, casts: {}, venomUntil: 0, frenzyUntil: 0,
    shieldHP: 0, shieldUntil: 0, healBudget: 0, healSecond: -1,
    reset() {
      this.playerPoisonUntil=0;this.playerPoisonNext=0;this.hazards=[];this.enemySlowUntil=0;this.now=0; this.bullets=[]; this.fields=[]; this.allies=[]; this.corpses=[];
      this.fx=[]; this.jobs=[]; this.pendingLevels=0; this.pendingChests=0;
      this.talentPoints=0; this.talents=new Set(); this.ultimate=null; this.deferredTalents=false; this.talentResume="playing";
      this.pendingBindings=[];this.aimPoint=null;this.damageBySkill={};this.basicCD=0;this.manaWaits=0;this.castCursor=0;this.serial=0; this.spectralAt=8; this.cooldowns={}; this.hits={}; this.casts={};
      this.venomUntil=0; this.frenzyUntil=0; this.shieldHP=0; this.shieldUntil=0;
      this.healBudget=0; this.healSecond=-1; this.lastMotion={x:1,y:0};
    },
    owned() { return [...Player.skills, ...Object.values(Player.weapons)]; },
    state(id) { return Player.weapons[id] || Player.skills.find(w=>w.id===id); },
    passive(id) { return Player.passives[id] || 0; },
    modifiers(id) {
      const m={};
      for (const branch of C.trees[Player.classId] || []) {
        if (!branch.skills.includes(id)) continue;
        for (const node of branch.nodes) {
          if (!this.talents.has(node.id)) continue;
          for (const [key,value] of Object.entries(node.mods)) {
            if (typeof value==='number') m[key]=(m[key]||0)+value;
            else m[key]=value;
          }
        }
      }
      return m;
    },
    stats(w) {
      const d=C.spells[w.id], level=Math.min(8,1+((w.level||1)-1)*7/4), common=d.group==='common', m=this.modifiers(w.id);
      const rankDamage=common ? (level>=2?.15:0)+(level>=5?.2:0)+(level>=8?.25:0) : .15*Math.floor(level/2);
      const attributes=SurvivorStats.get();
      const baseBonus=(CLASSES[Player.classId].dmgMul||1)-1;
      const synergy=(C.synergies||[]).filter(link=>link.to===w.id).reduce((sum,link)=>sum+(this.state(link.from)?.level||0)*link.perRank,0);
      const bonus=synergy+rankDamage+attributes.power+(m.damage||0)+attributes[SurvivorStats.category(d)];
      const arrowWeapon=['bow','crossbow'].includes(d.weaponKind)||d.group==='amazon'&&['fan','homing'].includes(d.mode);
      const amount=arrowWeapon?(this.passive('amount')>=2?1:0)+(this.passive('amount')>=5?1:0):0;
      let count=d.count, pierce=0, jumps=d.id==='common_storm'?3:4;
      if (common) {
        if (['knives','axes','embers','blades','flasks','skulls','comets'].some(k=>d.id==='common_'+k)) {
          if(level>=3) count++;
          if(level>=6 && !['knives','embers','flasks','comets'].some(k=>d.id==='common_'+k)) count++;
        }
        if(d.id==='common_frost' && level>=3)count+=2;
        if(d.id==='common_knives' && level>=6)pierce+=2;
        if(d.id==='common_frost' && level>=6)pierce++;
        if(d.id==='common_storm')jumps+=(level>=3?1:0)+(level>=6?1:0);
      } else if(['fan','projectile','frost','spear','homing','hammer'].includes(d.mode)) {
        count+=(level>=3?1:0);
      }
      if(!['aura','orbit','companion','shield','venom','curse','whirl','hurricane','nova','cry','corpse'].includes(d.mode))count+=amount;
      count+=m.count||0;
      if(d.mode==='spear')pierce+=2;
      if(d.mode==='tornado')pierce+=2;
      pierce+=m.pierce||0;
      const reachBonus=level>=7&&(common||!d.duration)?.2:0;
      let duration=d.duration*(1+this.passive('duration')*.1+(!common&&level>=7?.2:0))+(m.duration||0);
      if(d.id==='common_flasks'&&level>=6)duration++;
      if(d.mode==='curse')duration+=(m.curseDuration||0);
      const cdr=Math.min(.5,attributes.cdr+(m.cdr||0)+(common&&level>=4?.1:0)+(!common&&level>=5?.1:0));
      const s={...d,mods:m,level,dmg:d.dmg*(1+bonus),count:Math.min(12,count),pierce:Math.min(8,pierce),
        jumps:Math.min(8,jumps+(m.jumps||0)),radius:d.radius*(1+this.passive('area')*.04+(m.radius||0)+reachBonus),
        duration,cd:d.cd*(1-cdr)/(SurvivorStats.usesAttackSpeed(d)?Math.max(.5,1+attributes.attackSpeed):1),speed:360*(1+(arrowWeapon?this.passive('amount')*.1:0)),crit:Math.min(.75,attributes.crit+(m.crit||0)),critDamage:attributes.critDamage,
        ricochet:(m.ricochet||0)+(d.id==='amazon_guided'&&m.special==='guidedRain'?1:0),targets:m.targets||0,slow:m.slow||0,evolved:!!w.evolved,bolts:4+(m.bolts||0)+amount};
      if(d.mode==='companion') {
        s.count=d.count;
        if(['necromancer_skeletons','druid_wolves'].includes(d.id))s.count+=(level>=3?1:0)+(level>=7?1:0)+(m.allies||0);
        s.allyHP=(d.id==='druid_grizzly'?180:d.id==='amazon_valkyrie'?140:70)*(1+.12*(level-1)+(m.allyHP||0));
      }
      if(common&&d.mode==='weapon') {
        s.count=d.count+amount+(d.weaponKind==='dagger'&&level>=5?1:0);
        s.pierce=d.weaponKind==='crossbow'?2+(level>=6?1:0):d.weaponKind==='axe'?2:0;
        s.ricochet=d.weaponKind==='sling'?1+(level>=6?1:0):0;
        if(w.evolved){s.dmg*=1.35;s.radius*=1.15;s.cd*=.85;if(!['axe','sling'].includes(d.weaponKind))s.count++;if(d.weaponKind==='sling')s.ricochet+=2;}
      }
      if(w.evolved&&!common){s.dmg*=1.5;s.radius*=1.25;s.cd*=.8;if(s.allyHP)s.allyHP*=1.5;}
      return s;
    },
    context(s, extra={}) { return {id:s.id,s,secondary:false,periodic:false,ally:false,...extra}; },
    alive() { return enemies.filter(e=>!e.dead); },
    targetRange() { return Math.min(480,Math.max(240,Math.min(VW,VH)*.5/CAM.zoom+80)); },
    nearest(x=Player.x,y=Player.y,range=this.targetRange(),exclude=new Set(),priority=false) {
      let best=null,score=Infinity;
      for(const e of enemies) {
        if(e.dead||exclude.has(e))continue;
        const d=dist2(x,y,e.x,e.y); if(d>range*range)continue;
        const v=d*(priority&&(e.boss||e.elite)?.25:1);
        if(v<score){best=e;score=v;}
      }return best;
    },
    cluster(range=this.targetRange()) {
      const live=this.alive().filter(e=>dist2(e.x,e.y,Player.x,Player.y)<range*range);
      if(!live.length)return null;
      let best=live[0],n=-1;
      for(const e of live.slice(0,60)) {
        const count=live.reduce((v,a)=>v+(dist2(a.x,a.y,e.x,e.y)<90*90?1:0),0);
        if(count>n){best=e;n=count;}
      }return {x:best.x,y:best.y};
    },
    gate(key, interval) {
      if((this.cooldowns[key]||0)>this.now)return false;
      this.cooldowns[key]=this.now+interval;return true;
    },
    schedule(delay, fn) { if(this.jobs.length<200)this.jobs.push({at:this.now+delay,fn}); },
    effect(x,y,r,color,life=.25,kind='ring') {
      if(this.fx.length>200)this.fx.shift();
      this.fx.push({x,y,r,color,life,maxLife:life,kind});
    },
    tick(dt) {
      this.now+=dt;
      this.basicAttack(dt);
      const ix=(Keys.right?1:0)-(Keys.left?1:0),iy=(Keys.down?1:0)-(Keys.up?1:0);
      if(ix||iy){const len=Math.hypot(ix,iy);this.lastMotion={x:ix/len,y:iy/len};}
      SurvivorBosses.updateHazards(dt,this);this.recalcSpeed();
      for(let i=this.jobs.length-1;i>=0;i--)if(this.jobs[i].at<=this.now){const job=this.jobs.splice(i,1)[0];job.fn();}
      for(const w of this.owned()) {
        const s=this.stats(w),activation=SurvivorStats.activation(s);w.cd=Math.max(0,(w.cd||0)-dt);
        if(activation==='active')continue;
        if(activation==='aura'){
          if(!w.enabled)continue;const drain=SurvivorStats.manaDrain(s)*dt;
          if(Player.mana<drain){this.stopAura(w);continue;}Player.mana-=drain;
          if(s.mode==='hurricane'){if(!this.fields.some(f=>f.ctx.id===w.id&&f.follow))this.cast(w,s);for(const f of this.fields)if(f.ctx.id===w.id&&f.follow)f.until=this.now+1;}
          else if(w.cd<=0){this.cast(w,s);w.cd=s.cd;}continue;
        }
        if(s.mode==='companion'){this.companionTick(w,s);continue;}
        if(s.mode==='orbit'||s.weaponKind==='flail'){this.orbit(w,s,dt);continue;}
        if(w.cd>0)continue;
        if(!['venom'].includes(s.mode)&&!this.nearest())continue;
        if(s.mode==='melee'||s.mode==='frenzy'||s.mode==='weapon'&&s.attackType==='melee'){if(!this.nearest(Player.x,Player.y,s.radius+24))continue;}
        if(s.mode==='corpse'&&!this.bestCorpse())continue;
        this.cast(w,s);w.cd=s.cd;
      }
      this.updateAllies(dt);
      this.corpses=this.corpses.filter(c=>c.until>this.now).slice(-20);
      const boss=this.alive().find(e=>e.boss);
      if(boss&&!this.alive().some(e=>!e.boss)&&!this.corpses.length&&this.now>=this.spectralAt){
        this.corpses.push({x:boss.x+25,y:boss.y+15,until:this.now+8});this.spectralAt=this.now+8;
      }
      if(this.shieldUntil<this.now)this.shieldHP=0;
      for(let i=this.fx.length-1;i>=0;i--){this.fx[i].life-=dt;if(this.fx[i].life<=0)this.fx.splice(i,1);}
    },
    stopAura(w){w.enabled=false;this.fields=this.fields.filter(f=>f.ctx.id!==w.id);},
    activate(index,point=this.aimPoint){
      if(Game.state!=='playing')return false;if(this.autoAim)point=null;const w=Player.skills[index];if(!w)return false;
      const s=this.stats(w),activation=SurvivorStats.activation(s);
      if(activation==='passive')return false;
      if(activation==='aura'&&w.enabled){this.stopAura(w);return true;}
      if(w.cd>0)return false;
      if(s.mode==='corpse'&&!(point?this.corpses.some(c=>dist2(c.x,c.y,point.x,point.y)<150**2):this.bestCorpse())){toast('Aucun cadavre à faire exploser');return false;}
      const cost=SurvivorStats.manaCost(s);if(Player.mana<cost){this.manaWaits++;toast('Mana insuffisant');return false;}
      Player.mana-=cost;
      if(activation==='aura'){w.enabled=true;return true;}
      this.cast(w,s,false,Player,point);w.cd=s.cd;return true;
    },
    basicAttack(dt){
      this.basicCD=Math.max(0,(this.basicCD||0)-dt);if(this.basicCD>0)return;
      const melee=['paladin','barbarian','assassin'].includes(Player.classId),target=this.nearest(Player.x,Player.y,melee?65:300);if(!target)return;
      const a=SurvivorStats.get(),s={id:'basic_'+Player.classId,basic:true,mode:'projectile',element:'physical',mods:{},dmg:(melee?7:5)*(1+a.power+(melee?a.melee:a.ranged)),crit:a.crit,critDamage:a.critDamage,pierce:0,speed:330};
      Player.attackAnimT=.12;this.basicCD=1.35/Math.max(.5,1+a.attackSpeed);
      if(melee){this.damage(target,s.dmg,this.context(s));this.effect(target.x,target.y,12,'#cfc3a6',.15,'slash');}
      else this.bullet(s,Player.x,Player.y,angleTo(Player.x,Player.y,target.x,target.y),this.context(s),{mode:'projectile',life:1.4});
    },
    recalcSpeed() {
      const whirl=this.fields.some(f=>f.ctx.id==='barbarian_whirl'&&f.until>this.now);
      const m=this.modifiers('barbarian_whirl');
      Player.speed=(this.enemySlowUntil>this.now?.6:1)*105*CLASSES[Player.classId].speedMul*metaBonus('swift')*(1+this.passive('speed')*.04+(window.SurvivorEquipment?.totals(Player.classId).moveSpeed||0)+(this.frenzyUntil>this.now?.15:0)+(whirl?(m.move||0):0));
    },
    bullet(s, x,y,a, ctx=this.context(s), extra={}) {
      if(this.bullets.length>=350)return;
      this.bullets.push({x,y,startX:x,startY:y,angle:a,age:0,life:1.8*(s.level>=7?1.2:1),speed:s.speed||360,dmg:s.dmg,
        r:5,hitSet:new Set(),pierce:s.pierce,ctx,mode:s.mode,color:this.color(s.element),
        ricochet:s.ricochet,target:null,homing:s.mode==='homing',...extra});
    },
    color(element) { return {physical:'#e6cfa0',fire:'#f59347',cold:'#80d6f4',lightning:'#c6adff',poison:'#8ec567',magic:'#d9a5ff'}[element]||'#e6cfa0'; },
    field(s,x,y,ctx=this.context(s),extra={}) {
      if(this.fields.length>=100)return;
      const life=s.duration||.15;
      this.fields.push({x,y,r:s.radius,until:this.now+life,start:this.now,next:this.now,interval:.5,dmg:s.dmg,
        color:this.color(s.element),ctx,follow:false,once:!s.duration,hitSet:new Set(),...extra});
    },
    burst(s,x,y,extra={}) { this.field(s,x,y,this.context(s,extra),{once:true,until:this.now+.15}); },
    cast(w,s,secondary=false, origin=Player,aim=null) {
      const ctx=this.context(s,{secondary}),nearest=aim?this.nearest(aim.x,aim.y,150):this.nearest(origin.x,origin.y,this.targetRange(),new Set(),s.id==='amazon_guided'),target=aim?{x:aim.x,y:aim.y}:nearest;
      const a=target?angleTo(origin.x,origin.y,target.x,target.y):0;
      if(!secondary)this.casts[w.id]=(this.casts[w.id]||0)+1;
      Player.attackAnimT=.18;
      const center=aim||this.cluster();
      if(s.group!=='common'&&!['projectile','fan','spear','fireball','tornado','plague','javelin','orb','homing','turret'].includes(s.mode)){const point=['curse','corpse'].includes(s.mode)?center||origin:origin;this.fx.push({kind:'spell',spellId:s.id,x:point.x,y:point.y,r:24,color:this.color(s.element),life:.4,maxLife:.4});}
      if(s.mode==='weapon'){this.castWeapon(w,s,origin,target,a);return;}
      switch(s.mode) {
        case 'projectile':case 'fan':case 'spear':case 'frost':case 'homing':case 'fireball':case 'plague':case 'javelin':case 'tornado': {
          let count=s.count;
          if(s.mods.special==='trident'&&!secondary)count=Math.min(12,count+2);
          for(let i=0;i<count;i++) {
            const fan=s.mode==='fan'||s.mode==='frost',offset=(i-(count-1)/2)*(fan?.17:.09);
            let direction=a+offset;
            if(s.id==='common_frost'&&s.evolved)direction=i*TAU/count;
            const boneExtra=s.mods.special==='trident'&&i>=count-2;
            const uniqueTarget=s.id==='common_skulls'?this.alive().sort((x,y)=>dist2(x.x,x.y,origin.x,origin.y)-dist2(y.x,y.y,origin.x,origin.y))[i%Math.max(1,this.alive().length)]:(s.mode==='homing'&&aim?nearest:target);
            this.bullet(s,origin.x,origin.y,direction,ctx,{dmg:s.dmg*(boneExtra?.6:1),homing:s.mode==='homing'||(s.id==='common_knives'&&s.evolved),target:uniqueTarget,
              freeze:s.mode==='frost'&&s.evolved||s.mods.freeze,burn:(s.id==='common_embers'&&s.level>=6)||s.mods.burn,
              pierce:s.mode==='plague'?Math.max(2,s.pierce):s.pierce+(s.id==='common_skulls'&&s.evolved?1:0)});
          }
          if(s.mods.special==='guidedRain'&&!secondary&&this.casts[w.id]%3===0) {
            for(let i=0;i<3;i++)this.bullet({...s,mode:'homing'},origin.x,origin.y,a+(i-1)*.25,this.context(s,{secondary:true}),{dmg:s.dmg*.6,homing:true});
          }
          if(s.mods.special==='brood'&&!secondary&&this.casts[w.id]%4===0) {
            const hd=this.state('sorceress_hydra');
            const hs=hd?this.stats(hd):{...C.spells.sorceress_hydra,mods:{},count:1,dmg:s.dmg*.5,duration:2};
            this.turret({...hs,duration:2},origin.x+35,origin.y+15);
          }
          break;
        }
        case 'axe': {
          for(let i=0;i<s.count;i++)this.bullet(s,origin.x,origin.y,a+(i-(s.count-1)/2)*.24,ctx,{speed:210,life:s.evolved?2:1.1,mode:'axe',returning:false,pierce:s.evolved?8:0});break;
        }
        case 'chain': {
          const count=s.evolved?2+((this.passive('amount')>=2?1:0)+(this.passive('amount')>=5?1:0)):s.count;
          const starts=new Set();
          for(let i=0;i<count;i++) {
            const first=this.nearest(aim?.x??origin.x,aim?.y??origin.y,aim?150:600,starts);if(!first)break;starts.add(first);
            this.chain(s,origin.x,origin.y,s.jumps,ctx,new Set(),first);
          }break;
        }
        case 'pool':case 'fissure':case 'blizzard': {
          if(!center)break;
          for(let i=0;i<s.count;i++)this.field(s,center.x+(i?Math.cos(i*2.4)*45:0),center.y+(i?Math.sin(i*2.4)*45:0),ctx,{slow:s.mode==='blizzard'?.3:0,grow:s.id==='common_flasks'&&s.evolved});break;
        }
        case 'aura': {
          this.burst(s,origin.x,origin.y,{periodic:true});break;
        }
        case 'meteor': {
          if(!center)break;
          for(let i=0;i<s.count+(s.evolved?1:0);i++) {
            const moving=Keys.right||Keys.left||Keys.up||Keys.down;
            const point=s.evolved&&moving&&i===s.count?{x:Player.x+this.lastMotion.x*95,y:Player.y+this.lastMotion.y*95}:{x:center.x+(i?Math.cos(i*2.4)*36:0),y:center.y+(i?Math.sin(i*2.4)*36:0)};
            this.effect(point.x,point.y,s.radius,'#edb273',.55,'warning');
            this.schedule(.55,()=>{this.burst(s,point.x,point.y,{secondary});if(s.level>=6||s.evolved)this.field({...s,duration:2,dmg:s.dmg*.15},point.x,point.y,this.context(s,{secondary:true,periodic:true}));});
          }break;
        }
        case 'orb': {
          for(let i=0;i<s.count;i++)this.bullet(s,origin.x,origin.y,a+(i-(s.count-1)/2)*.2,ctx,{mode:'orb',speed:130,life:1.8,pierce:8,emit:0});break;
        }
        case 'nova': {
          this.burst(s,origin.x,origin.y,{periodic:true});break;
        }
        case 'corpse': {
          const corpse=aim?this.corpses.filter(c=>dist2(c.x,c.y,aim.x,aim.y)<150**2).sort((a,b)=>dist2(a.x,a.y,aim.x,aim.y)-dist2(b.x,b.y,aim.x,aim.y))[0]:this.bestCorpse();if(!corpse)return;
          this.corpses.splice(this.corpses.indexOf(corpse),1);this.burst(s,corpse.x,corpse.y,{secondary});break;
        }
        case 'curse': {
          if(!center)break;
          this.effect(center.x,center.y,s.radius,'#ca89e2',.6);
          for(const e of this.alive())if(dist2(e.x,e.y,center.x,center.y)<s.radius*s.radius){e.cursedUntil=this.now+s.duration;e.curseBonus=s.evolved?.4:.25;}
          break;
        }
        case 'melee':case 'frenzy': {
          const nearby=this.alive().filter(e=>dist2(e.x,e.y,origin.x,origin.y)<(s.radius+e.r)**2&&Math.abs(angleDiff(angleTo(origin.x,origin.y,e.x,e.y),a))<.85);
          if(!nearby.length)return;
          this.effect(origin.x+Math.cos(a)*s.radius*.45,origin.y+Math.sin(a)*s.radius*.45,s.radius*.55,this.color(s.element),.18,'slash');
          for(let i=0;i<s.count;i++)this.schedule(i*.09,()=>{const focus=this.nearest(origin.x,origin.y,s.radius+32),aim=focus?angleTo(origin.x,origin.y,focus.x,focus.y):a;const live=this.alive().filter(e=>dist2(e.x,e.y,origin.x,origin.y)<(s.radius+e.r)**2&&Math.abs(angleDiff(angleTo(origin.x,origin.y,e.x,e.y),aim))<.85);for(const e of live.slice(0,1+s.targets+(s.id==='barbarian_swing'?1:0)))this.damage(e,s.dmg,ctx);});
          if(s.mode==='frenzy')this.frenzyUntil=this.now+s.duration;break;
        }
        case 'hammer': {
          for(let i=0;i<s.count;i++)this.bullet(s,origin.x,origin.y,i*TAU/s.count,ctx,{mode:'hammer',life:2,pierce:8,anchor:origin});break;
        }
        case 'heavens': {
          if(!nearest)return;const target=nearest;
          this.effect(target.x,target.y,30,'#ebdc93',.4);this.damage(target,s.dmg,ctx);
          this.chain(s,target.x,target.y,2+(s.mods.count||0),this.context(s,{secondary:true}),new Set([target]),null,.5);break;
        }
        case 'shield': {
          this.shieldHP=Player.hpMax*.15*(1+.15*Math.floor(s.level/2)+(s.mods.shield||0))*(s.evolved?1.5:1);
          this.shieldUntil=this.now+Math.max(s.duration,s.cd);this.effect(Player.x,Player.y,30,'#edd89d',.5);break;
        }
        case 'whirl':case 'hurricane': {
          this.field(s,origin.x,origin.y,ctx,{follow:true,slow:s.mode==='hurricane'?.3:0});break;
        }
        case 'cry': {
          this.burst(s,origin.x,origin.y,{secondary});
          for(const e of this.alive())if(dist2(e.x,e.y,origin.x,origin.y)<s.radius*s.radius)this.control(e,'stun',.5+(s.mods.stun||0));break;
        }
        case 'turret': {
          const pos=center||{x:Player.x+35,y:Player.y+15};
          const d=Math.hypot(pos.x-Player.x,pos.y-Player.y)||1;
          const world=currentMapWorld();const reach=Math.min(240,d);this.turret(s,clamp(Player.x+(pos.x-Player.x)/d*reach,20,(world?.w||2048)-20),clamp(Player.y+(pos.y-Player.y)/d*reach,20,(world?.h||2048)-20));break;
        }
        case 'venom':this.venomUntil=this.now+s.duration;break;
      }
      if(!secondary&&['doubleStorm','doubleJudgment'].includes(s.mods.special)&&(s.mods.special==='doubleStorm'||this.casts[w.id]%4===0)) {
        this.schedule(.3,()=>this.cast(w,{...s,dmg:s.dmg*(s.mods.special==='doubleStorm'?.6:.5)},true,origin));
      }
    },
    bestCorpse() {
      let best=null,score=-1;
      for(const corpse of this.corpses) {
        if(dist2(corpse.x,corpse.y,Player.x,Player.y)>650**2)continue;
        const n=this.alive().reduce((a,e)=>a+(dist2(corpse.x,corpse.y,e.x,e.y)<120**2?1:0),0);
        if(n>score){score=n;best=corpse;}
      }return score>0?best:null;
    },
    chain(s,x,y,n,ctx,exclude=new Set(),first=null,factor=1) {
      for(let i=0;i<Math.min(8,n);i++) {
        const e=i===0&&first?first:this.nearest(x,y,i===0?600:s.radius,exclude);
        if(!e||exclude.has(e))break;exclude.add(e);
        lightning.push({x1:x,y1:y,x2:e.x,y2:e.y,life:.15});
        this.damage(e,s.dmg*factor,ctx);x=e.x;y=e.y;
      }
    },
    castWeapon(w,s,origin,target,a){
      const ctx=this.context(s),kind=s.weaponKind;
      if(s.attackType==='ranged'){
        const candidates=this.alive().sort((x,y)=>dist2(x.x,x.y,origin.x,origin.y)-dist2(y.x,y.y,origin.x,origin.y));
        for(let i=0;i<s.count;i++){const t=candidates[i%candidates.length];if(!t)break;const angle=angleTo(origin.x,origin.y,t.x,t.y);
          this.bullet(s,origin.x,origin.y,angle,ctx,{mode:kind==='axe'?'axe':'weapon',weaponKind:kind,speed:(kind==='crossbow'?520:kind==='bow'?440:kind==='sling'?300:360)*(s.speed/360),life:1.5,ricochet:s.ricochet,homing:false});}
        return;
      }
      if(!target)return;
      for(let i=0;i<s.count;i++)this.schedule(i*.18,()=>{
        const focus=this.nearest(origin.x,origin.y,s.radius+20);if(!focus)return;const aim=angleTo(origin.x,origin.y,focus.x,focus.y);
        const hits=this.alive().filter(e=>{const dx=e.x-origin.x,dy=e.y-origin.y,forward=dx*Math.cos(aim)+dy*Math.sin(aim),side=Math.abs(-dx*Math.sin(aim)+dy*Math.cos(aim));
          return kind==='spear'?forward>=-e.r&&forward<s.radius+e.r&&side<12+e.r:dist2(e.x,e.y,origin.x,origin.y)<(s.radius+e.r)**2&&(kind==='scythe'||Math.abs(angleDiff(angleTo(origin.x,origin.y,e.x,e.y),aim))<1.1);
        }).slice(0,kind==='sword'?3:kind==='mace'?2:6);
        for(const e of hits){this.damage(e,s.dmg,ctx);if(kind==='mace')this.control(e,'stun',.35);}
        const fx={kind:'weapon',weaponKind:kind,x:origin.x+Math.cos(aim)*s.radius*.55,y:origin.y+Math.sin(aim)*s.radius*.55,angle:aim,r:s.radius,color:'#d7c5a8',life:.25,maxLife:.25};this.fx.push(fx);
      });
    },
    orbit(w,s,dt) {
      w.orbitAngle=(w.orbitAngle||0)+dt*2.5;
      const radius=s.radius*(s.evolved?1.2:1);
      for(let i=0;i<s.count;i++) {
        const a=w.orbitAngle+i*TAU/s.count,x=Player.x+Math.cos(a)*radius,y=Player.y+Math.sin(a)*radius;
        for(const e of this.alive())if(dist2(e.x,e.y,x,y)<(e.r+8)**2){
          e.ssOrbit=e.ssOrbit||{};
          if((e.ssOrbit[w.id]||0)<=this.now){e.ssOrbit[w.id]=this.now+s.cd;this.damage(e,s.dmg,this.context(s));}
        }
        if(s.evolved&&s.mode!=='weapon'&&this.gate('interceptCheck',.01)) {
          const hostile=this.bullets.find(p=>p.hostile&&dist2(p.x,p.y,x,y)<18**2);
          if(hostile&&this.gate('intercept',.5)){hostile.life=0;this.effect(x,y,16,'#d4d6e6',.2);}
        }
      }
    },
    updateBullets(dt) {
      for(let i=this.bullets.length-1;i>=0;i--) {
        const p=this.bullets[i],s=p.ctx&&p.ctx.s;
        const previousX=p.x,previousY=p.y;
        p.age+=dt;p.life-=dt;
        if(p.mode==='hammer') {
          const a=p.angle+p.age*5,r=18+p.age*65;p.x=p.anchor.x+Math.cos(a)*r;p.y=p.anchor.y+Math.sin(a)*r;
        }else {
          if(p.homing) {
            if(!p.target||p.target.dead||p.hitSet.has(p.target))p.target=this.nearest(p.x,p.y,650,p.hitSet,p.ctx.id==='amazon_guided');
            if(p.target)p.angle=angleTo(p.x,p.y,p.target.x,p.target.y);
          }
          if(p.mode==='axe'&&(s.evolved||s.weaponKind==='axe')&&p.age>.7) {
            if(!p.returning){p.returning=true;if(s.evolved)p.hitSet.clear();}
            p.angle=angleTo(p.x,p.y,Player.x,Player.y);if(p.age>.9&&dist2(p.x,p.y,Player.x,Player.y)<12**2)p.life=0;
          }
          const wobble=p.mode==='tornado'?Math.sin(p.age*8)*.45:0;
          p.x+=Math.cos(p.angle+wobble)*p.speed*dt;p.y+=Math.sin(p.angle+wobble)*p.speed*dt;
        }
        if(p.mode==='orb') {
          p.emit-=dt;
          if(p.emit<=0){p.emit=.3;for(let j=0;j<2;j++)this.bullet({...s,mode:'frost'},p.x,p.y,p.age*5+j*Math.PI,this.context(s,{secondary:true}),{mode:'frost',speed:240,life:.65,dmg:s.dmg,freeze:s.mods.freeze});}
        }
        const hits=(x,y,r)=>{const dx=p.x-previousX,dy=p.y-previousY,l=dx*dx+dy*dy;const t=l?Math.max(0,Math.min(1,((x-previousX)*dx+(y-previousY)*dy)/l)):0;return dist2(previousX+t*dx,previousY+t*dy,x,y)<=r*r;};
        if(p.hostile&&p.life>0) {
          if(hits(Player.x,Player.y,Player.r+p.r)){Player.takeDamage(p.dmg);p.life=0;}
        }else if(p.life>0) {
          if(s.mode!=='weapon'&&s.id==='common_skulls'&&s.evolved) {
            for(let k=pickups.length-1;k>=0;k--){const item=pickups[k];if(gemTypes.has(item.type)&&dist2(p.x,p.y,item.x,item.y)<18**2){collectPickup(item);pickups.splice(k,1);}}
          }
          for(const e of enemies) {
            if(e.dead||p.hitSet.has(e)||!hits(e.x,e.y,p.r+e.r))continue;
            p.hitSet.add(e);
            const impactCtx={...p.ctx,freeze:!!p.freeze};
            this.damage(e,p.dmg,impactCtx);
            if(['frost','orb'].includes(p.mode))this.control(e,'slow',2,.3);
            if(p.burn)this.dot(e,'burn',p.ctx.id,p.dmg*(typeof p.burn==='number'?p.burn:.2),2,p.ctx);
            if(p.mode==='axe'&&s.mode!=='weapon')this.burst({...s,dmg:p.dmg},p.x,p.y,{secondary:true,exclude:e});
            if(p.mode==='fireball') {
              this.burst({...s,dmg:p.dmg*.6},p.x,p.y,{secondary:true,exclude:e,maxTargets:5});
              if(s.evolved)this.field({...s,duration:2,dmg:p.dmg*.15},p.x,p.y,this.context(s,{secondary:true,periodic:true}));
            }
            if(p.mode==='plague') {
              this.field({...s,dmg:s.dmg*.5},p.x,p.y,this.context(s,{secondary:true,periodic:true}));
              if(s.mods.special==='toxicStorm')this.chain(s,p.x,p.y,1,this.context(s,{secondary:true}),new Set([e]),null,.5);
            }
            if(p.mode==='javelin') {
              const neighbors=this.alive().filter(a=>a!==e&&dist2(a.x,a.y,p.x,p.y)<s.radius**2).slice(0,Math.min(12,s.bolts));
              for(const t of neighbors)this.bullet({...s,mode:'projectile'},p.x,p.y,angleTo(p.x,p.y,t.x,t.y),this.context(s,{secondary:true}),{mode:'projectile',dmg:s.dmg*.6,speed:450,life:1});
              if(s.mods.special==='toxicStorm')this.dot(e,'poison',s.id,s.dmg*.2,2,p.ctx);
            }
            if(p.ctx.id==='common_knives'&&s.evolved&&e.ssCritical)this.dot(e,'bleed',s.id,p.dmg*.2,2,p.ctx);
            if(p.ricochet>0) {
              const target=this.nearest(e.x,e.y,220,p.hitSet);if(target){p.target=target;p.angle=angleTo(e.x,e.y,target.x,target.y);p.ricochet--;continue;}
            }
            if(p.pierce>0)p.pierce--;else {p.life=0;break;}
          }
        }
        if(p.life<=0) {
          if(p.mode==='orb'&&s.mods.special==='orbBurst')for(let j=0;j<8;j++)this.bullet({...s,mode:'frost'},p.x,p.y,j*TAU/8,this.context(s,{secondary:true}),{dmg:s.dmg*.6,speed:260,life:.9});
          this.bullets.splice(i,1);
        }
      }
    },
    updateFields(dt) {
      for(let i=this.fields.length-1;i>=0;i--) {
        const f=this.fields[i],s=f.ctx.s;
        if(f.until<=this.now){this.fields.splice(i,1);continue;}
        if(f.follow){f.x=Player.x;f.y=Player.y;}
        if(f.next>this.now)continue;f.next=this.now+f.interval;
        if(f.grow)f.r=Math.min(s.radius*1.5,f.r+dt*30);
        if(!f.ctx.secondary&&s.mods.special==='livingCyclone'&&this.gate('cyclone',2)) {
          const w=this.state('druid_tornado');const ts=w?this.stats(w):{...C.spells.druid_tornado,mods:{},dmg:s.dmg*2,speed:300,pierce:4};
          const t=this.nearest();if(t)this.bullet(ts,Player.x,Player.y,angleTo(Player.x,Player.y,t.x,t.y),this.context(ts,{secondary:true}),{mode:'tornado',dmg:ts.dmg*.5});
        }
        if(!f.ctx.secondary&&s.mods.special==='steelStorm'&&this.gate('steelTrail',.5))this.field({...s,duration:1,radius:22,dmg:s.dmg*.4},Player.x,Player.y,this.context(s,{secondary:true,periodic:true}),{follow:false});
        let impacted=0;
        for(const e of enemies) {
          if(impacted>=(f.ctx.maxTargets||Infinity))break;
          if(e.dead||e===f.ctx.exclude||f.hitSet.has(e)||dist2(e.x,e.y,f.x,f.y)>(f.r+e.r)**2)continue;
          impacted++;
          e.ssZoneHits=e.ssZoneHits||{};
          if(!f.once&&(e.ssZoneHits[s.id]||0)>this.now)continue;
          e.ssZoneHits[s.id]=this.now+f.interval;
          if(s.element==='poison')this.dot(e,'poison',s.id,s.dmg,s.duration||2,f.ctx);
          else this.damage(e,f.dmg*(f.once?1:f.interval),{...f.ctx,periodic:f.ctx.periodic||!f.once});
          if(f.slow||s.slow)this.control(e,'slow',2,Math.max(f.slow||0,s.slow||0));
          if(s.id==='common_seal'&&s.level>=6)this.control(e,'slow',2,.15);
          if(f.once)f.hitSet.add(e);
        }
      }
    },
    dot(e,family,source,dps,duration,ctx) {
      if(e.dead)return;e.ssDots=e.ssDots||[];
      const current=e.ssDots.find(d=>d.family===family&&d.source===source);
      if(current){current.until=this.now+duration;current.dps=Math.max(current.dps,dps);return;}
      const same=e.ssDots.filter(d=>d.family===family&&d.until>this.now);
      if(same.length>=3){const least=same.reduce((a,b)=>a.dps<b.dps?a:b);if(least.dps>=dps)return;e.ssDots.splice(e.ssDots.indexOf(least),1);}
      e.ssDots.push({family,source,dps,until:this.now+duration,ctx:{...ctx,periodic:true}});
    },
    control(e,type,time,value=0) {
      if(e.dead)return;
      if(type==='slow'){e.ssSlow=Math.max(e.ssSlowUntil>this.now?e.ssSlow:0,Math.min(e.boss?.15:1,value));e.ssSlowUntil=this.now+time;return;}
      if(e.boss)return;
      if(type==='freeze'&&(e.ssFreezeReady||0)>this.now)return;
      e.ssStopUntil=Math.max(e.ssStopUntil||0,this.now+time*(e.elite?.5:1));
      if(type==='freeze')e.ssFreezeReady=this.now+6;
    },
    damage(e,amount,ctx={secondary:false,periodic:false}) {
      if(!e||e.dead||!Number.isFinite(amount)||amount<=0)return;
      const s=ctx.s,m=s?(s.mods||{}):{};
      let dmg=amount*(e.cursedUntil>this.now&&(!s||s.element==='physical'||s.mode==='corpse')?1+(e.curseBonus||.25)*(s?.mode==='corpse'?.5:1):1),critical=false;
      if(!ctx.periodic&&chance(s?(s.crit??.05):.05)){critical=true;dmg*=s?.critDamage||SurvivorStats.get().critDamage;}
      if(critical&&m.special==='execution'&&e.ssDots&&e.ssDots.some(d=>d.family==='poison'&&d.until>this.now))dmg*=1.3;
      if(ctx.id)this.damageBySkill[ctx.id]=(this.damageBySkill[ctx.id]||0)+Math.min(e.hp,dmg);
      e.ssCritical=critical;e.hp-=dmg;e.flash=.09;e.ssLastCtx=ctx;
      if(!ctx.periodic){spawnDamageNumber(e.x,e.y-e.r,Math.round(dmg),critical);if(this.gate('soundHit',.1))Sound.play('hit');}
      if(ctx.freeze&&(e.ssSlowUntil||0)>this.now)this.control(e,'freeze',1);
      if(s&&m.slow&&(!ctx.ally||s.id==='druid_grizzly'))this.control(e,'slow',2,m.slow);
      if(s&&!ctx.secondary&&!ctx.periodic&&!ctx.ally) {
        if(this.venomUntil>this.now&&s.element==='physical') {
          const ven=this.state('assassin_venom');if(ven){const vs=this.stats(ven);this.dot(e,'poison','assassin_venom',vs.dmg,2,this.context(vs));}
        }
        const n=this.hits[s.id]=(this.hits[s.id]||0)+1;
        if(m.healHit&&s.id==='paladin_zeal'&&n%3===0&&this.gate('zealHeal',2))Player.heal(Player.hpMax*.01);
        if(m.special==='massacre'&&n%3===0)this.burst({...s,dmg:amount*.6,radius:45},e.x,e.y,{secondary:true,exclude:e});
      }
      if(e.hp<=0){e.dead=true;killEnemy(e);}
    },
    onKill(e) {
      if(e.ssKilled)return false;e.ssKilled=true;
      this.corpses.push({x:e.x,y:e.y,until:this.now+8});this.corpses=this.corpses.slice(-20);
      const ctx=e.ssLastCtx||{};
      const seal=this.state('common_seal');
      if(seal&&seal.def.mode!=='weapon'&&seal.evolved&&dist2(e.x,e.y,Player.x,Player.y)<this.stats(seal).radius**2) {
        const second=Math.floor(this.now);if(this.healSecond!==second){this.healSecond=second;this.healBudget=0;}
        const heal=Math.min(Player.hpMax*.005,Math.max(0,Player.hpMax*.02-this.healBudget));this.healBudget+=heal;Player.heal(heal);
      }
      if(!ctx.secondary) {
        const curse=this.state('necromancer_curse'),nova=this.state('necromancer_nova');
        if(curse&&nova&&e.cursedUntil>this.now&&this.modifiers(curse.id).special==='deathCloud'&&this.gate('deathCloud',.5)) {
          const s=this.stats(nova);this.field({...s,radius:48,duration:2,dmg:s.dmg*s.duration*.2},e.x,e.y,this.context(s,{secondary:true,periodic:true}));
        }
        const flask=this.state('common_flasks');
        if(flask&&flask.evolved&&e.ssDots&&e.ssDots.some(d=>d.family==='poison'&&d.source===flask.id)) {
          const target=this.nearest(e.x,e.y,120,new Set([e]));if(target){const s=this.stats(flask);this.dot(target,'poison',flask.id,s.dmg,2,this.context(s,{secondary:true}));}
        }
        const holy=this.state('paladin_holyfire');
        if(holy&&this.modifiers(holy.id).special==='pyre'&&dist2(e.x,e.y,Player.x,Player.y)<this.stats(holy).radius**2) {
          const target=this.nearest(e.x,e.y,120,new Set([e]));if(target){const s=this.stats(holy);this.damage(target,s.dmg*.5,this.context(s,{secondary:true}));}
        }
        const fissure=this.state('druid_fissure');
        if(fissure&&this.modifiers(fissure.id).special==='eruption'&&this.fields.some(f=>f.ctx.id===fissure.id&&dist2(f.x,f.y,e.x,e.y)<f.r*f.r)&&this.gate('eruption',1)) {
          const s=this.stats(fissure);this.burst({...s,radius:45,dmg:s.dmg*s.duration*.4},e.x,e.y,{secondary:true});
        }
      }
      return true;
    },
    companionTick(w,s) {
      const count=this.allies.filter(a=>a.id===s.id&&!a.dead).length;
      if(count>=s.count||w.cd>0)return;
      const cost=SurvivorStats.manaCost(s);if(Player.mana<cost){this.manaWaits++;return;}Player.mana-=cost;
      let need=w.initialized?1:s.count-count;w.initialized=true;if(s.id==='necromancer_skeletons'){need=Math.min(need,this.corpses.length);if(!need)return;this.corpses.splice(0,need);}
      for(let i=0;i<need&&this.allies.filter(a=>!a.turret&&!a.decoy&&!a.dead).length<8;i++) {
        this.allies.push({id:s.id,x:Player.x+Math.cos(i*2.4)*30,y:Player.y+Math.sin(i*2.4)*30,
          hp:s.allyHP,hpMax:s.allyHP,cd:.2,dead:false,hits:0});
      }
      w.cd={amazon_valkyrie:8,necromancer_skeletons:4,druid_wolves:5,druid_grizzly:10,assassin_shadow:10}[s.id]||5;
    },
    turret(s,x,y) {
      const same=this.allies.filter(a=>a.id===s.id&&a.turret&&!a.dead);
      if(same.length>=2)same[0].dead=true;
      this.allies.push({id:s.id,x,y,turret:true,hp:999,hpMax:999,cd:.2,until:this.now+s.duration,s,dead:false});
    },
    updateAllies(dt) {
      for(let i=this.allies.length-1;i>=0;i--) {
        const ally=this.allies[i];
        const w=this.state(ally.id),s=w?this.stats(w):ally.s;
        if(!s){this.allies.splice(i,1);continue;}
        if(ally.hp<=0||ally.dead||ally.until&&ally.until<=this.now) {
          ally.dead=true;
          if(ally.turret&&s.mods.special==='sabotage')this.burst({...s,radius:55,dmg:s.dmg*.5},ally.x,ally.y,{secondary:true});
          this.allies.splice(i,1);continue;
        }
        if(ally.decoy)continue;
        if(!ally.turret&&s.allyHP!==ally.hpMax){const diff=s.allyHP-ally.hpMax;ally.hp=Math.max(1,ally.hp+diff);ally.hpMax=s.allyHP;}
        ally.cd-=dt;
        const target=this.nearest(ally.x,ally.y,ally.turret?s.radius:360);
        if(!ally.turret) {
          const follow=dist2(ally.x,ally.y,Player.x,Player.y)>200**2;
          const dest=follow?Player:target||Player,dx=dest.x-ally.x,dy=dest.y-ally.y,d=Math.hypot(dx,dy)||1;
          if(d>(target&&!follow?25:55)){const sp=follow?170:120;ally.x+=dx/d*sp*dt;ally.y+=dy/d*sp*dt;}
          if(dist2(ally.x,ally.y,Player.x,Player.y)>500**2){ally.x=Player.x+25;ally.y=Player.y+15;}
        }
        if(!ally.turret&&s.mods.taunt&&this.gate('taunt_'+s.id,8)) {
          for(const e of this.alive())if(!e.boss&&dist2(e.x,e.y,ally.x,ally.y)<130**2){e.ssTaunt=ally;e.ssTauntUntil=this.now+3;}
        }
        if(s.mods.special==='decoy'&&this.gate('decoy',8)) {
          const decoy={...ally,decoy:true,until:this.now+2,hp:1};this.allies.push(decoy);
          for(const e of this.alive())if(!e.boss&&dist2(e.x,e.y,ally.x,ally.y)<130**2){e.ssTaunt=decoy;e.ssTauntUntil=this.now+2;}
        }
        if(!target||ally.cd>0)continue;
        if(ally.turret) {
          const a=angleTo(ally.x,ally.y,target.x,target.y);
          const count=s.id==='sorceress_hydra'?3:s.id==='assassin_wake'?3+(s.mods.count||0):s.count;
          for(let j=0;j<count;j++){
            const fire=s.id==='sorceress_hydra',wave=s.id==='assassin_wake';
            this.bullet({...s,mode:'projectile'},ally.x,ally.y,a+(j-(count-1)/2)*.16,this.context(s,{ally:true}),{mode:'projectile',life:wave?.7:1.2,speed:wave?180:360,pierce:s.id==='assassin_sentry'?5:wave?3:0,burn:s.mods.burn,dmg:s.dmg*(fire?.55:1)});
          }
          ally.cd=s.id==='sorceress_hydra'?.85:1;continue;
        }
        if(dist2(ally.x,ally.y,target.x,target.y)>(s.radius+target.r)**2)continue;
        ally.cd=s.cd;ally.hits++;
        let dmg=s.dmg;
        if(s.mods.special==='commander'&&this.now%8<3&&this.allies.find(a=>a.id===s.id&&!a.dead)===ally)dmg*=2;
        const ctx=this.context(s,{ally:true});
        if(s.mods.special==='champion'&&ally.hits%3===0)this.burst({...s,radius:45,dmg:dmg*1.5},ally.x,ally.y,{ally:true,secondary:true});
        else {
          this.damage(target,dmg,ctx);
          if(s.id==='druid_grizzly'||s.targets) {
            const others=this.alive().filter(e=>e!==target&&dist2(e.x,e.y,target.x,target.y)<45**2).slice(0,s.id==='druid_grizzly'?3:s.targets);
            for(const e of others)this.damage(e,dmg,ctx);
          }
        }
        if(s.mods.special==='wildAssault'&&this.gate('wild_'+this.allies.indexOf(ally),8))this.burst({...s,radius:50,dmg:dmg*1.2},ally.x,ally.y,{ally:true,secondary:true});
        this.effect(target.x,target.y,14,this.color(s.element),.16,'slash');
      }
    },
    updateEnemies(dt) {
      for(let i=enemies.length-1;i>=0;i--) {
        const e=enemies[i];if(e.dead){enemies.splice(i,1);continue;}
        e.t+=dt;e.flash=Math.max(0,e.flash-dt);
        if(e.ssDots) {
          e.ssDots=e.ssDots.filter(d=>d.until>this.now);
          for(const dot of e.ssDots)this.damage(e,dot.dps*dt,dot.ctx);
          if(e.dead)continue;
        }
        let target=Player;
        if(!e.boss&&e.ssTauntUntil>this.now&&e.ssTaunt&&!e.ssTaunt.dead)target=e.ssTaunt;
        if(target===Player&&!e.boss) {
          const pet=this.allies.find(a=>!a.turret&&!a.dead&&!a.decoy&&dist2(a.x,a.y,e.x,e.y)<36**2);if(pet)target=pet;
        }
        const dx=target.x-e.x,dy=target.y-e.y,d=Math.hypot(dx,dy)||1;
        const stopped=!e.boss&&(e.ssStopUntil||0)>this.now;
        const slow=e.ssSlowUntil>this.now?e.ssSlow||0:0;
        let bossLocked=false;if(e.boss&&!e.ssChampion){SurvivorBosses.tick(e,dt,this);bossLocked=SurvivorBosses.locked(e,this.now);}
        const ranged=['boneMage','skeletonArcher'].includes(e.type);
        if(!stopped&&!bossLocked&&(!ranged&&e.id!=='summoner'||d>220)) {const sp=e.speed*(1-Math.min(e.boss?.15:1,slow));e.x+=dx/d*sp*dt;e.y+=dy/d*sp*dt;}
        if(!e.boss&&e.knock){e.x+=e.knock.x*dt;e.y+=e.knock.y*dt;e.knock.x*=.86;e.knock.y*=.86;}
        if(dist2(e.x,e.y,target.x,target.y)<(e.r+(target===Player?Player.r:14))**2&&!stopped) {
          if(target===Player)Player.takeDamage(e.dmg);
          else if((e.ssPetAttack||0)<this.now){target.hp-=e.dmg;e.ssPetAttack=this.now+.7;}
        }
        if(ranged&&!stopped&&this.gate('enemyShot_'+(e.ssId||(e.ssId=++this.serial)),2.5))this.hostile(e,Math.atan2(dy,dx),e.dmg*.7);
        e.bossBossAttackT=Math.max(0,(e.bossBossAttackT||0)-dt);
      }
    },
    hostile(e,a,dmg,extra={}) {
      if(this.bullets.filter(p=>p.hostile).length>=80)return;
      this.bullets.push({x:e.x,y:e.y,angle:a,age:0,life:4,speed:140,dmg,r:5,hostile:true,mode:'hostile',color:'#ed766a',hitSet:new Set(),...extra});
    },
  };
  return R;
})();
