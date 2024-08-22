const mongoose = require("mongoose");

const PlayerSchema = mongoose.Schema(
    {
        firstName : {
            type:String,
            required:true
        },
        lastName : {
            type:String,
            required:true
        },
        mail : {
            type:String,
            required:true
        },
        username: {
            type:String,
            required:true,
            unique:true
        },
        password: {
            type:String,
            required:true
        }
    },
    {
        timestamps:true
    }
);

const Player = mongoose.model("Player", PlayerSchema);
module.exports = Player;