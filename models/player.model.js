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
        },
        games : {
            type:Number,
            default:0
        },
        win : {
            type:Number,
            default:0
        },
        defeat: {
            type:Number,
            default:0
        }
    },
    {
        timestamps:true
    }
);

const Player = mongoose.model("Player", PlayerSchema);
module.exports = Player;