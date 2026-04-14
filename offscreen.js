// offscreen.js
let audioCtx;
let gainNode;
let source;

// Listen for messages from the background service worker
chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'START_CAPTURE') {
    startAudioProcessing(message.streamId);
  } else if (message.type === 'SET_VOLUME') {
    updateVolume(message.volume);
  }
});

async function startAudioProcessing(streamId) {
  // 1. Initialize Audio Context if it doesn't exist
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }

  // 2. Capture the tab's stream using the ID provided
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    }
  });

  // 3. Build the Graph: Source -> Gain (Volume Control) -> Speakers
  source = audioCtx.createMediaStreamSource(stream);
  gainNode = audioCtx.createGain();
  
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  console.log("Audio capture started and routed through GainNode.");
}

function updateVolume(level) {
  if (gainNode && audioCtx) {
    const now = audioCtx.currentTime;
    // Smoothly ramp the volume over 0.2 seconds to avoid "popping"
    gainNode.gain.linearRampToValueAtTime(level, now + 0.2);
  }
}