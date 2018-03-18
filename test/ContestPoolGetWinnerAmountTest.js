const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");

const leche = require('leche');
const withData = leche.withData;
const dateUtil = require('./utils/DateUtil');
const t = require('./utils/TestUtil').title;
const amount = require('./utils/AmountUtil').expected;

const { getScore, parseToInt } = require('./utils/ScoreUtil');

const Builder = require('./utils/ContestPoolBuilder');

/**
 * Using 'Leche' for multiple data provider.
 * 
 * @dev https://github.com/box/leche
 */
contract('ContestPoolGetWinnerAmountTest', accounts => {
    let contestPoolInstance;
    const defaultPrediction = 101010101;
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

    const prediction1 = {player: player3, prediction: [10010101]};
    const prediction2 = {player: player2, prediction: [10010101]};
    const prediction3 = {player: player1, prediction: [10010101]};
    // _2Winners
    const _2WinnersWinners = [player3, player5];
    const _2WinnersPredictions = [prediction2, prediction1];
    const _2WinnersPayments = [];
    const _2WinnersAmountExpected = amount(amountPerPlayer, _2WinnersWinners, _2WinnersWinners, 10, 10);
    // _1Winner
    const _1WinnerWinners = [player1];
    const _1WinnerPredictions = [prediction3];
    const _1WinnerPayments = [];
    const _1WinnerAmountExpected = amount(amountPerPlayer, _1WinnerWinners, _1WinnerWinners, 10, 10);
    // _3Winner
    const _3WinnerWinners = [player1, player2, player3];
    const _3WinnerPredictions = [prediction1, prediction2, prediction3];
    const _3WinnerPayments = [];
    const _3WinnerAmountExpected = amount(amountPerPlayer, _3WinnerWinners, _3WinnerWinners, 10, 10) - 1;
    // _2Winners1Payment
    const _2Winners1PaymentWinners = [player1, player2];
    const _2Winners1PaymentPredictions = [prediction1, prediction2];
    const _2Winners1PaymentPayments = [player1];
    const _2Winners1PaymentAmountExpected = amount(amountPerPlayer, _2Winners1PaymentWinners, _2Winners1PaymentWinners, 10, 10);
    withData({
        _2Winners: [_2WinnersWinners, _2WinnersPredictions, _2WinnersPayments, _2WinnersAmountExpected],
        _1Winner: [_1WinnerWinners, _1WinnerPredictions, _1WinnerPayments, _1WinnerAmountExpected],
        _3Winners: [_3WinnerWinners, _3WinnerPredictions, _3WinnerPayments, _3WinnerAmountExpected],
        _2Winners1Payment: [_2Winners1PaymentWinners, _2Winners1PaymentPredictions, _2Winners1PaymentPayments, _2Winners1PaymentAmountExpected ]
    }, function(winners, predictions, payments, expectedAmount) {
        it(t('anUser', 'getWinnerAmount', 'Winner should be able to claim prize.'), async function() {
            //Setup
            const builder = new Builder(contestPoolInstance);
            await builder.startTime(owner, 2018, 01, 10);
            await builder.endTime(owner, 2018, 01, 15);
            await builder.graceTime(owner, dateUtil.daysToSeconds(5));
            await builder.managerFee(owner, 10);
            await builder.ownerFee(owner, 10);
            await builder.amountPerPlayer(owner, amountPerPlayer);
            await builder.winners(owner, winners);
            await builder.paymentsTrue(owner, payments);
            await builder.currentTime(owner, 2018, 01, 05);
            await builder.predictions(owner, amountPerPlayer, predictions);
            /*await contestPoolInstance.sendPredictionSet(
                [10010101,10010101],
                {
                    from: player1,
                    value: amountPerPlayer
                }
            );*/

            //Invocation
            const result = await contestPoolInstance._getWinnerAmount();

            //Assertions
            assert.equal(expectedAmount, parseInt(result));
        });
    });
});
