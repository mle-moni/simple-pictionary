class Pictionary {
	constructor (socket, toast) {
		this.socket = socket;
		this.toast = toast;
		this.chat = new ClientChat(this);
	}
}