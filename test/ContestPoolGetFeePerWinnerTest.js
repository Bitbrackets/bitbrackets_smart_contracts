const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const leche = require('leche');
const withData = leche.withData;
const dateUtil = require('./utils/DateUtil');
const t = require('./utils/TestUtil').title;
const amount = require('./utils/AmountUtil').expected;

const { getScore, parseToInt } = require('./utils/ScoreUtil');

const Builder = require('./utils/ContestPoolBuilder');


/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
contract('ContestPoolGetFeePerWinnerTest', accounts => {
    let contestPoolInstance;
    const owner = accounts[0];
    const manager = accounts[1];
    const player1 = accounts[2];
    const player2 = accounts[3];
    const player3 = accounts[4];
    const player4 = accounts[5];
    const player5 = accounts[6];
    const player6 = accounts[7];
    const player7 = accounts[8];
    const player8 = accounts[9];
    const AVOID_DECIMALS = 100000000000000000

    beforeEach('Deploying contract for each test', async () => {
        contestPoolInstance = await ContestPoolMock.new(
            BbStorage.address,
            manager
        );
    });

    const defaultPrediction = [10101010, 01010101];
    const amountPerPlayer = web3.toWei(0.01, 'ether');

    players_1 = [player1];
    winners_1 = [player1];
    emptyPayments = [];

    withData({
        //_1_Pla1_Win1_fee10_10_Pay0: [players_1, winners_1, 10, 10, emptyPayments, 80],
        //_2_Pla2_Win1_fee05_05_Pay0: [[player1, player2], [player1],  5,  5, emptyPayments, 90],
        //_3_Pla2_Win2_fee10_10_Pay0: [[player1, player2], [player1, player2],  10,  10, emptyPayments, 40],
        _4_Pla2_Win2_fee10_10_Pay2: [[player1, player2], [player1, player2],  10,  10, [player1, player2], 40],
        _5_Pla3_Win2_fee10_10_Pay2: [[player1, player2, player3], [player1, player2],  10,  10, [player1, player2], 40],
        _6_Pla3_Win3_fee10_10_Pay2: [[player1, player2, player3], [player1, player2, player3],  10,  10, [player1, player2], 26.666666666666665]//,
        //_7_Pla3_Win3_fee10_10_Pay0: [[player1, player2, player3], [player1, player2, player3],  10,  10, [], 26.666666666666665]
    }, function(players, winners, ownerFee, managerFee, payments, expectedFeePerWinner) {
        it(t('anUser', 'getFeePerWinner', 'Should be equals to ' + expectedFeePerWinner + '.'), async function() {
            //Setup
            const builder = new Builder(contestPoolInstance);
            await builder.startTime(owner, 2018, 01, 5);
            await builder.endTime(owner, 2018, 01, 10);
            await builder.managerFee(owner, managerFee);
            await builder.winners(owner, winners);
            await builder.ownerFee(owner, ownerFee);
            await builder.amountPerPlayer(owner, amountPerPlayer);
            await builder.paymentsTrue(owner, payments);
            await builder.currentTime(owner, 2018, 01, 01);
            await builder.predictionsDef(amountPerPlayer, defaultPrediction, players);

            //Invocation
            const result = await contestPoolInstance._getFeePerWinner();
            
            //Assertions
            assert.equal(expectedFeePerWinner * AVOID_DECIMALS, parseInt(result));
        });
    });
});
