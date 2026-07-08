// Goal: Generate audio using Web Audio API, which requires offscreen document to execute
// Audio graph: Node(background stream) -> gain -> output/destination

const ctx = new AudioContext();
const gainNode = ctx.createGain();
gainNode.connect(ctx.destination);
let source;
let backgroundGain;

async function handleMessage(streamId, messageType) {
	if (messageType === "capture") {
		await captureAudio(streamId);
	}

	else if (messageType == "duck") {
		duckBackground();
	}

	else if (messageType == "unDuck") {
		unDuckBackground();
	}
	
}

// listen for streamId
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	handleMessage(message.stream, message.messageType);
});

async function captureAudio(streamId) {
	// convert mediaStream from chrome tab into node for audio graph
	mediaStreamNode = await navigator.mediaDevices.getUserMedia({
	  audio: {
	    mandatory: {
	      chromeMediaSource: "tab",
	      chromeMediaSourceId: streamId,
	    }
	  }
	});

	// connect source to its own gain
	source = ctx.createMediaStreamSource(mediaStreamNode);
	backgroundGain = ctx.createGain();
	source.connect(backgroundGain);
	backgroundGain.connect(gainNode);
}

function duckBackground() {
	backgroundGain.gain.value = .2;
	console.log("ducking background");
}

function unDuckBackground() {
	backgroundGain.gain.value = 1;
}

// change background tab volume
/*function changeVolume() {

}*/