import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {createPlaceVoice} from '../dist/place-voice.js';
import {boot,el,frames} from './game-test-harness.mjs';
await boot({search:'?review=places'});
const instances=[];
class AudioDouble{constructor(url){this.src=url;this.currentTime=0;this.paused=false;instances.push(this);}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}}
const state={sex:'female',dialogue:{volume:.35,muted:false,textOnly:false}},voice=createPlaceVoice({state,host:()=>el('sheet'),AudioClass:AudioDouble});
voice.say(['playerBag','shopConfirm']);assert.equal(instances.length,1);assert(instances[0].src.endsWith('playerBag-female.wav'));assert.equal(instances[0].volume,.35);assert(el('place-voice-subtitle').textContent.includes('You: Please'));
instances[0].onended();assert.equal(instances.length,1,'Queue should reuse one media element');assert(instances[0].src.endsWith('shopConfirm.wav'));state.dialogue.volume=.12;voice.tick(.01);assert.equal(instances[0].volume,.12);
state.dialogue.muted=true;voice.tick(.01);assert(instances[0].paused);assert(!voice.playing);assert(el('place-voice-subtitle').textContent.includes('five hundred'));
const count=instances.length;voice.say(['shopHello']);assert.equal(instances.length,count);state.dialogue.muted=false;state.dialogue.textOnly=true;voice.say(['shopHello']);assert.equal(instances.length,count);state.dialogue.textOnly=false;
state.sex='male';voice.say(['playerCollect','parcelCollected']);assert(instances.at(-1).src.endsWith('playerCollect-male.wav'));const old=instances.at(-1),late=old.onended;voice.say(['shopFunds']);const current=instances.at(-1);late();assert.equal(instances.at(-1),current);assert.equal(old,current,'Conversation should reuse the media element');
voice.stop();assert(current.paused);assert(!voice.playing);
class RejectedAudio extends AudioDouble{play(){return Promise.reject(Error('Autoplay blocked'));}}
const rejected=createPlaceVoice({state,host:()=>el('sheet'),AudioClass:RejectedAudio});rejected.say(['parcelHello']);await Promise.resolve();await Promise.resolve();assert(el('place-voice-status').textContent.includes('Replay'));assert(el('place-voice-subtitle').textContent.includes('Passenger'));
voice.say(['shopHello']);for(let i=0;i<90;i++)voice.tick(.05);assert(!voice.playing);assert(el('place-voice-status').textContent.includes('stalled'));el('place-voice-replay').onclick();assert(voice.playing);voice.stop();
const checks=['Sequential player/attendant playback reuses one media element, with female/male variants and exact subtitles','Volume follows settings; mute/text-only stop and prevent audio without losing subtitles','New conversations invalidate stale audio callbacks; explicit Stop pauses playback','Rejected autoplay and stalled audio expose Replay with subtitles; replay restarts'];
await writeFile(new URL('../qa/places-vehicles-2/voice-controller.json',import.meta.url),JSON.stringify({status:'passed',checks,scope:'Audio API doubles; not listening review or real browser autoplay verification.'},null,2));console.log(checks.join('\n'));
