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

class Round {
	constructor(gameRoom, word, time=-1) {
		this.gameRoom = gameRoom;
		this.nextRound(word, time);
	}
	nextRound(word, time=-1) {
		this.word = word;
		this.winners = [];
		clearTimeout(this.timeout);
		this.startedAt = Date.now();
		if (time !== -1) {
			this.timeout = setTimeout(() => {
				if (this.gameRoom.users.length === 1) {
					return ;
				}
				this.end();
			}, time * 1000);
		} else {
			this.timeout = -1;
		}
	}
	alreadyWon(socket) {
		for (let i = 0; i < this.winners.length; i++) {
			if (this.winners[i].psd === socket.psd) {
				return (true);
			}
		}
		return (false);
	}
	newWinner(socket) {
		this.winners.push(socket);
		if (this.winners.length === this.gameRoom.users.length - 1) {
			socket.gameRoom.round.end();
		}
	}
	addScore(user, score) {
		if (this.gameRoom.scores[user]) {
			this.gameRoom.scores[user] += score;
		} else {
			this.gameRoom.scores[user] = score;
		}
	}
	writeScores() {
		let total = 0;
		for (let i = 0; i < this.winners.length; i++) {
			switch (i) {
				case 0:
					this.addScore(this.winners[i].psd, 5);
					total += 5;
				break;
				case 1:
					this.addScore(this.winners[i].psd, 3);
					total += 3;
				break;
				case 2:
					this.addScore(this.winners[i].psd, 2);
					total += 2;
				break;
				default:
					this.addScore(this.winners[i].psd, 1);
					total += 1;
				break;
			}
		}
		const drawerScore = Math.ceil(total / 2);
		this.addScore(this.gameRoom.master.psd, drawerScore);
		return (drawerScore);
	}
	end() {
		const drawerScore = this.writeScores();
		const scores = this.gameRoom.scores;
		const roundWinners = this.winners.map(socket => socket.psd);
		const drawerObj = {psd: this.gameRoom.master.psd, score: drawerScore};
		this.gameRoom.nextMaster(true).to(this.gameRoom.namespace).emit("displayScores", scores, roundWinners, drawerObj);
		const msg = `End of the round, the word was ${this.word || "not defined yet"}`;
		this.gameRoom.master.emit("newMsg", "INFO", msg);
		this.gameRoom.master.to(this.gameRoom.namespace).emit("newMsg", "INFO", msg);
		this.gameRoom.chat.push({psd: "INFO", msg});
		this.word = "";
		this.winners.length = 0;
		clearTimeout(this.timeout);
		this.gameRoom.nextMaster();
	}
}

module.exports = Round;