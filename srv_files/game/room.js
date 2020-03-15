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

const chat = require("../chat");
const rooms = {};

module.exports = {
	setupEvents,
	rooms
};

class Room {
	constructor (socket, namespace="") {
		this.namespace = namespace;
		this.creatorPsd = socket.psd;
		this.master = socket.psd;
		this.scores = {}; // indexed like this: this.scores[socket.psd] = score;
		this.users = [];
		this.chat = [];
		this.users.push(socket);
		this.word = "";
		rooms[this.namespace] = this;
		socket.join(this.namespace);
		socket.emit("chooseWord", this.namespace);
		socket.emit("success!", `Room successfully created`);
	}
	kick(psd) {
		for (let i = 0; i < this.users.length; i++) {
			if (this.users[i].psd === psd) {
				if (this.master === psd) {
					this.nextMaster();
					chat.newMsg(this.users[i], "");
					this.word = "";
				}
				this.users.splice(i, 1);
				break ;
			}
		}
		if (this.users.length === 0) {
			delete(rooms[this.namespace]);
		}
	}
	nextMaster() {
		for (let i = 0; i < this.users.length; i++) {
			if (this.users[i].psd === this.master) {
				const masterSocket = this.users[(i + 1) % this.users.length];
				this.master = masterSocket.psd;
				masterSocket.emit("chooseWord");
				break ;
			}
		}
	}
	join(socket) {
		for (let i = 0; i < this.users.length; i++) {
			if (this.users[i].psd == socket.psd) {
				socket.emit("error!", "That's weird, it semms that you already are in this game");
				return ;
			}
		}
		socket.join(this.namespace);
		socket.gameRoom = this;
		this.users.push(socket);
		if (!this.scores.hasOwnProperty(socket.psd)) {
			this.scores[socket.psd] = 0;
		}
		socket.emit("getChat", this.chat);
		socket.emit("success!", `Successfully joined ${this.creatorPsd}'s room`);
	}
}

function setupEvents(socket, dbo) {
	chat.setupEvents(socket, dbo);

	socket.on("joinRoom", roomId => {
		if (!socket.hasOwnProperty("psd")) {
			return ;
		}
		if (socket.hasOwnProperty("gameRoom")) {
			socket.emit("error!", "You already are in a game room!");
			return ;
		}
		if (rooms.hasOwnProperty(roomId)) {
			rooms[roomId].join(socket);
		} else {
			socket.gameRoom = new Room(socket, roomId);
		}
	});

	socket.on("chosenWord", word => {
		if (!socket.hasOwnProperty("psd") || !socket.hasOwnProperty("gameRoom")) {
			socket.emit("error!", "Something went wrong!");
			return ;
		}
		if (isOk(word, socket)) {
			socket.gameRoom.word = word;
			socket.emit("wordOK");
		}
	});
}

function isOk(word, socket) {
	let ok = true;
	if (word === "") {
		ok = false;
	}
	if (socket.psd !== socket.gameRoom.master) {
		ok = false;
		socket.emit("error!", `You (${socket.psd}) are not the master (${socket.gameRoom.master})`);
	}
	return (ok);
}