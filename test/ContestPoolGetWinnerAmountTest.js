const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const leche = require('leche');
const withData = leche.withData;
const dateUtil = require('./utils/DateUtil');
const t = require('./utils/TestUtil').title;
const amount = require('./utils/AmountUtil').expected;

const Builder = require('./utils/ContestPoolBuilder');


/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
contract('ContestPoolGetWinnerAmountTest', accounts => {
    let contestPoolInstance;
    const defaultPrediction = [15,10,11];
    const owner = accounts[0];
    const manager = accounts[1];
    const player1 = accounts[2];
    const player2 = accounts[3];
    const player3 = accounts[4];
    const player4 = accounts[5];
    const player5 = accounts[6];
    const player6 = accounts[7];
    const amountPerPlayer = web3.toWei(0.001, 'ether');
    const player7 = accounts[8];
    const player8 = accounts[9];

    beforeEach('Deploying contract for each test', async () => {
        contestPoolInstance = await ContestPoolMock.new(
            BbStorage.address,
            manager
        );
    });

    // _2Winners
    const _1_winners = [player3, player5];
    const _1_players = [player3, player5];
    const _1_payments = [];
    const _1_expectedAmount = amount(amountPerPlayer, _1_winners, _1_winners, 10, 10);
    // _1Winner
    const _2_winners = [player1];
    const _2_players = [player1];
    const _2_payments = [];
    const _2_expectedAmount = amount(amountPerPlayer, _2_winners, _2_winners, 10, 10);
    // _3Winner
    const _3_winners = [player1, player2, player3];
    const _3_players = [player1, player2, player3];
    const _3_payments = [];
    const _3_expectedAmount = amount(amountPerPlayer, _3_winners, _3_winners, 10, 10) - 1;
    // _2Winners1Payment
    const _4_winners = [player1, player2];
    const _4_players = [player1, player2];
    const _4_payments = [player1, player2];
    const _4_expectedAmount = amount(amountPerPlayer, _4_winners, _4_winners, 10, 10);
    withData({
        _1_Win2_Pla2_Pay0: [_1_winners, _1_players, _1_payments, _1_expectedAmount],
        _2_Win1_Pla1_Pay0: [_2_winners, _2_players, _2_payments, _2_expectedAmount],
        _3_Win3_Pla3_Pay0: [_3_winners, _3_players, _3_payments, _3_expectedAmount],
        _4_Win2_Pla2_Pay2: [_4_winners, _4_players, _4_payments, _4_expectedAmount ]
    }, function(winners, players, payments, expectedAmount) {
        it(t('anUser', 'getWinnerAmount', 'Should be equals to ' + expectedAmount), async function() {
            //Setup
            const builder = new Builder(contestPoolInstance);
            await builder.startTime(owner, 2018, 01, 10);
            await builder.endTime(owner, 2018, 01, 15);
            await builder.graceTime(owner, dateUtil.daysToSeconds(5));
            await builder.managerFee(owner, 10);
            await builder.ownerFee(owner, 10);
            await builder.amountPerPlayer(owner, amountPerPlayer);
            await builder.winners(owner, winners);
            await builder.currentTime(owner, 2018, 01, 05);
            await builder.predictionsDef(amountPerPlayer, defaultPrediction, players);

            //Invocation
            const result = await contestPoolInstance._getWinnerAmount();

            //Assertions
            assert.equal(expectedAmount, parseInt(result));
        });
    });
});
