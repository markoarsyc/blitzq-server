const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

//Controllers
const {
  createPlayer,
  readPlayer,
} = require("./controllers/player.controller.js");

const {
  createGame,
  readGame,
  readAllGames,
  updateGame,
} = require("./controllers/game.controller.js");

const { createCategory, readAllCategories } = require("./controllers/category.controller.js");

//Additional functions
const getWinner = require("./additional functions/getWinner.js");
const getRandomElements = require("./additional functions/getRandomElements.js");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {},
});

//Global variables
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
  socket.on("register-player", async (playerCredentials) => {
    const player = await createPlayer(playerCredentials);
    if (player) {
      console.log(
        `New player with username ${player.username} added to database`
      );
      socket.emit("registration-status", true);
    } else {
      console.log("Unable to create player");
      socket.emit("registration-status", false);
    }
  });

  // Prijava
  socket.on("login", async (playerCredentials) => {
    const player = await readPlayer(playerCredentials);
    if (player) {
      socket.emit("login-status", player);
      socket.username = player.username;
      console.log("Player with username " + player.username + " is logged in");
    } else {
      socket.emit("login-status", null);
      console.log("Player not found");
    }
  });

  // Odjava
  socket.on("logout", () => {
    console.log("Player with username " + socket.username + " is logged out");
    socket.username = null;
  });

  //Posalji sve partije igracu
  socket.on("get-games-by-username", async () => {
    const games = await readAllGames({
      $or: [{ player1: socket.username }, { player2: socket.username }],
    });
    if (games) {
      socket.emit("games-list-by-username", games);
    } else {
      console.error("Error fetching games:", error);
      socket.emit("games-list-by-username", "Failed to retrieve games.");
    }
  });

  // Dodaj novu kategoriju
  socket.on("add-category", async (userCategory) => {
    const category = await createCategory(userCategory);
    if (category) {
      console.log(
        `Category "${category.title}" successfully added to database`
      );
      socket.emit("add-category-status", true);
    } else {
      console.log(`An error occured when user tried to add new category`);
      socket.emit("add-category-status", false);
    }
  });

  socket.on("waiting-game", () => {
    if (!playersInRoom[gameRoomID]) {
      playersInRoom[gameRoomID] = [];
    }

    playersInRoom[gameRoomID].push(socket.username);
    console.log(
      `Number of players in room ${gameRoomID} is ${playersInRoom[gameRoomID].length}`
    );

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

  socket.on("left-game", () => {
    playersInRoom[gameRoomID].pop(socket.username);
    console.log(
      `Number of players in room ${gameRoomID}: ${playersInRoom[gameRoomID].length}`
    );
  });

  socket.on("game-started", async () => {
    try {
      playersInRoom[gameRoomID].push(socket.username);
      console.log(socket.username);
      if (playersInRoom[gameRoomID].length === 2) {
        const allCategories = await readAllCategories();
        const categories = getRandomElements(allCategories,3);
        const game = await createGame({
          categories: categories,
          player1: playersInRoom[gameRoomID][0],
          player2: playersInRoom[gameRoomID][1],
        });
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
    console.log(
      `Player ${playerScore.player} has score: ${playerScore.scores}`
    );
    if (playerScore.player === playersInRoom[gameRoomID][0]) {
      scores[0] = playerScore;
      console.log(`Player ${playerScore.player} is player 1`);
    } else {
      scores[1] = playerScore;
      console.log(`Player ${playerScore.player} is player 2`);
    }
    if (scores.length === 2 && scores[0] && scores[1]) {
      const gameWinner = getWinner(scores[0], scores[1]);
      updateGame(currentGames[0], {
        player1Score: scores[0].scores,
        player2Score: scores[1].scores,
        winner: gameWinner,
      });
      scores = []; // Resetujte scores nakon slanja rezultata
      playersInRoom[gameRoomID] = [];
    }
  });

  socket.on("score", async (player) => {
    pendingScores.push(player);
    if (pendingScores.length === 2) {
      const game = await readGame(currentGames[0]);
      console.log(game);
      io.to(`room-${gameRoomID}`).emit("score", game);
      pendingScores = [];
      currentGames = [];
    }
  });

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
