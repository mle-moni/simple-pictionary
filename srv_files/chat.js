module.exports = {
    newMsg: newMsg
};

function newMsg(socket, msg) {
    let ok = true;

    socket.broadcast.emit("newMsg", msg);
    socket.emit("newMsg", msg);
}