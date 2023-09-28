// Function to load audio files from the local machine into Web Audio buffer nodes
async function loadAudioFiles(files, audioContext) {
const buffers = [];

if (files.length === 0) {
console.error('No files selected.');
return [];
} // if

for (const file of files) {
const buffer = await readFileAsArrayBuffer(file);
const decodedBuffer = await audioContext.decodeAudioData(buffer);
buffers.push(decodedBuffer);
} // for

return buffers;
} //  // loadAudioFiles

// Helper function to read a file as an ArrayBuffer using async/await
function readFileAsArrayBuffer(file) {
return new Promise((resolve, reject) => {
const reader = new FileReader();
reader.onload = () => resolve(reader.result);
reader.onerror = reject;
reader.readAsArrayBuffer(file);
});
} // fileAsArrayBuffer

