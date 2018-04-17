
/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
module.exports = {
    expected: function (amountPerPlayer, players, winners, managerFee, ownerFee) {
        const totalBalance = players.length * amountPerPlayer;
        const totalFee = 100 - managerFee - ownerFee;
        const feePerPlayer = totalFee / winners.length;
        return totalBalance * (feePerPlayer / 100);
    }
};