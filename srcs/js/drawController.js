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
		};
		this.actions = {0: {type: "stop", pen: this.pen, x: 0, y: 0, id: 0}};
		this.actionsCount = 1;
		this.actionsComputed = 0;
		this.canUseCtrl = true;
		this.canDrawPoint = true;
		this.straight = false;
	}
	setupEvents() {
		this.game.socket.on("wordOK", (word) => {
			this.game.toast.success("Word successfully set");
			this.game.hidePage(document.getElementById("chooseWord"));
			document.getElementById("whoIsDrawing").innerText = `You word is: ${word}`;
			document.getElementById("chooseInput").value = "";
		});
		this.game.socket.on("draw", (action) => {
			this.actions[action.id] = action;
			this.tryToDraw();
		});
		this.game.socket.on("drawAll", (actions, num=0) => {
			this.clear();
			this.actionsCount = num;
			this.actionsComputed = 0;
			this.actions = actions;
			this.tryToDraw();
			this.canUseCtrl = true;
		});
		this.game.socket.on("clear", () => {
			this.clear();
			this.actions = {0: {type: "stop", pen: this.pen, x: 0, y: 0, id: 0}};
			this.actionsCount = 1;
			this.actionsComputed = 0;
		});
		this.game.socket.on("isDrawing", psd => {
			document.getElementById("whoIsDrawing").innerText = `${psd} is drawing...`;
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
			if (!self.hover) {
				const lastID = self.actionsCount - 1;
				if (!self.straight && self.actions[lastID] && self.actions[lastID].type !== "stop") {
					self.game.socket.emit("draw", {type: "stop", pen: self.pen, x: 0, y: 0, id: self.actionsCount++});
				}
			} 
			self.hover = true;
		}
		this.game.canvas.onmouseout = e => {
			self.hover = false;
			const lastID = self.actionsCount - 1;
			if (!self.straight && self.actions[lastID] && self.actions[lastID].type !== "stop") {
				self.game.socket.emit("draw", {type: "stop", pen: self.pen, x: 0, y: 0, id: self.actionsCount++});
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
			} else if (e.buttons === 2) { // right click
				if (new Array(self.tools.classList).join("").match("transparent")) {
					this.tools.show(e.clientX, e.clientY);
				} else {
					this.tools.hide();
				}
			} else if (e.buttons === 4) { // scroll click
				const target = self.getTargetCoord(e.offsetX, e.offsetY);
				self.game.socket.emit("draw", {type: "fill", pen: self.pen, x: target.x, y: target.y, id: self.actionsCount++});
			}
		}
		document.body.onmouseup = e => {
			if (e.which === 1) { // left click release
				self.drawing = false;
				const lastID = self.actionsCount - 1;
				if (!self.straight && self.actions[lastID] && self.actions[lastID].type !== "stop") {
					self.game.socket.emit("draw", {type: "stop", pen: self.pen, x: 0, y: 0, id: self.actionsCount++});
				}
			}
		}
		this.game.canvas.oncontextmenu = () => {
			return (false);
		}
		this.game.canvas.onmousemove = e => {
			if (self.drawing && !self.straight) {
				const target = self.getTargetCoord(e.offsetX, e.offsetY);
				this.canDrawPoint = false;
				self.game.socket.emit("draw", {type: "line", pen: self.pen, x: target.x, y: target.y, id: self.actionsCount++});
			}
		}
		this.game.canvas.onclick = e => {
			const target = self.getTargetCoord(e.offsetX, e.offsetY);
			if (self.straight) {
				self.game.socket.emit("draw", {type: "line", pen: self.pen, x: target.x, y: target.y, id: self.actionsCount++});
				return ;
			}
			if (self.canDrawPoint) {
				self.game.socket.emit("draw", {type: "point", pen: self.pen, x: target.x, y: target.y, id: self.actionsCount++});
			} else {
				self.canDrawPoint = true;
				self.game.socket.emit("draw", {type: "stop", pen: self.pen, x: 0, y: 0, id: self.actionsCount++});
			}
		}
	}
	getTargetCoord(offsetX, offsetY) {
		const canvas = this.game.canvas;
		const target = {
			x: offsetX / canvas.offsetWidth * canvas.width,
			y: offsetY / canvas.offsetHeight * canvas.height
		};
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
		this.ctx.lineCap = "round";
		this.ctx.moveTo(pos.x, pos.y);
		this.ctx.lineTo(next.x, next.y);
		this.ctx.stroke();
	}
	tryToDraw() {
		let action = this.actions[this.actionsComputed];
		while ((action = this.actions[this.actionsComputed])) {
			switch (action.type)  {
				case "point":
					this.drawPoint(action.x, action.y, action.pen.color, action.pen.size);
					this.actionsComputed++;
				break;
				case "line":
					const next = this.actions[this.actionsComputed + 1];
					if (!next) {
						return ;
					}
					if (next.type !== "line") {
						this.actionsComputed++;
						break;
					}
					let pos = {x: action.x, y: action.y};
					let nextPos = {x: next.x, y: next.y};
					this.drawLine(pos, nextPos, action.pen.color, action.pen.size);
					this.actionsComputed++;
				break;
				case "fill":
					this.ctx.fillStyle = action.pen.color;
					this.ctx.fillFlood(Math.round(action.x), Math.round(action.y), 20);
					this.actionsComputed++;
				break;
				case "stop":
					this.actionsComputed++;
				break;
			}
		}
	}
	clear() {
		this.ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);
		this.ctx.fillStyle = "rgb(255, 255, 255)";
		this.ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
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
		const sizes = document.getElementById("sizes").getElementsByClassName("size");
		for (let size of sizes) {
			const elem = size.getElementsByTagName("span")[0];
			elem.style.width = size.getAttribute("size") * 2 + "px";
			elem.style.height = size.getAttribute("size") * 2 + "px";
			size.onclick = e => {
				self.pen.size = parseInt(size.getAttribute("size"));
				self.tools.hide();
			}
		}
		document.getElementById("reset").onclick = () => {
			self.game.socket.emit("clear");
			self.tools.hide();
		}
		self.game.canvas.onwheel = e => {
			if (e.deltaY < 0) {
				if (self.pen.size < 50) {
					self.pen.size++;
				}
			} else {
				if (self.pen.size > 1) {
					self.pen.size--;
				}
			}
		}
		const Z = 90, Y = 89, SHIFT = 16;
		document.onkeydown = e => {
			if (e.keyCode === SHIFT) { // SHIFT key is down, we will draw straight lines instead of points
				self.straight = true;
			}
			if (e.ctrlKey && self.canUseCtrl) {
				if (e.keyCode === Z) {
					self.game.socket.emit("ctrlZ", this.actionsCount - 1);
					self.canUseCtrl = false;
				} else if (e.keyCode === Y) {
					self.game.socket.emit("ctrlY", this.actionsCount);
					self.canUseCtrl = false;
				}
			}
		}

		document.onkeyup = e => {
			if (e.keyCode === SHIFT) {
				self.straight = false;
				self.game.socket.emit("draw", {type: "stop", pen: self.pen, x: 0, y: 0, id: self.actionsCount++});
			}
		}
	}
}