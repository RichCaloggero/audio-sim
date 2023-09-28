/* this does one thing:
- sends tick messages every automationInterval
*/

class Automator extends AudioWorkletProcessor {

constructor () {
super ();
this.enable = false;
this.automationInterval = 0.1; // seconds
this.elapsedTime = 0;
this.startTime = currentTime;

this.port.onmessage = e => {
const data = e.data;
const name = data[0];
const value = data[1];
this[name] = value;
//console.log(`automator.worklet: parameter ${name} set to ${value}`);

if (this.enable) {
this.startTime = currentTime;
console.log(`automator.worklet: enabled; startTime reset to ${this.startTime}`);
} // if

if (not(this.enable)) console.log("automator.worklet: disabled");

}; // onMessage

console.log("automator.worklet initialized...");
} // constructor

process (inputs, outputs) {

if (this.enable) {
const dt = currentTime - this.startTime;

if (dt >= this.automationInterval) {
this.startTime = currentTime;
this.port.postMessage("tick");
//console.debug("automator.worklet: tick");
} // if elapsedTime
} // if enabled

return true;
} // process
} // class Automator

registerProcessor("automator", Automator);

function not(x) {return !x;}

