const getGameById = async (Game,gameId)=> {
    try {
        const game = await Game.findById(gameId);
        if (game) {
            return game;
        } else {
            return null;
            console.log("An error occured while getting game");
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = getGameById;