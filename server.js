const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

//Database models imports
const Player = require("./models/player.model.js");
const { Category } = require("./models/category.model.js");
const Game = require("./models/game.model.js");

//Login and registration functions
const registerPlayer = require("./register and login/registerPlayer.js");
const loginPlayer = require("./register and login/loginPlayer.js");

//Categories and terms functions
const addNewCategory = require("./categories and terms/addNewCategory.js");
const getCategories = require("./categories and terms/getCategories.js");

//Game functions
const getWinner = require("./games/getWinner.js");
const createGame = require("./games/createGame.js");
const setGameWinner = require("./games/setGameWinner.js");
const setGameScores = require("./games/setGameScores.js");
const getGameById = require("./games/getGameByID.js");
const getAllGamesByUsername = require("./games/getAllGamesByUsername.js");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {},
});

let numberOfConnections = 0;
let gameRoomID = 0;
let playersInRoom = {};
let scores = [];
let currentGames = [];
let pendingScores = [];

io.on("connection", (socket) => {
  console.log("Client connected");
  console.log("Number of connected clients: " + ++numberOfConnections);

  // Registracija
  registerPlayer(socket, Player);

  // Login
  loginPlayer(socket, Player);

  //Posalji sve partije igracu
  getAllGamesByUsername(socket,Game);

  // Dodaj novu kategoriju
  addNewCategory(socket, Category);

  socket.on("waiting-game", () => {
    if (!playersInRoom[gameRoomID]) {
      playersInRoom[gameRoomID] = [];
    }

    playersInRoom[gameRoomID].push(socket.username);
    console.log(`Number of players in room ${gameRoomID} is ${playersInRoom[gameRoomID].length}`);

    socket.join(`room-${gameRoomID}`);

    // Pošalji ime protivnika ako je već neko prisutan u sobi
    const opponent = playersInRoom[gameRoomID].find(
      (username) => username !== socket.username
    );
    if (opponent) {
      socket.emit("opponent-username", opponent);
    }

    // Pošalji ime novom igraču u sobi
    socket.to(`room-${gameRoomID}`).emit("opponent-username", socket.username);

    if (playersInRoom[gameRoomID].length === 2) {
      io.to(`room-${gameRoomID}`).emit("start-game");
      console.log(`Game started in room ${gameRoomID}`);
      playersInRoom[gameRoomID] = [];
    }
  });

  socket.on("left-game",()=>{
    playersInRoom[gameRoomID].pop(socket.username);
    console.log(`Number of players in room ${gameRoomID}: ${playersInRoom[gameRoomID].length}`);
  })

  socket.on("game-started", async (player) => {
    try {
      playersInRoom[gameRoomID].push(player);

      if (playersInRoom[gameRoomID].length === 2) {
        const categories = await getCategories(socket, Category);
        const game = await createGame(
          socket,
          Game,
          playersInRoom[gameRoomID][0].username,
          playersInRoom[gameRoomID][1].username,
          categories
        );
        console.log(`Created game with id ${game._id}`);
        currentGames.push(game._id);

        io.to(`room-${gameRoomID}`).emit("game-started", game);
        console.log("Sent categories to room:", gameRoomID);
        // playersInRoom[gameRoomID] = [];
        // gameRoomID++;
      }
    } catch (error) {
      console.error("Error in 'game-started' event:", error);
    }
  });

  socket.on("game-over", (playerScore) => {
    console.log(`Player ${playerScore.player} has score: ${playerScore.scores}`);
    if(playerScore.player === playersInRoom[gameRoomID][0].username) {
      scores[0] = playerScore;
      console.log(`Player ${playerScore.player} is player 1`);
    } else {
      scores[1] = playerScore;
      console.log(`Player ${playerScore.player} is player 2`);
    }
    if (scores.length === 2 && scores[0] && scores[1]) {
      const winner = getWinner(scores[0], scores[1]);
      setGameScores(Game,currentGames[0],scores[0].scores,scores[1].scores);
      setGameWinner(Game,currentGames[0],winner);
      console.log(`The winner of game with id ${currentGames[0]} is ${winner}`);
      scores = []; // Resetujte scores nakon slanja rezultata
      playersInRoom[gameRoomID] = [];
    }
  });

  socket.on("score", async (player)=>{
    pendingScores.push(player);
    if(pendingScores.length === 2) {
      const game = await getGameById(Game,currentGames[0]);
      console.log(game);
      io.to(`room-${gameRoomID}`).emit("score", game);
      pendingScores = [];
      currentGames = [];
    }
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    console.log("Number of connected clients: " + --numberOfConnections);

    // Ukloni korisničko ime iz sobe
    if (socket.username) {
      playersInRoom[gameRoomID] = playersInRoom[gameRoomID]?.filter(
        (username) => username !== socket.username
      );
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
