/* Autonomous act populations. Time is active elapsed seconds, never campaign minute. */
'use strict';
window.SurvivorActWaves=(()=>{
  const themes=[
    {types:['fallen','zombie','skeleton'],names:{fallen:'Éclaireur déchu',zombie:'Rempart putréfié',skeleton:'Fantassin ossifié'}},
    {types:['scarab','serpent','sandDemon','goatD'],names:{scarab:'Scarabée des dunes',serpent:'Traqueur serpent',sandDemon:'Gardien des sables',goatD:'Bouc maraudeur'}},
    {types:['fungus','spider','wraith'],names:{fungus:'Fongus cuirassé',spider:'Araignée traqueuse',wraith:'Spectre du marais'}},
    {types:['fireHound','batDemon','ogre'],names:{fireHound:'Limier infernal',batDemon:'Chauve-souris éclaireuse',ogre:'Ogre rempart'}},
    {types:['undeadKnight','skeletonArcher','wraith'],names:{undeadKnight:'Rempart du givre',skeletonArcher:'Archer du givre',wraith:'Spectre givrant'}}
  ];
  const elapsed=value=>Number.isFinite(value)?Math.max(0,value):0;
  function factors(time){
    const minutes=elapsed(time)/60;
    // Linear plus gentle quadratic growth remains finite at realistic long durations.
    // Density and locomotion saturate; combat strength keeps increasing past six minutes.
    return {hp:1+.17*minutes+.018*minutes*minutes,damage:1+.10*minutes+.007*minutes*minutes,
      speed:1+.3*minutes/(minutes+8),rate:1+2*minutes/(minutes+6),elite:Math.min(.18,.012*minutes)};
  }
  function config(act,time){
    const index=Math.max(0,Math.min(4,Math.floor(Number(act)||0))),t=elapsed(time),theme=themes[index],f=factors(t);
    // Start with the lighter role; introduce all of the act's population within 90 s.
    const count=Math.min(theme.types.length,1+Math.floor(t/30));
    return {act:index,types:theme.types.slice(0,count),rate:Math.min(4.8,1.3*f.rate),elite:f.elite,maxEnemies:180,maxHostileProjectiles:80};
  }
  function scaleEnemy(e,time,act=window.SurvivorActs?.index||0){
    if(!e||e.ssActScale)return e;
    const f=factors(time),index=Math.max(0,Math.min(4,act|0)),theme=themes[index];
    // spawnEnemy already applies Heat once. Remove only the old campaign HP factor.
    if(!e.boss&&typeof MINUTE_SCALING!=='undefined'&&typeof Game!=='undefined'){
      const minute=Math.max(0,Math.min(MINUTE_SCALING.length-1,Game.minute|0));
      const legacy=MINUTE_SCALING[minute]||1;e.hpMax/=legacy;e.hp/=legacy;
    }
    e.ssActScale={damage:e.dmg,speed:e.speed,spawnElapsed:elapsed(time),act:index};
    e.hpMax*=f.hp;e.hp*=f.hp;
    e.dmg=e.ssActScale.damage*f.damage;e.speed=e.ssActScale.speed*f.speed;
    if(!e.boss&&theme.names[e.type])e.name=theme.names[e.type]+(e.elite?' élite':'');
    if(!e.boss&&index===4&&e.type==='wraith'){
      e.ssFrostCaster=true;e.ssFrostNext=elapsed(time)+3;
    }
    return e;
  }
  function refresh(e,time){
    if(!e?.ssActScale)return e;
    const f=factors(time);e.dmg=e.ssActScale.damage*f.damage;e.speed=e.ssActScale.speed*f.speed;return e;
  }
  function update(dt,time=window.SurvivorActs?.elapsed||0){
    if(typeof enemies==='undefined')return;
    const now=elapsed(time),f=factors(now),R=window.SurvivorRuntime;
    for(const e of enemies){
      if(e.dead)continue;
      refresh(e,now);
      if(!e.ssFrostCaster||!R)continue;
      if(e.ssFrostWarn){
        if(now>=e.ssFrostWarn.until){
          const mark=e.ssFrostWarn;
          if(Math.hypot(Player.x-mark.x,Player.y-mark.y)<mark.r+Player.r){
            Player.takeDamage(e.dmg*.65);R.enemySlowUntil=Math.max(R.enemySlowUntil,R.now+1.2);
          }
          e.ssFrostWarn=null;
        }
      }else if(now>=e.ssFrostNext&&Math.hypot(Player.x-e.x,Player.y-e.y)<260&&(e.ssStopUntil||0)<=R.now){
        // Fixed warning time and stationary impact point remain dodgeable at every difficulty.
        e.ssFrostWarn={x:Player.x,y:Player.y,r:30,until:now+1};e.ssFrostNext=now+5;
      }
    }
  }
  function draw(ctx,w2s,time=window.SurvivorActs?.elapsed||0){
    if(typeof enemies==='undefined')return;
    for(const e of enemies){
      const mark=e.ssFrostWarn;if(e.dead||!mark)continue;
      const [x,y]=w2s(mark.x,mark.y),zoom=typeof CAM!=='undefined'?CAM.zoom:1;
      ctx.save();ctx.fillStyle='rgba(125,212,255,.16)';ctx.strokeStyle='#9ee6ff';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(x,y,mark.r*zoom,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.arc(x,y,mark.r*zoom*Math.max(0,1-(mark.until-elapsed(time))),0,Math.PI*2);ctx.stroke();ctx.restore();
    }
  }
  return {themes,config,factors,scaleEnemy,refresh,update,draw};
})();
