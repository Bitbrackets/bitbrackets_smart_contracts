const ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const BbSettings = artifacts.require("./BbSettings.sol");
const stringUtils = require('./utils/StringUtil');
const t = require('./utils/TestUtil').title;
const Builder = require('./utils/ContestPoolBuilder');
const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");



/*
 * @title Pause and emergency status test
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 *
 */
contract('ContestPoolPausable', accounts => {
    let bbStorageInstance;
    let contestPoolInstance;
    let bbSettingsInstance;
    let contestPoolFactoryInstance;

    let owner = accounts[0];
    let manager = accounts[9];
    let player1 = accounts[4];
    let player2 = accounts[5];
    let player3 = accounts[6];


    const contestName = stringUtils.uniqueText('Rusia2018');

    const defaultPrediction = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];

    before('setup suite', async () => {

        contestPoolFactoryInstance = await ContestPoolFactory.deployed();
        bbStorageInstance = await BbStorage.deployed();
        bbSettingsInstance = await BbSettings.deployed();



    });

    beforeEach('setup contract for each test', async () => {

        contestPoolInstance = await ContestPoolMock.new(
            BbStorage.address,
            manager
        );
    })


    it(t('aPlayer', 'pausedByName', 'Should not be able to send prediction when contest pool is paused'), async () => {
        const amountPerPlayer = web3.toWei(0.001, 'ether');
        const builder = new Builder(contestPoolInstance);
        await builder.contestName(owner, contestName);
        await builder.startTime(owner, 2018, 1, 5);
        await builder.endTime(owner, 2018, 1, 10);//5 days to wait for the match results.
        await builder.graceTimeDays(owner, 5);//5 days to publish your scores.
        await builder.amountPerPlayer(owner, amountPerPlayer);
        await builder.currentTime(owner, 2018, 1, 1);

        await contestPoolInstance.sendPredictionSet(
            defaultPrediction,
            {from: player1, value: amountPerPlayer}
        );
        assert.ok(true, 'It should send the prediction.');
        //set pause to the contest
        await bbSettingsInstance.pauseByContestName(
            contestName,
            {from: owner}
        );

        try {
            await contestPoolInstance.sendPredictionSet(
                defaultPrediction,
                {from: player2, value: amountPerPlayer}
            );
            assert.ok(false, 'It should fail to send the prediction.');
        }catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
        //removing the pause
        await bbSettingsInstance.removePauseByContestName(
            contestName,
            {from: owner}
        );
        await contestPoolInstance.sendPredictionSet(
            defaultPrediction,
            {from: player2, value: amountPerPlayer}
        );
        assert.ok(true, 'It should send the prediction.');
    });

    it(t('aPlayer', 'pausedByAddress', 'Should not be able to send prediction when contest pool is paused'), async () => {
        const amountPerPlayer = web3.toWei(0.001, 'ether');
        const builder = new Builder(contestPoolInstance);
        await builder.contestName(owner, contestName);
        await builder.startTime(owner, 2018, 1, 5);
        await builder.endTime(owner, 2018, 1, 10);//5 days to wait for the match results.
        await builder.graceTimeDays(owner, 5);//5 days to publish your scores.
        await builder.amountPerPlayer(owner, amountPerPlayer);
        await builder.currentTime(owner, 2018, 1, 1);


        await contestPoolInstance.sendPredictionSet(
            defaultPrediction,
            {from: player1, value: amountPerPlayer}
        );
        assert.ok(true, 'It should send the prediction.');
        await bbSettingsInstance.pauseByContestAddress(
            contestPoolInstance.address,
            {from: owner}
        );

        try {
            await contestPoolInstance.sendPredictionSet(
                defaultPrediction,
                {from: player2, value: amountPerPlayer}
            );
            assert.ok(false, 'It should fail to send the prediction.');
        }catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
        await bbSettingsInstance.removePauseByContestAddress(
            contestPoolInstance.address,
            {from: owner}
        );
        await contestPoolInstance.sendPredictionSet(
            defaultPrediction,
            {from: player2, value: amountPerPlayer}
        );
        assert.ok(true, 'It should send the prediction.');
    });

    it(t('aPlayer', 'emergency', 'Should not be able to send prediction while emergency state'), async () => {
        const amountPerPlayer = web3.toWei(0.001, 'ether');
        const builder = new Builder(contestPoolInstance);
        await builder.contestName(owner, contestName);
        await builder.startTime(owner, 2018, 1, 5);
        await builder.endTime(owner, 2018, 1, 10);//5 days to wait for the match results.
        await builder.graceTimeDays(owner, 5);//5 days to publish your scores.
        await builder.amountPerPlayer(owner, amountPerPlayer);
        await builder.currentTime(owner, 2018, 1, 1);
        //setting up emergency state
        await bbSettingsInstance.setEmergency(

            {from: owner}
        );

        try {
            await contestPoolInstance.sendPredictionSet(
                defaultPrediction,
                {from: player2, value: amountPerPlayer}
            );
            assert.ok(false, 'It should fail to send the prediction.');
        }catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
        await bbSettingsInstance.removeEmergency(

            {from: owner}
        );
        await contestPoolInstance.sendPredictionSet(
            defaultPrediction,
            {from: player2, value: amountPerPlayer}
        );
        assert.ok(true, 'It should send the prediction.');
    });


});
