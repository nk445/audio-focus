const ctx = new AudioContext();

function setCtx(streamId) {
	source = output.createMediaStreamSource(streamId);
	source.connect(ctx.destination);
}