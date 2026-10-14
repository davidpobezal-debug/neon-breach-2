/* Startup: builds assets and the first level, starts the frame loop. */
'use strict';
makeMissionAssets();makeSystemsAssets();makeHydroAssets();
makeAssets();makeEVAAssets();makeLevel();player.x=12.7;player.y=82;player.a=-1.28;enemies=[enemy(14.7,77.5),enemy(11.5,71,'shooter')];if(checkpoint)$('continue').classList.remove('hidden');requestAnimationFrame(frame);
