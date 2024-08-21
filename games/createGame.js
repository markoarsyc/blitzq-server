const createGame = async (socket,Game,p1,p2,categories)=> {
    try {
        const game = await Game.create({
            player1:p1,
            player2:p2,
            categories:categories
        });
        return game;
    } catch (error) {
        console.log(error);
        return null;
    }
}

module.exports = createGame;