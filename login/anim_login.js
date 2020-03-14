const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let lastInterval = -1;

canvas.style.position = "absolute";
canvas.style.zIndex = "1";
canvas.width = innerWidth;
canvas.height = innerHeight;
canvas.style.left = "0px";
canvas.style.top = "0px";

ctx.fillStyle = "white";
ctx.strokeStyle = "yellow";
ctx.lineWidth = 1;


function getSign(sign, spot, target) {
    const baseSpots = [
        {x: 0, y: 0},
        {x: 0, y: innerHeight},
        {x: innerWidth, y: 0},
        {x: innerWidth, y: innerHeight}
    ];
    sign.x = (baseSpots[spot].x < target.x) ? 1 : -1;
    sign.y = (baseSpots[spot].y < target.y) ? 1 : -1;
}

document.body.onclick = e => {
    let grow = 1;
    if (lastInterval !== -1) {
        clearInterval(lastInterval);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let iter = 1;
    const spots = [
        {x: 0, y: 0},
        {x: 0, y: innerHeight},
        {x: innerWidth, y: 0},
        {x: innerWidth, y: innerHeight}
    ];

    const add = {
        x: e.clientX / 10,
        y: e.clientY / 10
    };

    const target = {
        x: e.clientX,
        y: e.clientY
    };

    lastInterval = setInterval(() => {
        
        for (let i = 0; i < spots.length; i++) {
            let sign = {
                x: 1,
                y: 1
            };
            getSign(sign, i, target);
            ctx.beginPath();
            ctx.moveTo(spots[i].x, spots[i].y);
            if (iter % 2) {
                spots[i].x += add.x * sign.x;
            } else {
                spots[i].y += add.y * sign.y;
            }
            ctx.lineTo(spots[i].x, spots[i].y);
            ctx.stroke();
        }
        iter++;
    }, 30);
}