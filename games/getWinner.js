const getWinner = (player1, player2)=> {
    let p1Score = 0, p2Score = 0;
    for (let i = 0; i < 3; i++) {
        if (player1.scores[i] > player2.scores[i]) {
            p1Score++;
        }
        if (player1.scores[i] < player2.scores[i]) {
            p2Score++
        }
    }
    if (p1Score > p2Score) {
        return player1.player;
    } else if (p1Score < p2Score) {
        return player2.player;
    } else {
        return "Nerešeno";
    }
}


module.exports = getWinner;