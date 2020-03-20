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

class Pictionary {
	constructor (socket, toast) {
		this.socket = socket;
		this.toast = toast;
		this.chat = new ClientChat(this);
		this.controller = new DrawController(this);
		this.canvas = document.getElementById("canvas");
		this.setupEvents();
	}
	setupEvents() {
		this.chat.setupEvents();
		this.controller.setupEvents();
		this.socket.on("chooseWord", () => {
			this.showPage(document.getElementById("chooseWord"));
			document.getElementById("chooseInput").focus();
			this.controller.tools.hide();
		});
		this.socket.on("stopChoosing", () => {
			this.hidePage(document.getElementById("chooseWord"));
		});
		this.socket.on("flushActions", () => {
			this.controller.actions = {0: {type: "stop", pen: this.pen, x: 0, y: 0, id: 0}};
			this.controller.actionsComputed = 0;
			this.controller.actionsCount = 1;
		});
	}
	showPage(page) {
		page.classList.remove("notvisible");
	}
	hidePage(page) {
		page.classList.add("notvisible");
	}
}