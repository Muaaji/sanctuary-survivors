/* Shared menu layout: preserve existing controls and their handlers. */
'use strict';
(()=>{
 if(!window.SurvivorIntegration)return;
 const $=id=>document.getElementById(id);
 const style=document.createElement('link');style.rel='stylesheet';style.href='css/menus.css?v=11';document.head.appendChild(style);
 const screens=['title-screen','class-screen','levelup-overlay','pause-overlay','settings-overlay','shop-overlay','sanctuary-overlay','kill-screen','win-screen','talents-overlay','evolution-overlay','knowledge-overlay','ss-run-setup','ss-bind-overlay','ss-stats-overlay','eq-overlay','ss-omens-overlay'];
 const wrapped=['title-screen','class-screen','levelup-overlay','pause-overlay','kill-screen','win-screen','evolution-overlay'];
 for(const id of screens){const screen=$(id);if(!screen)continue;screen.classList.add('ss-menu-screen');screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.tabIndex=-1;
  if(wrapped.includes(id)){const shell=document.createElement('div');shell.className='ss-menu-shell';while(screen.firstChild)shell.appendChild(screen.firstChild);screen.appendChild(shell);}
 }
 const title=$('title-screen').querySelector('.ss-menu-shell'),start=$('ss-start'),hint=$('title-screen').querySelector('.controls-hint'),actions=$('title-screen').querySelector('.ss-title-actions');
 const primary=document.createElement('div');primary.className='ss-title-primary';primary.appendChild(start);title.insertBefore(primary,hint);title.insertBefore(actions,hint);hint.classList.add('ss-help');start.dataset.primary='true';
 $('class-screen').querySelector('h2').textContent='Choisis ton héros';
 const step=document.createElement('p');step.className='ss-menu-intro';step.textContent='1 / 2 · Sept héros, sept façons de traverser la crypte.';$('class-screen').querySelector('h2').after(step);
 for(const id of ['pause-overlay','kill-screen','win-screen']){const shell=$(id).querySelector('.ss-menu-shell'),group=document.createElement('div');group.className='ss-menu-actions';
  for(const button of shell.querySelectorAll('.btn'))group.appendChild(button);
  for(const child of [...shell.children])if(child.tagName==='DIV'&&!child.childNodes.length)child.remove();shell.appendChild(group);
 }
 $('resume-btn').dataset.primary='true';$('ss-launch').dataset.primary='true';
 $('shop-close').textContent='Revenir au combat · E / Échap';
 for(const id of ['shop-overlay','sanctuary-overlay'])$(id).querySelector('.shop-panel').classList.add('ss-commerce-panel');
 for(const id of ['title-screen','class-screen','ss-run-setup','shop-overlay','pause-overlay','levelup-overlay']){const heading=$(id).querySelector('h1,h2');if(heading){if(!heading.id)heading.id=id+'-heading';$(id).setAttribute('aria-labelledby',heading.id);}}
 // Only the frontmost visible menu receives focus or pointer interactions.
 let front=null,pending=false;
 function sync(){pending=false;const visible=[...document.querySelectorAll('#game-container > .overlay')].filter(el=>!el.classList.contains('hidden'));
  const top=visible.reduce((best,el)=>!best||Number(getComputedStyle(el).zIndex)>=Number(getComputedStyle(best).zIndex)?el:best,null);
  for(const el of document.querySelectorAll('#game-container > .overlay')){el.inert=el!==top;el.setAttribute('aria-hidden',el===top?'false':'true');}
  $('hud').inert=!!top;
  if(top&&top!==front&&!top.contains(document.activeElement)){const focus=top.querySelector('[data-primary],button:not(:disabled),input:not(:disabled),select:not(:disabled)');(focus||top).focus({preventScroll:true});}
  front=top;
 }
 const observer=new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(sync);}});observer.observe($('game-container'),{subtree:true,attributes:true,attributeFilter:['class']});sync();
 // Daily seeds and compact local history use existing menu surfaces.
 const replay=window.SurvivorReplay,historyBodies=[];
 function renderHistory(){if(!replay)return;for(const body of historyBodies){body.textContent='';const entries=replay.entries().slice(0,5);if(!entries.length){body.textContent='Aucune partie terminée sur cet appareil.';continue;}for(const entry of entries){const line=document.createElement('p');line.textContent=replay.format(entry);body.appendChild(line);}const last=entries[0];if(last.seed){const button=document.createElement('button');button.className='btn small';button.textContent='Rejouer la seed de la dernière partie';button.onclick=()=>{const entry=replay.replayLatest();if(!entry)return;SurvivorIntegration.prepareReplay(entry);};body.appendChild(button);}const note=document.createElement('p');note.className='ss-help';note.textContent='Même seed de départ. Vos actions, équipement, progression et pactes peuvent changer le résultat. Aucun classement.';body.appendChild(note);}}
 if(replay){const modeButton=document.createElement('button');modeButton.id='ss-daily-mode';modeButton.className='btn small';function renderMode(){modeButton.textContent=replay.mode==='daily'?'Parcours du jour · activé (UTC)':'Parcours du jour · désactivé';modeButton.setAttribute('aria-pressed',String(replay.mode==='daily'));}modeButton.onclick=()=>{replay.setMode(replay.mode==='daily'?'normal':'daily');renderMode();};renderMode();$('ss-run-setup').querySelector('.ss-setup-actions').insertBefore(modeButton,$('ss-launch'));const note=document.createElement('p');note.className='ss-help';note.textContent='Parcours du jour : seed fixe par jour UTC, héros et acte. Équipement, progression et pactes restent personnels.';$('ss-run-setup').querySelector('.ss-setup-panel').appendChild(note);
  for(const id of ['title-screen','pause-overlay']){const details=document.createElement('details'),summary=document.createElement('summary'),body=document.createElement('div');summary.textContent='Historique local · dernières parties';details.appendChild(summary);details.appendChild(body);details.addEventListener('toggle',renderHistory);($(id).querySelector('.ss-menu-shell')||$(id)).appendChild(details);historyBodies.push(body);}renderHistory();
 }
 window.SurvivorMenus={sync,renderHistory};
})();
