const registerPlayer = (socket,Player)=> {
    socket.on("register-player", async (playerCredentials)=>{
        try {
            const player = await Player.create(playerCredentials);
            socket.emit("registration-status",true);
        } catch (error) {
            console.log(error);
            socket.emit("registration-status", false);
        }
    })
}

module.exports = registerPlayer;