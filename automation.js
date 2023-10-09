let automationEnabled = false;
let automationInterval = 0.05;
let environment = {};
let automator = null;
let automationQueue = [];
let eventQueue = [];


export async function initialize (audioContext) {
if (automator) return; // already initialized

await audioContext.audioWorklet.addModule("./automator.worklet.js");
//console.log("audioWorklet.automator created.");

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
automationInterval = value;
if (automator) automator.port.postMessage(["automationInterval", value]);
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

export function add (object, action, name = "", startTime = -1, endTime = -1) {
if (not(object)) return;
if (not(action)) return;
automationQueue.push({name, object, startTime, endTime, action});
} // add

export function remove ({name, object}) {
let event;
if(name && object) event = automationQueue.find(e => e.object === object && e.name === name);
else if (name) event = automationQueue.find(e => e.name === name);
else if (object) event = automationQueue.find(e => e.object === object);

if (event) automationQueue = automationQueue.filter(e => e !== event);

return event;
} // remove

function createEvent (time, handler, actor) {
eventQueue.push({time, handler, actor});
} // createEvent

function tick (audioContext, automationQueue, eventQueue) {
automationQueue = processAutomation(automationQueue, audioContext);
//eventQueue = processEvents(eventQueue, audioContext);
} // tick

function processAutomation (queue, audioContext) {
const t = audioContext.currentTime;
//console.log(`${t.toFixed(2)}: ${queue.length} events`);

queue = queue.filter(event => {
//console.log("- ", event);

// keep events that have no start and end times
if (event.startTime < 0 && event.endTime < 0) return true;

// keep events that haven't happened yet
if (event.startTime >= 0 && t < event.startTime) return true;

// throw away events that are past due
if (event.endTime >= 0 && t > event.endTime) return false;

//console.log("- applying ", event.object, " to ", event.action);
event.action(event.object);
return true;
});
/*.map(event => {
const object = event.object;
// if it has a value then we assume an audioParam and assume the function computes it's next value
if (object instanceof Object && "value" in object) object.value = event.action(object.value);
// otherwise we assume a more generic event and apply the action to the object
else

return event;
}); // filter
*/
//console.log(`- queue: ${queue.length}`);

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

