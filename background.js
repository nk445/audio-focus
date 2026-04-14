const primedTabs = new Set();
const capturedTabs = new Set();

chrome.action.onClicked.addListener((tab) => {
  primedTabs.add(tab.id);
  
  // Visual feedback: Change the icon badge to show it's active
  chrome.action.setBadgeText({ text: 'ON', tabId: tab.id });
  chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId: tab.id });
  
  console.log(`Tab ${tab.id} is now primed for Auto-Ducking.`);
})

// 1. The Watchman (The only listener we need)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // We only react if the 'audible' state changes
  if (changeInfo.hasOwnProperty('audible')) {
    processAudioState();
  }
});

async function processAudioState() {
  const allTabs = await chrome.tabs.query({});
  const foregroundNoise = allTabs.find(t => t.active && t.audible);
  const backgroundNoise = allTabs.find(t => !t.active && t.audible && primedTabs.has(t.id));

  if (foregroundNoise && backgroundNoise) {
    console.log("Foreground and background noise detected!");
    // Step A: Ensure the Offscreen "mixer room" is open
    await setupOffscreen();

    // IF NOT CAPTURED YET: Start the stream
      if (!capturedTabs.has(backgroundNoise.id)) {
        chrome.tabCapture.getMediaStreamId({ targetTabId: backgroundNoise.id }, (streamId) => {
          if (chrome.runtime.lastError) return;
          
          chrome.runtime.sendMessage({ 
            type: 'START_CAPTURE', 
            streamId: streamId, 
            initialVolume: 0.2 
          });
          capturedTabs.add(backgroundNoise.id);
          isDucked = true;
        });
      }
      // IF ALREADY CAPTURED: Just lower the volume
      else if (!isDucked) {
        chrome.runtime.sendMessage({ type: 'SET_VOLUME', volume: 0.2 });
        isDucked = true;
      }

  } else if (!foregroundNoise && isDucked) {
    // Restore volume if the foreground stops
    chrome.runtime.sendMessage({ type: 'SET_VOLUME', volume: 1.0 });
    isDucked = false;
  }
}

// Helper function to manage the offscreen document
async function setupOffscreen() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });
  if (existingContexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'],
    justification: 'Ducking audio via Web Audio API'
  });
}

// prevent memory leaks, delete tab from primed and captured sets
chrome.tabs.onRemoved.addListener((tabId) => {
  capturedTabs.delete(tabId);
  primedTabs.delete(tabId);
  console.log("background tab no longer being captured/tracked")
});