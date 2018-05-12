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
const toMillis = require('./utils/DateUtil').toMillis;
var utils = require("./utils/utils.js");
const config = require("../truffle");


/*
 * @title TODO Add comments.
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

    let contestPoolAddressA;
    let contestPoolAddressB, contestPoolVersion2Instance;
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

    it(t('AnyUser', 'setup', 'should have valid instance of ContestPoolFactory'), async () => {

        assert(contestPoolFactoryInstance);
        assert(contestPoolFactoryInstance.address);
        assert(contestPoolInstanceA);
        assert(contestPoolInstanceA.address);
    });

    it(t('AnyUser', 'new', 'Should be initialized with correct values'), async () => {
        const startTimeContract = await contestPoolInstanceA.startTime();
        const endTimeContract = await contestPoolInstanceA.endTime();
        const graceTimeContract = await contestPoolInstanceA.graceTime();

        assert.equal(startTime, startTimeContract, "Contest start time should be " + startTime);
        assert.equal(endTime, endTimeContract, "Contest end time should be " + endTime);
        assert.equal(graceTime, graceTimeContract, "Contest grace time should be " + graceTime);
    });
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

    it(t('aOwner', 'upgradeContract', 'Should be able to upgrade contest pool contract'), async function () {
        const contractName = 'contestPoolBase';

        const oldAddress = await bbStorageInstance.getAddress(config.web3.utils.soliditySha3('contract.name', contractName));

        const currentVersion = await contestPoolInstanceA.getVersion();
        const nameA = await contestPoolInstanceA.contestName();
        const contestNameABytes32 = stringUtils.stringToBytes32(contestName);

        assert.equal(contestNameABytes32, nameA, "Contest name should be " + contestName);
        assert.equal(1, currentVersion, "Contest Impl version should be " + 1);

        await bbUpgradeInstance.upgradeContract(contractName, contestPoolVersion2Instance.address);

        const newVersion = await contestPoolInstanceA.getVersion();
        const nameAAfterUpdate = await contestPoolInstanceA.contestName();
        const contestNameABytes32AfterUpdate = stringUtils.stringToBytes32(nameAAfterUpdate);

        assert.equal(2, newVersion, "Contest Impl version should be " + 2);
        assert.equal(contestNameABytes32AfterUpdate, nameA, "Contest name should continue being " + contestName);

    });

});
