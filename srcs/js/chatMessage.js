class ChatMessage {
	constructor (user, msg) {
		this.elem = document.createElement("div");
		const txtUser = this.createTxtUser(user);
		const txtMsg = this.createTxtMsg(msg)
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
	createTxtMsg(msg) {
		const txtMsg = document.createElement("p");
		txtMsg.innerText = msg;
		txtMsg.classList.add("chatTxtMsg");
		return (txtMsg);
	}
}