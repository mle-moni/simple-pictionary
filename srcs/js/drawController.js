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

class DrawController {
	constructor (game) {
		this.game = game;

	}
	setupEvents() {
		const self = this;
		this.game.socket.on("wordOK", () => {
			this.game.toast.success("Word successfully set");
			this.game.hidePage(document.getElementById("chooseWord"));
			document.getElementById("chooseInput").value = "";
		});
		this.setupWordChooser();
	}
	setupWordChooser() {
		const input = document.getElementById("chooseInput");
		const self = this;
		input.onkeydown = e => {
			if (e.keyCode === 13) {
				if (input.value === "") {
					self.game.toast.alert("Field is empty", {duration: 7000});
					return ;
				}
				self.game.socket.emit("chosenWord", input.value);
			}
		}
	}
}