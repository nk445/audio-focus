# AudioFocus

A Chrome Extension that automatically ducks background music (e.g., Lo-Fi, Spotify) when audio is detected in a foreground tab (e.g., lectures, calls).

## Features
- **Automatic Ducking:** Lowers background volume using Web Audio API when you play foreground audio.
- **Manual Toggle:** Click the icon to enable/disable ducking permissions for a specific tab.
- **High Fidelity:** Uses Offscreen Documents for smooth, persistent audio processing.

## Technical Details
- **Manifest V3:** Service Worker orchestration.
- **Web Audio API:** Real-time GainNode attenuation.
- **tabCapture:** Low-level stream interception.

## Usage
1. Load unpacked in `chrome://extensions`.
2. Click the extension icon on your music tab to enable (Green "ON" badge).
3. Foreground audio will now trigger volume reduction in the enabled tab.

## Roadmap
- **Release Toggle:** Implement logic to stop the capture session and restore original audio routing by clicking the icon again.
- **Adjustable Gain:** Add a slider to set the target "ducked" volume level.
