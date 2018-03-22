const leche = require('leche');
const withData = leche.withData;
const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const {assertEvent, emptyCallback} = require("./utils/utils.js");
const t = require('./utils/TestUtil').title;
const amount = require('./utils/AmountUtil').expected;
const Builder = require('./utils/ContestPoolBuilder');

/**
 * @author Guillermo Salazar
 */
contract('ContestPoolAddWinnerDependingOnScoreTest', accounts => {
    let contestPoolInstance;
    const defaultPrediction = [10101010, 01010101];
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

    beforeEach('Deploying contract for each test', async () => {
        contestPoolInstance = await ContestPoolMock.new(
            BbStorage.address,
            manager
        );
    });

    withData({
        _1_newHighestScore: [10, 20, player1, true],
        _2_equalHighestScore: [25, 25, player2, true],
        _3_newHighestScore: [25, 30, player2, true],
        _4_notHighestScore: [25, 24, player2, false]
    }, function(highestScore, newScore, player, expectedResult) {
        it(t('aPlayer', 'addWinnerDependingOnScore', 'Should be valid.'), async function() {
            //Setup
            const builder = new Builder(contestPoolInstance);
            await builder.highestScore(owner, highestScore);
            
            //Invocation
            await contestPoolInstance._addWinnerDependingOnScore(player, newScore, {from: player});
            
            //Assertions
            //Assert event
            const eventCount = expectedResult ? 1 : 0;

            await assertEvent(contestPoolInstance, {event: 'LogNewHighScore', args: {
                contractAddress: contestPoolInstance.address,
                player: player
            }}, eventCount, emptyCallback);
        });
    });
});
