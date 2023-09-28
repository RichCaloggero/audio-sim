

let automationEnabled = false;
let automationInterval = 0.1;
let environment = {};
let automator = null;
let automationQueue = [];
let eventQueue = [];


export async function initialize (audioContext) {
if (automator) return; // already initialized

await audioContext.audioWorklet.addModule("./automator.worklet.js");
console.log("audioWorklet.automator created.");

automator = new AudioWorkletNode(audioContext, "automator");
automator.port.onmessage = e => {
if (automationEnabled) {
const message = e.data;

if (message === "tick") {
tick(audioContext, automationQueue, eventQueue);
} // if
} // if _automationEnabled
}; // onmessage

console.log ("automation initialized.");
} // initialize

export function getAutomationInterval () {return automationInterval;}

export function setAutomationInterval (value) {
value = Number(value);
if (value && value > 0) {
automator.port.postMessage(["automationInterval", value]);
automationInterval = value;
} // if
} // setAutomationInterval

export function enableAutomation () {
automator.port.postMessage(["enable", true]);
automationEnabled = true;
} // enableAutomation

export function disableAutomation () {
automator.port.postMessage(["enable", false]);
automationEnabled = false;
} // disableAutomation

export function add (parameter, _function, name = "", startTime = -1, endTime = -1) {
if (not(parameter)) return;
if (not(_function)) return;
automationQueue.push({name, parameter, startTime, endTime, nextValue: _function});
} // add

export function remove ({name, parameter}) {
let event;
if(name && parameter) event = automationQueue.find(e => e.parameter === parameter && e.name === name);
else if (name) event = automationQueue.find(e => e.name === name);
else if (parameter) event = automationQueue.find(e => e.parameter === parameter);

if (event) automationQueue = automationQueue.filter(e => e !== event);

return event;
} // remove

function createEvent (time, handler, actor) {
eventQueue.push({time, handler, actor});
} // createEvent

function tick (audioContext, automationQueue, eventQueue) {
automationQueue = processAutomation(automationQueue, audioContext);
eventQueue = processEvents(eventQueue, audioContext);
} // tick

function processAutomation (queue, audioContext) {
const t = audioContext.currentTime;

queue = queue.filter(event => {
if (event.endTime >= 0 && t > event.endTime) return false;
if (event.startTime >= 0 && t < event.startTime) return true;

const p = event.parameter;
p.value = event.nextValue(p.value);
return true;
}); // filter

return queue;
} // processAutomation

function processEvents (queue, audioContext) {
const t = audioContext.currentTime;

queue = queue.filter(event => {
if (t >= event.time) {
// execute and then filter it out
execute(event, audioContext);
return false;
} else {
// otherwise, keep it
return true;
} // if
 }); // filter

return queue;
} // processEvents

function execute (event, audioContext) {
event.handler(event.actor, audioContext);
} // execute

function not(x) {return !x;}

