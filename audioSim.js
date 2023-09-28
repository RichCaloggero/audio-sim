let id = 0;
import * as automation from "./automation.js";

export async function buildAudioGraph (sources, audio) {
await automation.initialize(audio);

const graph = {
audio,
actors: sources.map(source => createActor(source, audio))
};
audio.listener.setOrientation(0,0,-1, 0,1,0);
audio.listener.setPosition(0,0, 1);

return graph;
} // buildAudioGraph

function createActor (source, audio) {
const delay =  random(30); // seconds
const startTime = audio.currentTime+delay;
const endTime = startTime + source.duration;
const merge = audio.createChannelMerger(2);

const pan = new PannerNode(audio, {
panningModel: "HRTF",
distanceModel: "linear",
refDistance: 2,
maxDistance: 10,
rolloffFactor: 1,
channelCount: 1,
coneInnerAngle: 360,
coneOuterAngle: 360
});
[pan.orientationX.value, pan.orientationY.value, pan.orientationZ.value] = [1,0,0];

moveTo(pan, randomPosition());

const gain = audio.createGain(0.1);

merge.connect(pan).connect(gain).connect(audio.destination);

const actor = {id: ++id, playCount: 0,
startTime, endTime,
source, merge, pan, gain
};
//console.log("actor: ", actor);

return actor;
} // createActor

export function start (audioGraph) {
for (const actor of audioGraph.actors) play(actor, audioGraph.audio);
automation.enableAutomation();
} // start

export function stop () {
automation.disableAutomation();
} // stop

function play (actor, audio) {
actor.playCount++;
const node = audio.createBufferSource();
node.connect(actor.merge);
node.buffer = actor.source;

//console.log(`play: from = ${positionOf(actor.pan)}`);
moveTo(actor.pan, randomPosition(), actor.startTime, actor.endTime);

node.onended = () => {
node.disconnect();
update(actor);
//console.log(`ended: ${actor.startTime}, ${actor.endTime}`);
setTimeout(() => play(actor, audio), 0);
}; // on ended

node.start(actor.startTime);
} // play

function update (actor) {
const delay = random(40,20);
actor.startTime = actor.endTime + delay;
actor.endTime = actor.startTime + actor.source.duration;
} // update

function moveTo (pan, to, startTime = -1, endTime = -1) {
//console.log(`moveTo: ${to.map(x => x.toFixed(2))}`);
const [x,y,z] = [pan.positionX, pan.positionY, pan.positionZ];
const [x1,y1,z1] = to;

if (startTime < 0 && endTime < 0) {
// move immediately
[x.value, y.value, z.value] = [x1, y1, z1];
return;
} // if

const dt = automation.getAutomationInterval() / (endTime - startTime);
const [dx, dy,dz] = [dt*(x1-x.value), dt*(y1-y.value), dt*(z1-z.value)];
//console.log(`- ${[dx,dy,dz,dt].map(x => x.toFixed(2))}`);

automation.add(x, (x => x+dx), "x", startTime, endTime);
automation.add(y, (y => y+dy), "y", startTime, endTime);
automation.add(z, (z => z+dz), "z", startTime, endTime);
} // moveTo

function positionOf (pan, digits = 2) {
return [pan.positionX, pan.positionY, pan.positionZ].map(
(p => p.value.toFixed(digits)))
} // positionOf

function setOrientation (pan, x,y,z) {
pan.orientationX.value = x;
pan.orientationY.value = y;
pan.orientationZ.value = z;
} // setOrientation

function randomPosition () {
return [random(1,-1), random(1,-1), random(1,-1)];
} // randomPosition


function random (max = 1, min = 0) {
if (min > max) {
const t = min;
min = max;
max = t;
} // if
return (max-min) * Math.random() + min;
} // random


function not(x) {return !x;}
