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

const toast = siiimpleToast;

(function () {
	function automaticReconnection(connectObj, innerSocket) {
		if (connectObj.psd !== null && connectObj.passwd !== null) {
			innerSocket.emit("connectemoistp", connectObj, "lazy");
		} else {
			sessionStorage.setItem("goTo", location.pathname+location.search);
			location.replace("/login");
		}
	}
	let appReady = false;
	const innerSocket = io.connect(location.origin, {secure: true, rejectUnauthorized: true});
	
	if (localStorage.getItem('psd')) {
		sessionStorage.setItem('psd', localStorage.getItem('psd'))
	}
	if (localStorage.getItem('passwd')) {
		sessionStorage.setItem('passwd', localStorage.getItem('passwd'))
	}
	const connectObj = {
		psd: sessionStorage.getItem('psd'),
		passwd: sessionStorage.getItem('passwd')
	};
	automaticReconnection(connectObj, innerSocket);
	
	// try to keep alive the socket
	setInterval(()=>{
		automaticReconnection(connectObj, innerSocket);
	}, 2000);

	const game = new Pictionary(innerSocket, toast);
    
	// sockets events
	
	// DEBUG MODE ONLY, A RETIRER !!!
	window.socket = innerSocket;
	
	innerSocket.on("logAndComeBack", ()=>{
		sessionStorage.setItem("goTo", location.pathname+location.search);
		location.replace("/login");
	});

	innerSocket.on("deco", ()=>{
		sessionStorage.clear();
		localStorage.clear();
		sessionStorage.setItem("goTo", location.pathname+location.search);
	    location.replace("/login");
	});

	innerSocket.on("error!", (err)=>{
		toast.alert(err, {duration: 7000});
		console.error(err)
	});
	
	innerSocket.on("success!", (msg, action)=>{
		console.log(msg);
		toast.success(msg);
		if (typeof(action) === "string") {
			eval(action);
		}
	});

	innerSocket.on("MAJ", (txt)=>{
		alert(txt);
		location.reload();
	});

	window.onfocus = () => {
		automaticReconnection(connectObj, innerSocket);
	}
	document.onvisibilitychange = function(e) { 
		if (document.visibilityState === "visible")
			automaticReconnection(connectObj, innerSocket);
	};

	innerSocket.on("tryAutomaticReco", ()=>{
		if (document.visibilityState === "visible")
			automaticReconnection(connectObj, innerSocket);
	});

	innerSocket.on("succes_co", ()=>{
		appReady = true;
		toast.success("Connected");
		console.log("Ready, app is now usable");
		if (location.search !== "") {
			const room = location.search.slice(1);
			console.log(`We will try to join ${room}`);
			socket.emit("joinRoom", room);
		}
	});

	innerSocket.on("disconnect", ()=>{
		appReady = false;
		toast.alert("Connection lost");
		console.error("Disconnected, app is no longer usable");
		setTimeout(()=>{
			automaticReconnection(connectObj, innerSocket);
		}, 500);
	});
	
	innerSocket.on("log", (txt)=>{
		console.log(txt)
	});
})();