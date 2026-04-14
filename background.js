let isDucked = false;

// set up offscreen page to interact with web audio
async function setupOffscreen() {
  // Check if an offscreen document already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length > 0) return;

  // Create the offscreen document
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'], // Required for audio capture
    justification: 'Processing tab audio for ducking via Web Audio API'
  });
}

// add event listener to detect changes in tab
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // specifically look for audio changes
  if (changeInfo.hasOwnProperty('audible')) {
    processAudioState();
  }
});

async function processAudioState() {
  const allTabs = await chrome.tabs.query({});
  
  // Find if there is a foreground tab playing audio (like a lecture)
  const foregroundNoise = allTabs.find(t => t.active && t.audible);
  
  // Find if there is a background tab playing audio (like lofi music)
  const backgroundNoise = allTabs.find(t => !t.active && t.audible);

  if (foregroundNoise && backgroundNoise) {
    if (!isDucked) {
      // Tell the offscreen document: "Turn it down!"
      chrome.runtime.sendMessage({ type: 'SET_VOLUME', volume: 0.2 });
      isDucked = true;
    }
  } else if (!foregroundNoise && isDucked) {
    // Tell the offscreen document: "Bring it back up!"
    chrome.runtime.sendMessage({ type: 'SET_VOLUME', volume: 1.0 });
    isDucked = false;
  }
}