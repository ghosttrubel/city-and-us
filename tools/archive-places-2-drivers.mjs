import {mkdir,rename,stat,writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),destination=path.join(root,'qa/places-vehicles-2/implementation-scripts');
await mkdir(destination,{recursive:true});
const names=['patch-places-2-core.mjs','patch-places-2-game.mjs','patch-places-2-ticket.mjs','patch-places-2-tests.mjs','fix-places-2.mjs','fix-bike-navigation.mjs','fix-bike-contact.mjs','update-places-2-checks.mjs','fix-bike-input.mjs','fix-expanded-coast.mjs','fix-passenger-speech.mjs','update-camera-regression.mjs','finalize-bike-input.mjs','protect-voice-progress.mjs','prepare-places-2-finish.mjs','reuse-service-audio.mjs'];
for(const name of names){const from=path.resolve(root,'tools',name),to=path.resolve(destination,name);if(!from.startsWith(root+path.sep)||!to.startsWith(root+path.sep))throw Error('Outside workspace');if(await stat(from).catch(()=>null))await rename(from,to);}
await writeFile(path.join(root,'tools/verify-places-preservation.mjs'),"// Current preservation gate: the dated Batch 2 checkpoint plus legacy-save migration.\n// The previous standalone hash test remains in the pre-batch checkpoints.\nimport './verify-places-2-state.mjs';\n");
await writeFile(path.join(destination,'README.md'),'# Implementation history\n\nOne-time edit scripts retained for audit/recovery. Do not rerun them against the completed source. Use the current verification commands and dated checkpoint manifests instead.\n');
console.log('Retained one-time edit drivers under QA; legacy preservation command points to the current gate.');
