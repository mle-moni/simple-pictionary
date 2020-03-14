class Pictionary {
	constructor (socket) {
		this.socket = socket;
		this.chat = new ClientChat(this);
	}
}