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

const Hashes = require('jshashes');
const chat = require("../chat");
const rooms = {};

module.exports = {
	setupEvents,
	rooms
};

class Room {
	constructor (socket, namespace="") {
		if (namespace === "") {
			this.namespace = this.namespaceGen(socket.psd);
		} else {
			this.namespace = namespace;
		}
		this.creatorPsd = socket.psd;
		this.master = socket.psd;
		this.scores = {}; // indexed like this: this.scores[socket.psd] = score;
		this.users = [];
		this.chat = [];
		this.users.push(socket);
		rooms[this.namespace] = this;
		socket.join(this.namespace);
		socket.emit("choseWord", this.namespace);
		socket.emit("success!", `Room succesfully created`);
	}
	namespaceGen(psd) {
		const time = new Hashes.SHA256().b64(Date.now().toString());
		const namespace = `${time}_${psd}`;
		return (namespace);
	}
	kick(psd) {
		for (let i = 0; i < this.users.length; i++) {
			if (this.users[i].psd === psd) {
				if (this.master === psd) {
					this.master = this.nextMaster();
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
				this.master = this.users[(i + 1) % this.users.length].psd;
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
		socket.emit("getChat", this.chat);
		socket.emit("success!", `Succesfully joined ${this.creatorPsd}'s room`);
	}
}

function setupEvents(socket, dbo) {
	chat.setupEvents(socket, dbo);
	socket.on("createRoom", () => {
		if (!socket.hasOwnProperty("psd")) {
			return ;
		}
		if (socket.hasOwnProperty("gameRoom")) {
			socket.emit("error!", "You already are in a game room!");
			return ;
		}
		socket.gameRoom = new Room(socket);
	});

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
}