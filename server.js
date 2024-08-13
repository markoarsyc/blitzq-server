const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

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
// let numberOfWaitingPlayers = 0;
// let gameRoomID = 1;

io.on("connection", (socket) => {
  console.log("Client connected");
  console.log("Number of connections: " + ++numberOfConnections);
  // socket.on("waiting-game",()=>{
  //   console.log(`Number of waiting players in room ${gameRoomID}: ${++numberOfWaitingPlayers} `);
  //   socket.join(`room-${gameRoomID}`);
  //   if (numberOfWaitingPlayers == 2) {
  //     io.to(`room-${gameRoomID}`).emit("game-started");
  //     console.log(`Game started in room ${gameRoomID}`);
  //     numberOfWaitingPlayers = 0;
  //     gameRoomID++;
  //   }
  // })

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    console.log("Number of connections: " + --numberOfConnections);
  });
});

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
