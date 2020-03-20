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

class Timer {
	constructor (socket) {
		this.element = document.getElementById("mainTimer");
		this.setupEvents(socket);
		setInterval(() => {
			socket.emit("getTimer");
		}, 1000);
	}
	setupEvents(socket) {
		socket.on("getTimer", (startedAt, length) => {
			const timeElapsed = Math.round((Date.now() - startedAt) / 1000);
			const timerTime = length - timeElapsed - 1;
			let newStr = `${timerTime}`;
			if (newStr.length > 3) {
				newStr = "...";
			}
			if (timerTime < 10) {
				this.element.classList.add("red");
				this.element.classList.remove("white");
				this.element.classList.remove("blue");
			} else {
				this.element.classList.add("white");
				this.element.classList.remove("red");
				this.element.classList.remove("blue");
			}
			if (timerTime < 0) {
				this.element.classList.add("blue");
				this.element.classList.remove("white");
				this.element.classList.remove("red");
				newStr = "0";
			}
			this.element.innerText = newStr;
		});
	}
}