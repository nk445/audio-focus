// Audio graph: stream -> gain -> output/destination
const ctx = new AudioContext();
const gainNode = ctx.createGain();
gainNode.connect(ctx.destination);
let source;

async function handleMessage(streamId) {
	// get media stream from stream id and tab it came from
	mediaStream = await navigator.mediaDevices.getUserMedia({
	  audio: {
	    mandatory: {
	      chromeMediaSource: "tab",
	      chromeMediaSourceId: streamId,
	    }
	  }
	});
	// connect to gain and lower volume
	source = ctx.createMediaStreamSource(mediaStream);
	source.connect(gainNode);
	gainNode.gain.value = .2;
}
// listen for streamId
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	handleMessage(message.stream);
	//sendResponse("Got the ID!");
});