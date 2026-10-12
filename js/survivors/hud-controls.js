/* Compact controls sit immediately above the gothic combat frame. */
'use strict';
(()=>{
 if(!window.SurvivorIntegration)return;
 const $=id=>document.getElementById(id),ribbon=$('ss-build-ribbon');
 const paths={
  talents:'<path d="M12 5v5m0 0H5v7m7-7h7v7"/><circle cx="12" cy="4" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>',
  stats:'<path d="M4 4v16h17M8 16v-5m5 5V6m5 10V9"/>',
  aim:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',
  inventory:'<path d="M8 7V5a4 4 0 0 1 8 0v2M7 7h10a3 3 0 0 1 3 3v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a3 3 0 0 1 3-3Z"/><path d="M8 13h8v5H8zM9 7v3m6-3v3"/>',
  menu:'<path d="M5 6h14M5 12h14M5 18h14"/><circle cx="3" cy="6" r=".5"/><circle cx="3" cy="12" r=".5"/><circle cx="3" cy="18" r=".5"/>'
 };
 const icon=kind=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[kind]+'</svg>';
 const bar=document.createElement('nav');bar.id='ss-hud-controls';bar.setAttribute('aria-label','Commandes du héros');$('hud-bottom').appendChild(bar);
 function decorate(el,kind,label,key=''){
  el.className='ss-hud-control';el.setAttribute('aria-label',label);el.title=label+(key?' · '+key:'');el.dataset.tooltip=el.title;
  el.innerHTML=icon(kind)+(key?'<span class="ss-control-key" aria-hidden="true">'+key+'</span>':'');bar.appendChild(el);return el;
 }
 const talents=decorate($('ss-talents-button'),'talents','Talents','T');const badge=document.createElement('span');badge.id='ss-talent-count';badge.className='ss-control-badge';badge.textContent=SurvivorRuntime.talentPoints;talents.appendChild(badge);
 decorate($('ss-stats-button'),'stats','Statistiques','C');
 const aim=$('ss-aim-hud'),aimLabel=ribbon.querySelector('.ss-aim-control');decorate(aimLabel,'aim','Visée automatique');aim.setAttribute('aria-label','Visée automatique');aimLabel.appendChild(aim);
 decorate($('ss-inventory-button'),'inventory','Inventaire','I');
 const menu=document.createElement('button');menu.id='ss-menu-button';menu.type='button';decorate(menu,'menu','Menu / pause','Échap');menu.onclick=()=>{if(Game.state==='playing')pauseGame();};
 $('hud-bottom').appendChild($('xp-bar'));$('hud-bottom').appendChild(ribbon);
 // Keep the original checkbox handlers and synchronization with run preparation.
 const hud=updateHUD;updateHUD=function(){hud();badge.classList.toggle('hidden',SurvivorRuntime.talentPoints<=0);};badge.classList.toggle('hidden',SurvivorRuntime.talentPoints<=0);
})();
