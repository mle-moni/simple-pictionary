module.exports = {
    setupEvents: setupEvents
};

function newMsg(socket, msg) {
    let ok = true;

    socket.broadcast.emit("newMsg", socket.psd, msg);
	socket.emit("newMsg", socket.psd, msg);
}

function setupEvents(socket, dbo) {
	socket.on("newMsg", text => {
		if (socket.hasOwnProperty("psd") && text.length !== 0 && text.length <= 100) {
			// verify is msg === socket.game.winCondition before sending
			newMsg(socket, text);
		}
	});
}