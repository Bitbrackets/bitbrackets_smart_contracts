const leche = require('leche');
const withData = leche.withData;
const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const ResultsLookup = artifacts.require("./ResultsLookup.sol");
const {assertEvent, emptyCallback} = require("./utils/utils.js");
const t = require('./utils/TestUtil').title;
const { getScoreWithArray } = require('./utils/ScoreUtil');
const Builder = require('./utils/ContestPoolBuilder');

contract('ContestPoolPublishScoreTest', accounts => {
    let contestPoolInstance;
    let resultsLookupInstance;
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
    const contestName = "Rusia2018";

    beforeEach('Deploying contract for each test', async () => {
        resultsLookupInstance = await ResultsLookup.deployed();
        contestPoolInstance = await ContestPoolMock.new(
            BbStorage.address,
            manager
        );
    });

    // _1_1Prediction
    const _1_prediction_1 = {player: player1, prediction:[8,2,1,3,5,6,111,17,32,111,9,7,31,28,22,14,111,7,11,30]};
    const _1_score_1 = [8,3,111,3,5,1,24,17,21,13,9,7,31,28,22,14,18,7,11,30];
    withData({
        _1_1Pre: [_1_prediction_1, _1_score_1]
    }, function(prediction, score) {
        it(t('aPlayer', 'publishHighScore', 'Should be able to publish a score.'), async function() {
            //Setup
            const amountPerPlayer = web3.toWei(0.001, 'ether');
            const builder = new Builder(contestPoolInstance);
            await builder.contestName(owner, contestName);
            await builder.startTime(owner, 2018, 01, 5);
            await builder.endTime(owner, 2018, 01, 10);//5 days to wait for the match results.
            await builder.graceTimeDays(owner, 5);//5 days to publish your scores.
            await builder.amountPerPlayer(owner, amountPerPlayer);
            await builder.currentTime(owner, 2018, 01, 01);
            await contestPoolInstance.sendPredictionSet(
                prediction.prediction,
                {from: prediction.player, value: amountPerPlayer}
            );
            await resultsLookupInstance.registerResult(
                contestName, 
                score, 
                4, 
                { from:  owner}
            );
            await builder.currentTime(owner, 2018, 01, 12);

            //Invocation
            const tx = await contestPoolInstance.publishHighScore({from: prediction.player});

            //Assertions
            assertEvent(contestPoolInstance, {event: 'LogPublishedScore', args: {
                contractAddress: contestPoolInstance.address,
                player: prediction.player
            }}, 1, (log) => console.log("calculated score",log[0].args.score.toNumber()));

            
            const highestScore = await contestPoolInstance.highestScore();
            console.log("high score", highestScore.toNumber());
            const winner1 = await contestPoolInstance.winners(0);

            assert.equal(player1, winner1);
            assert.equal(getScoreWithArray(prediction.prediction, score, 4), highestScore.toNumber(), 'Player should have the highest score.');
        });
    });
});
