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
	setupEvents
};

function actionOK(action) {
	let properties = [
		{name: "type", type: "string"},
		{name: "pen", type: "object"},
		{name: "x", type: "number"},
		{name: "y", type: "number"},
		{name: "id", type: "number"}
	];
	if (!verifObject(action, properties)) {
		return (false);
	}
	properties = [
		{name: "color", type: "string"},
		{name: "size", type: "number"}
	];
	if (!verifObject(action.pen, properties)) {
		return (false);
	}
	return (true);
}

function verifObject(obj, propArr) {
	for (let i = 0; i < propArr.length; i++) {
		if (!obj.hasOwnProperty(propArr[i].name)) {
			return (false);
		}
		if (typeof(obj[propArr[i].name]) !== propArr[i].type) {
			return (false);
		}
	}
	return (true);
}

function setupEvents(socket, dbo) {
	socket.on("draw", (action) => {
		if (!socket.hasOwnProperty("psd") || !socket.hasOwnProperty("gameRoom")) {
			return ;
		}
		if (socket.psd !== socket.gameRoom.master) {
			return ;
		}
		if (!actionOK(action)) {
			socket.emit("error!", "What u think u doin :joy:");
			return ;
		}
		socket.gameRoom.actions[action.id] = action;
		socket.emit("draw", action);
		socket.to(socket.gameRoom.namespace).emit("draw", action);
	});
	socket.on("clear", () => {
		if (!socket.hasOwnProperty("psd") || !socket.hasOwnProperty("gameRoom")) {
			return ;
		}
		if (socket.psd !== socket.gameRoom.master) {
			return ;
		}
		socket.gameRoom.actions = {0: {type: "stop", pen: this.pen, x: 0, y: 0, id: 0}};
		socket.emit("clear");
		socket.to(socket.gameRoom.namespace).emit("clear");
	});
}