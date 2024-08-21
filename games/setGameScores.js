const setGameScores = async (Game, gameId,score1,score2)=> {
    try {
        await Game.findByIdAndUpdate(gameId,{
            player1Score:score1,
            player2Score:score2
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = setGameScores;