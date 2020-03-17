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
		this.tools.hide = () => {
			this.tools.style.left = -500 + "px";
			this.tools.style.top = -500 + "px";
			this.tools.classList.add("transparent");
		}
		this.tools.show = (x, y) => {
			this.tools.style.left = x - (this.tools.offsetWidth / 2) + "px";
			this.tools.style.top = y + 25  + "px";
			this.tools.classList.remove("transparent");
		}
		this.hover = false;
		this.drawing = false;
		setTimeout(()=>{
			this.ctx = this.game.canvas.getContext("2d");
		}, 0);
		this.pen = {
			color: "black",
			size: 5,
			actions: [{type: "stop", color: "", size: 0, x: 0, y: 0, id: 0}]
		};
		this.actionsCount = 0;
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
			const id = self.pen.actions[self.pen.actions.length - 1].id + 1;
			self.pen.actions.push({type: "line", color: pen.color, size: pen.size, x, y, id});
			if (self.pen.actions.length > 30) {
				self.pen.actions.shift();
			}
			self.tryToDraw();
		});
		this.game.socket.on("drawPoint", (x, y, pen) => {
			self.pen = pen;
			const id = pen.actions[pen.actions.length - 1].id + 1;
			self.pen.actions.push({type: "point", color: pen.color, size: pen.size, x, y, id});
			if (self.pen.actions.length > 30) {
				self.pen.actions.splice(0, 2);
			}
			self.tryToDraw();
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
			const pen = self.pen;
			if (pen.actions[pen.actions.length - 1].type !== "stop") {
				const id = self.pen.actions[self.pen.actions.length - 1].id + 1;
				self.pen.actions.push({type: "stop", color: "", size: 0, x: 0, y: 0, id});
			}
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
					this.tools.show(e.clientX, e.clientY);
				} else {
					this.tools.hide();
				}
			}
		}
		document.body.onmouseup = e => {
			if (e.which === 1) { // left click release
				self.drawing = false;
				if (self.pen.actions[self.pen.actions.length - 1].type !== "stop") {
					const id = self.pen.actions[self.pen.actions.length - 1].id + 1;
					self.pen.actions.push({type: "stop", color: "", size: 0, x: 0, y: 0, id});
				}
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
	drawPoint(posX, posY, color, size) {
		this.ctx.fillStyle = color;
		this.ctx.beginPath();
		this.ctx.arc(posX, posY, size / 2, 0, Math.PI * 2);
		this.ctx.fill();
	}
	drawLine(pos, next, color, size) {
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = size;
		this.ctx.beginPath();
		this.ctx.moveTo(pos.x, pos.y);
		this.ctx.lineTo(next.x, next.y);
		this.ctx.stroke();
	}
	getCursor(actions) {
		for (let i = actions.length - 1; i > 0; i--) {
			if (actions[i].id === this.actionsCount) {
				return (i);
			}
		}
		return (this.actionsCount);
	}
	tryToDraw() {
		this.pen.actions.sort((obj1, obj2) => obj1.id - obj2.id);
		let lastId = -1;
		let cursor = this.getCursor(this.pen.actions);
		for (let i = cursor; i < this.pen.actions.length; i++) {
			let action = this.pen.actions[i];
			if (lastId !== -1) {
				if (action.id !== lastId + 1) {
					console.log("bad order")
					return ;
				}
			}
			lastId = action.id;
			switch (action.type)  {
				case "point":
					this.drawPoint(action.x, action.y, action.color, action.size);
					this.actionsCount++;
				break;
				case "line":
					if (i + 1 >= this.pen.actions.length) {
						return ;
					}
					const next = this.pen.actions[i + 1];
					if (next.type !== "line") {
						break;
					}
					let pos = {x: action.x, y: action.y};
					let nextPos = {x: next.x, y: next.y};
					this.drawLine(pos, nextPos, action.color, action.size);
					this.actionsCount++;
				break;
				case "stop":
					this.actionsCount++;
				break;
			}
		}
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
				self.tools.hide();
			}
		}
	}
}