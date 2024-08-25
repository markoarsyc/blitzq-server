const Player = require("../models/player.model.js");

//create player
const createPlayer = async (properties) => {
  try {
    const player = await Player.create(properties);
    return player;
  } catch (error) {
    console.error("Failed to create player", error);
  }
};

//read player
const readPlayer = async (properties) => {
  try {
    const player = await Player.findOne(properties);
    return player;
  } catch (error) {
    console.error("Failed to load player", error);
  }
};

module.exports = { createPlayer, readPlayer };
