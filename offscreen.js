const ctx = new AudioContext();
let streamId;

function handleMessage(message) {
	console.log(`this is the message: ${message}`);
}
// listen for streamId
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	handleMessage(message);
	//sendResponse("Got the ID!");
});