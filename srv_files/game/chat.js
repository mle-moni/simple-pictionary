/*
Copyright 2020 LE MONIES DE SAGAZAN Mayeul

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

module.exports = {
	setupEvents,
	newMsg
};

function newMsg(socket, msg) {
    if (socket.hasOwnProperty("gameRoom")) {
		if (msg === "") {
			msg = `${socket.psd} left.`;
			socket.to(socket.gameRoom.namespace).emit("newMsg", "INFO", msg);
			socket.gameRoom.chat.push({psd: "INFO", msg});
		} else {
			if (socket.gameRoom.round.alreadyWon(socket)) {
				socket.emit("success!", "You have already found the word, now wait the others players :)");
				return ;
			}
			if (msg.toLowerCase() === socket.gameRoom.round.word) {
				if (socket.psd === socket.gameRoom.master.psd) {
					socket.emit("error!", "Don't do that hahaha");
					return ;
				}
				const msgToStore = {psd: "INFO", msg: `${socket.psd} found the word!`};
				socket.to(socket.gameRoom.namespace).emit("newMsg", msgToStore.psd, msgToStore.msg);
				socket.gameRoom.chat.push(msgToStore);
				socket.emit("newMsg", msgToStore.psd, msgToStore.msg);
				socket.gameRoom.round.newWinner(socket);
				return ;
			}
			socket.to(socket.gameRoom.namespace).emit("newMsg", socket.psd, msg);
			socket.gameRoom.chat.push({psd: socket.psd, msg});
			socket.emit("newMsg", socket.psd, msg);
		}
	} else {
		socket.emit("error!", "You need to be in a game in order to use the chat");
	}
}

function setupEvents(socket, dbo) {
	socket.on("newMsg", text => {
		if (socket.hasOwnProperty("psd") && text.length !== 0 && text.length <= 100) {
			newMsg(socket, text);
		}
	});
}