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
		this.tools = document.getElementById("toolsPanel");
		this.hover = false;
		this.drawing = false;
		setTimeout(()=>{
			this.ctx = this.game.canvas.getContext("2d");
		}, 0);
		this.pen = {
			color: "black",
			size: 5,
			pos: []
		};
	}
	setupEvents() {
		const self = this;
		this.game.socket.on("wordOK", () => {
			this.game.toast.success("Word successfully set");
			this.game.hidePage(document.getElementById("chooseWord"));
			document.getElementById("chooseInput").value = "";
		});
		this.game.socket.on("drawLine", (x, y, pen) => {
			self.pen = pen;
			self.drawLine(x, y);
		});
		this.game.socket.on("drawPoint", (x, y, pen) => {
			self.pen = pen;
			self.drawPoint(x, y);
		});
		this.game.socket.on("clear", () => {
			self.clear();
		});
		this.setupWordChooser();
		this.settupHover();
		this.settupDrawingEvents();
		this.settupToolsEvents();
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
	settupHover() {
		const self = this;
		this.game.canvas.onmouseover = e => {
			self.hover = true;
		}
		this.game.canvas.onmouseout = e => {
			self.hover = false;
		}
	}
	settupDrawingEvents() {
		const self = this;
		this.game.canvas.onmousedown = e => {
			if (!self.hover) {
				return ;
			}
			if (e.buttons === 1) { // left click
				self.drawing = true;
			} else if (e.buttons === 2) {
				if (new Array(self.tools.classList).join("").match("transparent")) {
					self.tools.style.left = e.clientX + "px";
					self.tools.style.top = e.clientY + "px";
					self.tools.classList.remove("transparent");
				} else {
					self.tools.style.left = -200 + "px";
					self.tools.style.top = -200 + "px";
					self.tools.classList.add("transparent");
				}
			}
		}
		document.body.onmouseup = e => {
			if (e.which === 1) { // left click
				self.drawing = false;
				self.pen.pos.length = 0;
			}
		}
		this.game.canvas.oncontextmenu = () => {
			return (false);
		}
		this.game.canvas.onmousemove = e => {
			if (self.drawing) {
				const target = self.getTargetCoord(e.offsetX, e.offsetY);
				self.game.socket.emit("drawLine", target.x, target.y, self.pen);
			}
		}
		this.game.canvas.onclick = e => {
			const target = self.getTargetCoord(e.offsetX, e.offsetY);
			self.game.socket.emit("drawPoint", target.x, target.y, self.pen);
		}
	}
	getTargetCoord(offsetX, offsetY) {
		const canvas = this.game.canvas;
		const target = {
			x: offsetX / canvas.offsetWidth * canvas.width,
			y: offsetY / canvas.offsetHeight * canvas.height
		};
		target.x += (this.pen.size / 2);
		target.y += (this.pen.size / 2);
		return (target);
	}
	drawPoint(posX, posY) {
		this.ctx.fillStyle = this.pen.color;
		this.ctx.beginPath();
		this.ctx.arc(posX, posY, this.pen.size / 2, 0, Math.PI * 2);
		this.ctx.fill();
	}
	drawLine(posX, posY) {
		this.pen.pos.push({x: posX, y: posY});
		if (this.pen.pos.length === 1) {
			return ;
		}
		this.ctx.strokeStyle = this.pen.color;
		this.ctx.lineWidth = this.pen.size;
		this.ctx.beginPath();
		this.ctx.moveTo(this.pen.pos[0].x, this.pen.pos[0].y);
		this.ctx.lineTo(this.pen.pos[1].x, this.pen.pos[1].y);
		this.ctx.stroke();
		this.pen.pos.shift();
	}
	clear() {
		this.ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
	}
	settupToolsEvents() {
		const self = this;
		const colors = document.getElementById("colors").getElementsByClassName("color");
		for (let color of colors) {
			color.style.backgroundColor = color.getAttribute("color");
			color.onclick = e => {
				self.pen.color = color.getAttribute("color");
				self.tools.style.left = -200 + "px";
				self.tools.style.top = -200 + "px";
				self.tools.classList.add("transparent");
			}
		}
	}
}