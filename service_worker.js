// goal : capture audio from background tab (user allows this by clicking extension icon)
// duck audio when new audio starts playing, unduck when foreground audio stops

let backgroundAudio = null;
let foregroundAudio = null;
let creating;

//
chrome.runtime.onInstalled.addListener(() => {
	chrome.action.setBadgeText({
		text: "OFF"
	})
});

// on click, let user know extension is "ON" and capture audio (if there is audio)
chrome.action.onClicked.addListener( async (tab) =>  {
	await handle_badge(tab);

	// get stream ID for audio
	const streamId = await chrome.tabCapture.getMediaStreamId();

	// create offscreen document so we can use Web Audio API
	await setupOffscreenDocument('offscreen.html');

	// send audio stream ID to event listeners (i.e. offscreen document to handle ducking)
	chrome.runtime.sendMessage(streamId);
});

async function handle_badge(tab) {
	const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
	let nextState = "";
	let newColor = '';
	if (prevState === "OFF") {
		nextState = "ON";
		newColor = '#06d6b0';
	}
	else {
		nextState = "OFF";
		newColor = '#ED665B';
	}
	await chrome.action.setBadgeText({
		tabId: tab.id,
		text: nextState,
	});
	await chrome.action.setBadgeBackgroundColor({
		tabId: tab.id,
		color: newColor
	})
}

async function setupOffscreenDocument(file_path) {
	// check if offscreen doc exists already
	const offscreenURL = chrome.runtime.getURL(file_path);
	const existingContexts = await chrome.runtime.getContexts({
		contextTypes: ['OFFSCREEN_DOCUMENT'],
		documentUrls: [offscreenURL]
	});

	if (existingContexts.length > 0) {
		return;
	}

	// create document

	// make sure it is not already being created
	if (creating) {
		await creating;
	}

	// attribute to variable so above block evaluates to true and then await
	creating = chrome.offscreen.createDocument({
		url: 'offscreen.html',
		reasons: ['USER_MEDIA'],
		justification: 'Need to duck audio',
	});
	await creating;

	// finish set up
	creating = null;
}