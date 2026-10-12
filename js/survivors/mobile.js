/* Optional landscape touch controls, using the same combat rules as desktop. */
'use strict';
(()=>{
  if(!window.SurvivorIntegration)return;
  const $=id=>document.getElementById(id),R=SurvivorRuntime;
  const mobile=window.SurvivorMobile={enabled:false};
  const style=document.createElement('link');style.rel='stylesheet';style.href='css/mobile.css';document.head.appendChild(style);
  const offer=document.createElement('div');offer.id='ss-mobile-offer';offer.className='overlay hidden';
  offer.innerHTML='<div class="ss-mobile-panel"><h2>Jouer sur téléphone</h2><p>En paysage : joystick à gauche, sorts à droite et visée automatique. Les armes continuent d’attaquer seules.</p><button class="btn" id="ss-mobile-accept">Activer le mode tactile</button><button class="btn small" id="ss-mobile-dismiss">Garder les commandes clavier</button></div>';
  $('game-container').appendChild(offer);
  const rotate=document.createElement('div');rotate.id='ss-mobile-rotate';rotate.className='overlay hidden';
  rotate.innerHTML='<div class="ss-mobile-panel"><h2>Tourne ton téléphone</h2><p>Le mode tactile se joue en paysage.</p></div>';$('game-container').appendChild(rotate);
  const controls=document.createElement('div');controls.id='ss-touch-controls';controls.className='hidden';
  controls.innerHTML='<div id="ss-joystick" role="group" aria-label="Joystick de déplacement"><span id="ss-joystick-knob"></span></div><div id="ss-touch-spells" aria-label="Sorts tactiles"></div><button type="button" id="ss-touch-shop" class="btn small hidden">Commerçant</button>';
  $('game-container').appendChild(controls);
  const pad=$('ss-joystick'),knob=$('ss-joystick-knob');
  let pointer=null,offered=false,lastState=Game.state,portrait=false;
  function resetMovement(){
    const captured=pointer;pointer=null;
    if(captured!==null&&pad.hasPointerCapture(captured))pad.releasePointerCapture(captured);
    for(const key of Object.keys(Keys))Keys[key]=false;
    knob.style.transform='translate(-50%, -50%)';
  }
  function move(e){
    if(e.pointerId!==pointer)return;
    if(Game.state!=='playing'||portrait){resetMovement();return;}
    const rect=pad.getBoundingClientRect(),radius=rect.width/2;
    let x=e.clientX-rect.left-radius,y=e.clientY-rect.top-radius;
    const length=Math.hypot(x,y),limit=radius*.65;
    if(length>limit){x*=limit/length;y*=limit/length;}
    knob.style.transform=`translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    const deadZone=radius*.16,threshold=length>deadZone?Math.max(deadZone,Math.min(length,limit)*.38):Infinity;
    Keys.left=x < -threshold;Keys.right=x > threshold;Keys.up=y < -threshold;Keys.down=y > threshold;
    e.preventDefault();
  }
  pad.addEventListener('pointerdown',e=>{
    if(!mobile.enabled||Game.state!=='playing'||portrait||pointer!==null)return;
    Sound.init();pointer=e.pointerId;pad.setPointerCapture(pointer);move(e);
  });
  pad.addEventListener('pointermove',move);
  for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,e=>{if(e.pointerId===pointer)resetMovement();});
  addEventListener('blur',resetMovement);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){resetMovement();if(mobile.enabled&&Game.state==='playing')pauseGame();}});
  const spells=[];
  for(let i=0;i<3;i++){
    const button=document.createElement('button');button.type='button';button.className='ss-touch-spell';
    button.onclick=()=>{if(Game.state==='playing'){Sound.init();Player.cast(i);sync();}};
    $('ss-touch-spells').appendChild(button);spells.push(button);
  }
  $('ss-touch-shop').onclick=()=>{if(Game.state==='playing')tryShopInteract();};
  function enforceAutoAim(){
    R.autoAim=true;R.aimPoint=null;
    for(const id of ['ss-aim-hud','ss-aim-setup']){const input=$(id);input.checked=true;input.disabled=true;input.title='Visée automatique en mode tactile';}
  }
  function orientation(){
    if(!mobile.enabled)return;
    portrait=innerHeight>innerWidth;
    rotate.classList.toggle('hidden',!portrait);
    resetMovement();
    if(portrait&&Game.state==='playing')pauseGame();
    resizeCanvas();sync();
  }
  function enable(){
    mobile.enabled=true;offer.classList.add('hidden');document.body.classList.add('ss-mobile');
    enforceAutoAim();
    const hint=$('title-screen').querySelector('.controls-hint'),start=$('ss-start');
    hint.textContent='Déplace-toi avec le joystick. Touche un sort pour le lancer : la visée est automatique. ';hint.appendChild(document.createElement('br'));hint.appendChild(start);
    const binding=$('ss-bind-overlay');binding.querySelector('p').textContent='Tes sorts se lancent avec les boutons à droite.';
    binding.querySelector('small').textContent='La visée est automatique en mode tactile.';
    if(Game.state==='binding')$('ss-bind-default').click();
    orientation();
  }
  $('ss-mobile-accept').onclick=enable;
  $('ss-mobile-dismiss').onclick=()=>offer.classList.add('hidden');
  const touchDevice=()=>matchMedia('(pointer: coarse)').matches||navigator.maxTouchPoints>0&&Math.min(innerWidth,innerHeight)<=600;
  function propose(){if(offered||!touchDevice())return;offered=true;offer.classList.remove('hidden');}
  // The entry remains available after declining, and on hybrid devices.
  const entry=document.createElement('button');entry.type='button';entry.className='btn small';entry.textContent='Mode tactile';
  entry.onclick=()=>{offered=true;offer.classList.remove('hidden');};$('title-screen').appendChild(entry);
  addEventListener('resize',()=>{orientation();if(!mobile.enabled&&Game.state==='title')propose();});
  document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&Game.state==='title'&&!offered){offered=true;offer.classList.remove('hidden');}},{passive:true});
  function sync(){
    if(!mobile.enabled)return;
    const playing=Game.state==='playing'&&!portrait;
    if(Game.state!==lastState){resetMovement();lastState=Game.state;}
    controls.classList.toggle('hidden',!playing);
    $('ss-touch-shop').classList.toggle('hidden',!playing||!Shopkeeper.near());
    for(let i=0;i<3;i++){
      const w=Player.skills[i],button=spells[i];button.classList.toggle('hidden',!w);
      if(!w)continue;
      const passive=SurvivorStats.activation(w.def)==='passive';
      const name=w.def.name,source=document.querySelector('#skill-bar [data-ability="'+w.id+'"] img')?.src;
      const signature=w.id+':'+source;
      if(button.dataset.signature!==signature){
        button.dataset.signature=signature;button.replaceChildren();
        if(source){const img=document.createElement('img');img.src=source;img.alt='';button.appendChild(img);}
        const label=document.createElement('span');label.textContent=name;button.appendChild(label);
        const status=document.createElement('small');button.appendChild(status);
      }
      button.setAttribute('aria-label',name+(passive?' · passif automatique':' · visée automatique'));
      button.disabled=!playing||passive;
      button.classList.toggle('ss-unavailable',!passive&&!Player.canCast(i));
      button.querySelector('small').textContent=passive?'Auto':w.enabled?'Aura active':w.cd>0?w.cd.toFixed(1)+' s':Player.mana<SurvivorStats.manaCost(R.stats(w))?'Mana':'Prêt';
    }
  }
  const hud=updateHUD;updateHUD=function(){hud();sync();};
  // Menus can stop the loop's HUD refresh: clear held movement immediately.
  const observer=new MutationObserver(()=>{if(mobile.enabled&&Game.state!==lastState)sync();});
  observer.observe($('game-container'),{subtree:true,attributes:true,attributeFilter:['class']});
  propose();
})();
