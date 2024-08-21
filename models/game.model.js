const mongoose = require("mongoose");
const {CategorySchema} = require("../models/category.model.js");

const GameSchema = mongoose.Schema(
    {
        player1 : {
            type:String,
        },
        player2 : {
            type:String,
        },
        player1Score: {
            type:[Number]
        },
        player2Score: {
            type:[Number]
        },
        winner: {
            type:String,
        },
        categories: {
            type:[CategorySchema]
        }
    },
    {
        timestamps:true,
    }
);

const Game = mongoose.model("Game", GameSchema);
module.exports = Game;
