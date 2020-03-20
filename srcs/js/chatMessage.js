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

class ChatMessage {
	constructor (user, msg) {
		this.elem = document.createElement("div");
		const txtUser = this.createTxtUser(user);
		const txtMsg = this.createTxtMsg(user, msg)
		this.elem.appendChild(txtUser);
		this.elem.innerHTML += " : ";
		this.elem.appendChild(txtMsg);
	}
	createTxtUser(user) {
		const txtUser = document.createElement("h4");
		txtUser.innerText = user;
		txtUser.classList.add("chatTxtUser");
		return (txtUser);
	}
	createTxtMsg(user, msg) {
		const txtMsg = document.createElement("p");
		txtMsg.innerText = msg;
		txtMsg.classList.add("chatTxtMsg");
		if (user === "INFO") {
			txtMsg.classList.add("blueTxt");
		}
		return (txtMsg);
	}
}