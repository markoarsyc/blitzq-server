const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

//Database models imports
const Player = require("./models/player.model.js");

//Login and registration functions
const registerPlayer = require('./register and login/registerPlayer.js');
const loginPlayer = require("./register and login/loginPlayer.js");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {},
});

let numberOfConnections = 0;
let gameRoomID = 1;
let playersInRoom = {};

io.on("connection", (socket) => {
  console.log("Client connected");
  console.log("Number of connected clients: " + ++numberOfConnections);
  
  // Registracija
  registerPlayer(socket, Player);

  // Login
  loginPlayer(socket, Player);

  socket.on("waiting-game", () => {
    if (!playersInRoom[gameRoomID]) {
      playersInRoom[gameRoomID] = [];
    }
    
    playersInRoom[gameRoomID].push(socket.username);

    socket.join(`room-${gameRoomID}`);

    // Pošalji ime protivnika ako je već neko prisutan u sobi
    const opponent = playersInRoom[gameRoomID].find(username => username !== socket.username);
    if (opponent) {
      socket.emit("opponent-username", opponent);
    }

    // Pošalji ime novom igraču u sobi
    socket.to(`room-${gameRoomID}`).emit("opponent-username", socket.username);

    if (playersInRoom[gameRoomID].length === 2) {
      io.to(`room-${gameRoomID}`).emit("game-started");
      console.log(`Game started in room ${gameRoomID}`);
      playersInRoom[gameRoomID] = [];
      gameRoomID++;
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    console.log("Number of connected clients: " + --numberOfConnections);

    // Ukloni korisničko ime iz sobe
    if (socket.username) {
      playersInRoom[gameRoomID] = playersInRoom[gameRoomID]?.filter(username => username !== socket.username);
    }
  });
});

//Konekcija sa bazom i pokretanje servera
mongoose
  .connect(
    "mongodb+srv://markokaca:mG3UwuthRwZkv87b@blitzq.jtbbf.mongodb.net/BlitzQ?retryWrites=true&w=majority&appName=BlitzQ"
  )
  .then(() => {
    console.log("Connected to database");
    httpServer.listen(3005, () => {
      console.log("Server is running on port 3005!");
    });
  })
  .catch(() => {
    console.log("Unnable to connect");
  });
