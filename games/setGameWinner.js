const setGameWinner = async (Game, gameId,winner)=> {
    try {
        await Game.findByIdAndUpdate(gameId,{
            winner
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = setGameWinner;