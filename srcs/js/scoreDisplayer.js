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

/*
* displayScore() takes a "scores" object and insert this kind of componant in the HTML:

	<div class="score">
		<p class="rank">1:</p>
		<p class="psd">Redz</p>
		<p>→</p>
		<p class="actualScore">1392</p>
	</div>

*/

function displayScore(scores, roundWinners, drawerObj) {
	const scoresNode = document.getElementById("scores");
	scoresNode.innerHTML = "";
	const scoresArr = [];
	for (key in scores) {
		scoresArr.push({psd: key, score: scores[key], gain: 0});
		scores[key] = scoresArr.length - 1;
	}
	scoresArr.sort((obj1, obj2) => obj2.score - obj1.score);
	for (let i = 0; i < roundWinners.length; i++) {
		scoresArr[scores[roundWinners[i]]].gain = getScoreByIndex(i);
	}
	scoresArr[scores[drawerObj.psd]].gain = drawerObj.score;
	for (let i = 0; i < scoresArr.length; i++) {
		const scoreElem = getNewScoreElem(i + 1, scoresArr[i].psd, scoresArr[i].score, scoresArr[i].gain);
		scoresNode.appendChild(scoreElem);
	}
}

function getNewScoreElem(rankNum, psdStr, scoreNum, gainNum) {
	const scoreElem = document.createElement("div");
	scoreElem.classList.add("score");
	const rank = document.createElement("p");
	rank.classList.add("rank");
	rank.innerText = `${rankNum}:`;
	const psd = document.createElement("p");
	psd.classList.add("psd");
	psd.innerText = psdStr;
	const arrow = document.createElement("p");
	arrow.innerText = "→";
	const actualScore = document.createElement("p");
	actualScore.classList.add("actualScore");
	actualScore.innerText = `${scoreNum} (${scoreNum - gainNum} `;
	const span = document.createElement("span");
	span.classList.add("green");
	span.innerText = `+${gainNum}`;
	actualScore.appendChild(span);
	actualScore.innerHTML += "<span>)</span>";
	scoreElem.appendChild(rank);
	scoreElem.appendChild(psd);
	scoreElem.appendChild(arrow);
	scoreElem.appendChild(actualScore);
	return (scoreElem)
}

function getScoreByIndex(index) {
	switch (index) {
		case 0:
			return (5);
		case 1:
			return (3);
		case 2:
			return (2);
		default:
			return (1);
	}
}

function setScoreDisplayer(game) {
	const scorePage = document.getElementById("scorePage");
	game.socket.on("displayScores", (scores, roundWinners, drawerObj) => {
		displayScore(scores, roundWinners, drawerObj);
		game.showPage(scorePage);
	});
	document.getElementById("hideScores").onclick = () => {
		game.hidePage(scorePage);
	};
}