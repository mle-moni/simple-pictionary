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

function setupEvents(socket, dbo) {
	socket.on("ctrlZ", actionID => {
		controlZ(socket, actionID, true);
	});
	socket.on("ctrlY", actionID => {
		controlY(socket, actionID, true);
	});
}

function controlY(socket, actionID, redoStop) {
	if (!socket.hasOwnProperty("psd") || !socket.hasOwnProperty("gameRoom")) {
		return ;
	}
	if (socket.psd !== socket.gameRoom.master.psd) {
		socket.emit("drawAll", socket.gameRoom.actions);
		return ;
	}
	const action = socket.gameRoom.redoArray.pop();
	if (!action) {
		socket.emit("drawAll", socket.gameRoom.actions, actionID);
		return ;
	}
	if (socket.gameRoom.actions[actionID] || (actionID != 0 && !socket.gameRoom.actions[actionID - 1])) {
		socket.emit("error!", "Bad request");
		return ;
	}
	socket.gameRoom.actions[actionID] = action;
	if (action.type === "line") {
		controlY(socket, actionID + 1), false;
		return ;
	}
	if (action.type === "stop") {
		if (redoStop) {
			controlY(socket, actionID + 1), true;
			return ;
		}
		const redoArray = socket.gameRoom.redoArray;
		if (redoArray.length && redoArray[redoArray.length - 1].type === "stop") {
			controlY(socket, actionID + 1), false;
			return ;
		}
	}
	socket.emit("drawAll", socket.gameRoom.actions, actionID + 1);
	socket.to(socket.gameRoom.namespace).emit("drawAll", socket.gameRoom.actions);
}

function controlZ(socket, actionID, deleteStop) {
	if (!socket.hasOwnProperty("psd") || !socket.hasOwnProperty("gameRoom")) {
		return ;
	}
	if (socket.psd !== socket.gameRoom.master.psd) {
		socket.emit("drawAll", socket.gameRoom.actions);
		return ;
	}
	const action = socket.gameRoom.actions[actionID];
	if (!action) {
		socket.emit("drawAll", socket.gameRoom.actions, actionID + 1);
		return ;
	}
	if (socket.gameRoom.actions[actionID + 1]) {
		socket.emit("error!", "Bad request");
		return ;
	}
	delete(socket.gameRoom.actions[actionID]);
	socket.gameRoom.redoArray.push(action);
	if (action.type === "line") {
		const actions = socket.gameRoom.actions;
		if (actions[actionID - 1] && actions[actionID - 1].type === "line") {
			controlZ(socket, actionID - 1, false);
			return ;
		}
	}
	if (action.type === "stop" && deleteStop) {
		controlZ(socket, actionID - 1, true);
		return ;
	}
	socket.emit("drawAll", socket.gameRoom.actions, actionID);
	socket.to(socket.gameRoom.namespace).emit("drawAll", socket.gameRoom.actions);
}