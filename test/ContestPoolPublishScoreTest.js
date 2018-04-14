const leche = require('leche');
const withData = leche.withData;
const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const ResultsLookup = artifacts.require("./ResultsLookup.sol");
const {assertEvent, emptyCallback} = require("./utils/utils.js");
const t = require('./utils/TestUtil').title;
const { getScoreWithArray } = require('./utils/ScoreUtil');
const Builder = require('./utils/ContestPoolBuilder');


//TODO add tests with complete set of games
contract('ContestPoolPublishScoreTest', accounts => {
    let contestPoolInstance;
    let resultsLookupInstance;
    
    const defaultPrediction = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];

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
            }}, 1, emptyCallback);
            
            const highestScore = await contestPoolInstance.highestScore();
            //console.log("high score", highestScore.toNumber());
            const winner1 = await contestPoolInstance.getWinners();

            assert.equal(player1, winner1[0]);
            assert.equal(getScoreWithArray(prediction.prediction, score, 4), highestScore.toNumber(), 'Player should have the highest score.');
        });
    });

    withData({
        _1_1Pre_fail: [_1_prediction_1, _1_score_1]
    }, function(prediction, score) {
        it(t('aPlayer', 'publishHighScore', 'Should not be able to publish a score because it is after grace time.', true), async function() {
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
            await builder.currentTime(owner, 2018, 01, 16);

            //Invocation
            try {
                await contestPoolInstance.publishHighScore({from: prediction.player});
                assert.ok(false, 'It should have failed because current date is after grace time.');
            } catch (error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

});
