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

const chat = require("./chat");
const draw = require("./draw");
const Round = require("./round");
const rooms = {};

module.exports = {
	setupEvents,
	rooms
};

class Room {
	constructor (socket, namespace="") {
		this.namespace = namespace;
		this.creatorPsd = socket.psd;
		this.master = socket;
		this.scores = {}; // indexed like this: this.scores[socket.psd] = score;
		this.users = [];
		this.chat = [];
		this.actions = {0: {type: "stop", pen: this.pen, x: 0, y: 0, id: 0}}; // indexed by actionID
		this.redoArray = []; // push action when ctrlZ, pop when ctrlY
		this.users.push(socket);
		this.roundTime = 90;
		this.choose = {
			time: 30,
			timeout: -1,
			startedAt: -1
		};
		this.round = new Round(this, "");
		rooms[this.namespace] = this;
		socket.join(this.namespace);
		socket.emit("chooseWord", this.namespace);
		socket.emit("success!", `Room successfully created`);
		socket.emit("newMsg", "INFO", `Use ctrl Z / Y to undo / redo actions`);
		socket.emit("newMsg", "INFO", `Click on the scroll button to fill an area`);
		socket.emit("newMsg", "INFO", `Hold the SHIFT key and click to create straight lines`);
	}
	kick(psd) {
		for (let i = 0; i < this.users.length; i++) {
			if (this.users[i].psd === psd) {
				chat.newMsg(this.users[i], "");
				if (this.master.psd === psd) {
					this.round.end();
				}
				this.users.splice(i, 1);
				break ;
			}
		}
		if (this.users.length === 0) {
			clearTimeout(this.round.timeout);
			clearTimeout(this.choose.timeout);
			delete(rooms[this.namespace]);
		}
	}
	nextMaster(justGetSocket=false) {
		for (let i = 0; i < this.users.length; i++) {
			if (this.users[i].psd === this.master.psd) {
				const nextMaster = this.users[(i + 1) % this.users.length];
				if (justGetSocket) {
					return (nextMaster);
				}
				this.master = nextMaster;
				this.master.emit("chooseWord");
				clearTimeout(this.choose.timeout);
				this.choose.startedAt = Date.now();
				this.choose.timeout = setTimeout(() => {
					if (this.users.length === 1) {
						return null;
					}
					const msg = `${this.master.psd} did not choose a word in time`;
					this.master.emit("newMsg", "INFO", msg);
					this.master.emit("stopChoosing");
					this.master.to(this.namespace).emit("newMsg", "INFO", msg);
					this.nextMaster();
				}, this.choose.time * 1000);
				return (nextMaster);
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
		socket.emit("isDrawing", this.master.psd);
		socket.emit("drawAll", this.actions);
		socket.emit("success!", `Successfully joined ${this.creatorPsd}'s room`);
		const msg = `${socket.psd} joined the game!`;
		socket.emit("newMsg", "INFO", msg);
		socket.to(socket.gameRoom.namespace).emit("newMsg", "INFO", msg);
		socket.gameRoom.chat.push({psd: "INFO", msg});
		socket.emit("newMsg", "INFO", `Use ctrl Z / Y to undo / redo actions`);
		socket.emit("newMsg", "INFO", `Click on the scroll button to fill an area`);
		socket.emit("newMsg", "INFO", `Hold the SHIFT key and click to create straight lines`);
	}
}

function setupEvents(socket, dbo) {
	chat.setupEvents(socket, dbo);
	draw.setupEvents(socket, dbo);

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
			clearTimeout(socket.gameRoom.choose.timeout);
			socket.gameRoom.round.nextRound(word.toLowerCase(), socket.gameRoom.roundTime);
			socket.emit("wordOK", socket.gameRoom.round.word);
			socket.emit("clear");
			socket.to(socket.gameRoom.namespace).emit("clear");
			socket.gameRoom.actions = {0: {type: "stop", pen: {color: "black", size: 5}, x: 0, y: 0, id: 0}};
			socket.emit("flushActions");
			socket.to(socket.gameRoom.namespace).emit("flushActions");
			socket.to(socket.gameRoom.namespace).emit("isDrawing", socket.psd);
		}
	});

	socket.on("getTimer", () => {
		if (!socket.hasOwnProperty("gameRoom")) {
			return ;
		}
		let startedAt, length;
		if (socket.gameRoom.round.word === "") {
			startedAt = socket.gameRoom.choose.startedAt;
			length = socket.gameRoom.choose.time;
		} else {
			startedAt = socket.gameRoom.round.startedAt;
			length = socket.gameRoom.roundTime;
		}
		socket.emit("getTimer", startedAt, length);
	});
}

function isOk(word, socket) {
	let ok = true;
	if (word === "") {
		ok = false;
	}
	if (socket.psd !== socket.gameRoom.master.psd) {
		ok = false;
		socket.emit("error!", `You (${socket.psd}) are not the master (${socket.gameRoom.master.psd})`);
	}
	return (ok);
}