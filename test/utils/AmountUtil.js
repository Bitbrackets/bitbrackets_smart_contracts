

module.exports = {
    expected: function (amountPerPlayer, players, winners, managerFee, ownerFee) {
        const totalBalance = players.length * amountPerPlayer;
        const totalFee = 100 - managerFee - ownerFee;
        const feePerPlayer = totalFee / winners.length;
        return totalBalance * (feePerPlayer / 100);
    }
};