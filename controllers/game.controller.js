const Game = require("../models/game.model.js");

//create game
const createGame = async (properties={})=> {
    try {
        const game = await Game.create(properties);
        return game;
    } catch (error) {
        console.log(error);
        return null;
    }
}

//read game
const readGame = async (id)=> {
    try {
        const game = await Game.findById(id);
        if (game) {
            return game;
        } else {
            console.log("An error occured while getting game");
            return null;
        }
    } catch (error) {
        console.log(error);
    }
}

//read all games
const readAllGames = async (properties) => {
    try {
        // const games = await Game.find({
        //     $or: [{ player1: username }, { player2: username }]
        // });
        const games = await Game.find(properties);
        return games;
    } catch (error) {
        console.error("Error fetching games:", error);
    }
}


//update game
const updateGame = async (id, properties) => {
    try {
        await Game.findByIdAndUpdate(id,properties);
    } catch (error) {
        console.log(error);
    }
};

module.exports = {createGame,readGame,readAllGames,updateGame};