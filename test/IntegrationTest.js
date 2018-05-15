const ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
const ContestPoolUpgradable = artifacts.require("./ContestPoolUpgradable.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const contestPool = artifacts.require("./ContestPool.sol");
const BbUpgrade = artifacts.require("./BbUpgrade.sol");
const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const dateUtil = require('./utils/DateUtil');
const t = require('./utils/TestUtil').title;
const {assertEvent, emptyCallback} = require('./utils/utils');
const stringUtils = require('./utils/StringUtil');
// const toMillis = require('./utils/DateUtil').toMillis;
// var utils = require("./utils/utils.js");
const config = require("../truffle");


/*
 * @title IntegrationTest.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 *
 */
contract('ContestPoolUpgradable', accounts => {
    let bbStorageInstance;
    let contestPoolInstanceA;
    let contestPoolInstanceB;
    let contestPoolUpgradableInstance;
    let contestPoolFactoryInstance;
    let bbUpgradeInstance;

    let owner = accounts[0];
    let manager = accounts[9];
    let player1 = accounts[1];
    let player2 = accounts[2];
    let player3 = accounts[3];

    let startTime = dateUtil.tomorrowInSeconds();
    let endTime = dateUtil.aWeekFromNowInSeconds();
    let graceTime = 1;
    const fee = web3.toWei(0.01, 'ether');
    const maxBalance = web3.toWei(1, 'ether');
    const amountPerPlayer = web3.toWei(0.1, 'ether');

    const managerFee = 10;
    const ownerFee = 10;

    const contestName = stringUtils.uniqueText('Rusia2018');
    const contestNameB = stringUtils.uniqueText('Test2018');

    let contestPoolAddressA;
    let contestPoolAddressB, contestPoolVersion2Instance;

    const defaultPrediction = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];
    before('setup suite', async () => {

        contestPoolFactoryInstance = await ContestPoolFactory.deployed();
        bbStorageInstance = await BbStorage.deployed();
        bbUpgradeInstance = await BbUpgrade.deployed();

        contestPoolVersion2Instance = await ContestPoolMock.new(
            BbStorage.address,
            manager
        );

        console.log('mock->' + contestPoolVersion2Instance.address );
        await contestPoolFactoryInstance.createContestPoolDefinition(
            contestName,
            fee,
            startTime,
            endTime,
            graceTime,
            maxBalance,
            managerFee,
            ownerFee,
            { from : owner }
        );

        await contestPoolFactoryInstance.createContestPoolDefinition(
            contestNameB,
            fee,
            startTime,
            endTime,
            graceTime,
            maxBalance,
            managerFee,
            ownerFee,
            { from : owner }
        );


        const txA = await contestPoolFactoryInstance.createContestPool(
            'nameA',
            contestName,
            amountPerPlayer,
            {
                from: manager,
                value: fee
            }
        );

        const txB = await contestPoolFactoryInstance.createContestPool(
            'nameB',
            contestNameB,
            amountPerPlayer,
            {
                from: manager,
                value: fee
            }
        );

        contestPoolAddressA = txA.logs[0].args.contestPoolAddress;
        contestPoolAddressB = txB.logs[0].args.contestPoolAddress;

    });

    beforeEach('setup contract for each test', async () => {

        contestPoolInstanceA = contestPool.at(contestPoolAddressA)
        contestPoolInstanceB = contestPool.at(contestPoolAddressB)
        contestPoolUpgradableInstance = ContestPoolUpgradable.at(contestPoolAddressA)
    })

    it(t('AnyUser', 'new', 'Should be pointing to implementation'), async () => {
        const targetId = await contestPoolUpgradableInstance.getTargetId();
        const version = await contestPoolInstanceA.getVersion();
        const address = await contestPoolUpgradableInstance.implementation();

        assert.equal('contestPoolBase', targetId, "Contest Impl should be " + 'contestPoolBase');
        assert.equal(1, version, "Contest Impl version should be " + 1);
    });
    it(t('AnyUser', 'new', 'Two different contest should be pointing to implementation'), async () => {
        const nameA = await contestPoolInstanceA.contestName();
        const nameB = await contestPoolInstanceB.contestName();
        const contestNameABytes32 = stringUtils.stringToBytes32(contestName);
        const contestNameBBytes32 = stringUtils.stringToBytes32(contestNameB);

        assert.equal(contestNameABytes32, nameA, "Contest name should be " + contestName);
        assert.equal(contestNameBBytes32, nameB, "Contest name should be " + contestNameB);
    });

    it(t('aOwner', 'SendPrediction', 'Should be able to send a prediction.'), async function () {

        console.log('startTime      ', startTime);
        console.log('endTime        ', endTime);
        console.log('now            ', dateUtil.nowInSeconds());
        const sendPredictionSetResult = await contestPoolInstanceA.sendPredictionSet(
            defaultPrediction,
            {from: player1, value: amountPerPlayer}
        );

    });

});
