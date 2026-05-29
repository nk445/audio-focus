// Audio graph: Node(stream) -> gain -> output/destination
const ctx = new AudioContext();
const gainNode = ctx.createGain();
gainNode.connect(ctx.destination);
let source;

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

	// connect to gain and lower volume
	source = ctx.createMediaStreamSource(mediaStreamNode);
	source.connect(gainNode);
	gainNode.gain.value = .2;
}

// listen for streamId
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	handleMessage(message.stream, message.layer);
	//sendResponse("Got the ID!");
});

// change background tab volume
/*function changeVolume() {

}*/