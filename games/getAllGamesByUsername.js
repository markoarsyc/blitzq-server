const getAllGamesByUsername = (socket, Game) => {
    socket.on("get-games-by-username", async (username) => {
        try {
            const games = await Game.find({
                $or: [{ player1: username }, { player2: username }]
            });
            socket.emit("games-list-by-username", games);
        } catch (error) {
            console.error("Error fetching games:", error);
            socket.emit("games-list-by-username", "Failed to retrieve games.");
        }
    });
}

module.exports = getAllGamesByUsername;
