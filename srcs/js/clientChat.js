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

class ClientChat {
	constructor (game) {
		this.game = game;
		this.messages = [];
		this.chatInput = document.getElementById("chatInput");
		const self = this;
		this.chatInput.onkeydown = e => {
			if (e.keyCode === 13) {
				self.sendMessage(self.chatInput.value);

			}
		}
	}
	sendMessage(text) {
		if (text.length === 0 || text.length > 40) {
			this.game.toast.alert("Message too long or empty...");
			return ;
		}
		this.game.socket.emit("newMsg", text);
		this.chatInput.value = "";
	}
}