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

function posTypeOK(x, y) {
	if (typeof(x) !== "number") {
		return (false);
	}
	if (typeof(y) !== "number") {
		return (false);
	}
	return (true);
}

function penOK(pen) {
	const properties = [
		{name: "color", type: "string"},
		{name: "size", type: "number"},
		{name: "actions", type: "object"}
	];
	return (verifObject(pen, properties));
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
	socket.on("drawLine", (x, y, pen) => {
		if (!socket.hasOwnProperty("psd") || !socket.hasOwnProperty("gameRoom")) {
			return ;
		}
		if (socket.psd !== socket.gameRoom.master) {
			return ;
		}
		if (!posTypeOK(x, y) || !penOK(pen)) {
			socket.emit("error!", "What u think u doin :joy:");
			return ;
		}
		socket.emit("drawLine", x, y, pen);
		socket.to(socket.gameRoom.namespace).emit("drawLine", x, y, pen);
	});
	
	socket.on("drawPoint", (x, y, pen) => {
		if (!socket.hasOwnProperty("psd") || !socket.hasOwnProperty("gameRoom")) {
			return ;
		}
		if (socket.psd !== socket.gameRoom.master) {
			return ;
		}
		if (!posTypeOK(x, y) || !penOK(pen)) {
			socket.emit("error!", "What u think u doin :joy:");
			return ;
		}
		socket.emit("drawPoint", x, y, pen);
		socket.to(socket.gameRoom.namespace).emit("drawPoint", x, y, pen);
	});
}