// Goal: Generate audio using Web Audio API, which requires offscreen document to execute
// Audio graph: Node(background stream) -> gain -> output/destination

const ctx = new AudioContext();
const gainNode = ctx.createGain();
gainNode.connect(ctx.destination);
let source;
let backgroundGain;

async function handleMessage(streamId, layer) {
	// convert mediaStream from chrome tab into node for audio graph
	mediaStreamNode = await navigator.mediaDevices.getUserMedia({
	  audio: {
	    mandatory: {
	      chromeMediaSource: "tab",
	      chromeMediaSourceId: streamId,
	    }
	  }
	});

	console.log(layer);

	// connect source to its own gain
	source = ctx.createMediaStreamSource(mediaStreamNode);
	let localGain = ctx.createGain();
	source.connect(localGain);
	localGain.connect(gainNode);

	// set local gain as background audio if appropriate
	if (layer == "background") {
		backgroundGain = localGain;
	}
	// lower background audio if this is foreground
	else {
		backgroundGain.gain.value = .2;
	}
}

// listen for streamId
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	handleMessage(message.stream, message.layerType);
	//sendResponse("Got the ID!");
});

// change background tab volume
/*function changeVolume() {

}*/