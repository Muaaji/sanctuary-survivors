'use strict';
window.SurvivorWeaponArt=(()=>{const cache={};return {get(kind,projectile=false){if(projectile)kind=({bow:'arrow',crossbow:'bolt',sling:'pebble'})[kind]||kind;if(cache[kind])return cache[kind];const image=new Image();image.src='assets/survivors/weapons/'+kind+'.png';cache[kind]=image;return image;}};})();
