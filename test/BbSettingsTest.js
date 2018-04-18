const ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
const ContestPoolUpgradable = artifacts.require("./ContestPoolUpgradable.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const contestPool = artifacts.require("./ContestPoolMock.sol");
const BbSettings = artifacts.require("./BbSettings.sol");
const dateUtil = require('./utils/DateUtil');
const stringUtils = require('./utils/StringUtil');
const {assertEvent, emptyCallback} = require("./utils/utils.js");
const t = require('./utils/TestUtil').title;
const { getScoreWithArray } = require('./utils/ScoreUtil');
const Builder = require('./utils/ContestPoolBuilder');
const ResultsLookup = artifacts.require("./ResultsLookup.sol");
const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");



/*
 * @title Paused and emergency status test
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 *
 */
contract('ContestPoolUpgradable', accounts => {
    let bbStorageInstance;
    let contestPoolInstance;
    let bbSettingsInstance;
    let contestPoolUpgradableInstance;
    let contestPoolFactoryInstance;
    let resultsLookupInstance;

    let owner = accounts[0];
    let manager = accounts[9];
    let player1 = accounts[4];
    let player2 = accounts[5];
    let player3 = accounts[6];

    let startTime = dateUtil.toMillis(2018, 6, 14);
    let endTime = dateUtil.toMillis(2018, 7, 16);
    let graceTime = 1;
    const fee = web3.toWei(0.01, 'ether');
    const maxBalance = web3.toWei(1, 'ether');
    const amountPerPlayer = web3.toWei(0.1, 'ether');

    const managerFee = 10;
    const ownerFee = 10;

    const contestName = stringUtils.uniqueText('Rusia2018');
    const contestNameB = stringUtils.uniqueText('Test2018');

    let contestPoolAddress;
    const defaultPrediction = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];
    const score = [8,3,111,3,5,1,24,17,21,13,9,7,31,28,22,14,18,7,11,30]

    before('setup suite', async () => {

        contestPoolFactoryInstance = await ContestPoolFactory.deployed();
        bbStorageInstance = await BbStorage.deployed();
        bbSettingsInstance = await BbSettings.deployed();

        resultsLookupInstance = await ResultsLookup.deployed();
        contestPoolInstance = await ContestPoolMock.new(
            BbStorage.address,
            manager
        );

    });

    beforeEach('setup contract for each test', async () => {

        //contestPoolInstance = contestPool.at(contestPoolAddress)
        //contestPoolUpgradableInstance = ContestPoolUpgradable.at(contestPoolAddress)
    })

    it(t('AnyUser', 'setup', 'should have valid instance of ContestPoolFactory'), async () => {

        assert(contestPoolFactoryInstance);
        assert(contestPoolFactoryInstance.address);
        assert(bbSettingsInstance);
        assert(bbSettingsInstance.address);
        assert(contestPoolInstance);
        assert(contestPoolInstance.address);
    });

    it(t('AnyUser', 'new', 'Should be initialized with correct values'), async () => {
        const amountPerPlayer = web3.toWei(0.001, 'ether');
        const builder = new Builder(contestPoolInstance);
        await builder.contestName(owner, contestName);
        await builder.startTime(owner, 2018, 1, 5);
        await builder.endTime(owner, 2018, 1, 10);//5 days to wait for the match results.
        await builder.graceTimeDays(owner, 5);//5 days to publish your scores.
        await builder.amountPerPlayer(owner, amountPerPlayer);
        await builder.currentTime(owner, 2018, 1, 1);

        let paused = await  bbSettingsInstance.isContestNamePaused( contestName,
            {from: owner});
        console.log('paused -> ' + paused.logs[0]);
        await contestPoolInstance.sendPredictionSet(
            defaultPrediction,
            {from: player1, value: amountPerPlayer}
        );

        await bbSettingsInstance.pauseByContestName(
            contestName,
            {from: owner}
        );
        paused = await  bbSettingsInstance.isContestNamePaused( contestName,
            {from: owner});
        console.log('paused -> ' + paused);

    });


});
