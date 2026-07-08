// goal : capture audio from background tab (user allows this by clicking extension icon)
// duck audio when new audio starts playing, unduck when foreground audio stops

let backgroundTab = null;
let creating;

const status = Object.freeze({
	ON: "ON",
	OFF: "OFF"
});
let currStatus = "OFF";

const badgeColor = Object.freeze({
	GREEN: '#06d6b0',
	RED: '#ED665B'
});
let currColor;

// on click, let user know extension is "ON" and capture audio (if there is audio)
chrome.action.onClicked.addListener( async (tab) =>  {
	console.log("badge clicked");
	await handle_badge(tab);

	// add listener for updates (audio starts/stops playing)
	chrome.tabs.onUpdated.addListener(handleTabUpdate);

	// get stream ID for audio
	const streamId = await chrome.tabCapture.getMediaStreamId();

	// create offscreen document so we can use Web Audio API
	await setupOffscreenDocument('offscreen.html');
	console.log("offscreen set up returned");

	// determine if this is background audio (no other audio playing)
	if (!backgroundTab) {
		backgroundTab = tab.id
	}
	
	// send audio stream ID to event listeners (i.e. offscreen document to handle ducking)
	chrome.runtime.sendMessage({
		stream: streamId,
		messageType: "capture"
	});
});

// handle change in play status of stream by ducking/unducking background audio
function handleTabUpdate(tabId, changeInfo, tab) {
	// only modify background audio if audio from another tab starts/stops
	if (tabId == backgroundTab) {
		return
	}

	// if foreground is audible/starts, duck background
	if (changeInfo.audible) {
		chrome.runtime.sendMessage({
			messageType: "duck"
		})
	}
	else {
		chrome.runtime.sendMessage({
			messageType: "unDuck"
		})
	}
}

// handle ON/OFF label for badge on click
async function handle_badge(tab) {
	//const prevState = await chrome.action.getBadgeText({ tabId: tab.id });

	// determine if displaying ON or OFF and switch
	if (currStatus === status.ON) {
		currStatus = status.OFF;
		currColor = badgeColor.RED;
	}
	else {
		currStatus = status.ON;
		currColor = badgeColor.GREEN;
	}

	// apply change
	await chrome.action.setBadgeText({
		text: currStatus,
	});
	await chrome.action.setBadgeBackgroundColor({
		color: currColor
	})

}

// create offscreen document if necessary
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
	console.log("offscreen set up done");
}