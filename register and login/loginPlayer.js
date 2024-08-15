const loginPlayer = (socket, Player) => {
  socket.on("login", async (userCredentials) => {
    try {
      const player = await Player.findOne({
        username: userCredentials.username,
        password: userCredentials.password,
      });
      if(player) {
        socket.emit("login-status",player);
        console.log("Player with username " + player.username + " is logged in");
      } else {
        socket.emit("login-status",null);
        console.log("Player not found");
      }
    } catch (error) {
        console.log(error);
    }
  });

  socket.on("logout",(userCredentials)=>{
    console.log("Player with username " + userCredentials.username + " is logged out");
  })

};



module.exports = loginPlayer;
