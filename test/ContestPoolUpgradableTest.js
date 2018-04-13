const ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
const ContestPoolUpgradable = artifacts.require("./ContestPoolUpgradable.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const contestPool = artifacts.require("./ContestPool.sol");

const dateUtil = require('./utils/DateUtil');
const t = require('./utils/TestUtil').title;
const stringUtils = require('./utils/StringUtil');


// test suite
contract('ContestPoolUpgradable', accounts => {
    let bbStorageInstance;
    let contestPoolInstanceA;
    let contestPoolInstanceB;
    let contestPoolUpgradableInstance;
    let contestPoolFactoryInstance;

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
    let contestPoolAddressB;
    before('setup suite', async () => {

        contestPoolFactoryInstance = await ContestPoolFactory.deployed();
        bbStorageInstance = await BbStorage.deployed();

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
        // console.log('Contest Pool Address', contestPoolAddress);
        // constestPoolInstance = ContestPool(contestPoolAddress);

         console.log("contestPoolAddressA ", contestPoolAddressA);
        console.log("contestPoolAddressB ", contestPoolAddressB);

    });

    beforeEach('setup contract for each test', async () => {

        contestPoolInstanceA = contestPool.at(contestPoolAddressA)
        contestPoolInstanceB = contestPool.at(contestPoolAddressB)
        contestPoolUpgradableInstance = ContestPoolUpgradable.at(contestPoolAddressA)

        console.log('cpiA' + contestPoolInstanceA.address);
        console.log('cpiA' + contestPoolInstanceB.address);

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
        console.log('startTimeContract ' + startTimeContract);
        assert.equal(startTime, startTimeContract, "Contest start time should be " + startTime);
        assert.equal(endTime, endTimeContract, "Contest end time should be " + endTime);
        assert.equal(graceTime, graceTimeContract, "Contest grace time should be " + graceTime);
    });
    it(t('AnyUser', 'new', 'Should be pointing to implementation'), async () => {
        const targetId = await contestPoolUpgradableInstance.getTargetId();
        const version = await contestPoolInstanceA.getVersion();
        const address = await contestPoolUpgradableInstance.implementation();
        console.log('targetId ' + targetId);
        console.log('address ' + address);
        assert.equal('contestPoolBase', targetId, "Contest Impl should be " + 'contestPoolBase');
        assert.equal(1, version, "Contest Impl version should be " + 1);
    });
    it(t('AnyUser', 'new', 'Two different contest should be pointing to implementation'), async () => {
        const nameA = await contestPoolInstanceA.contestName();
        const nameB = await contestPoolInstanceB.contestName();
        const contestNameABytes32 = stringUtils.stringToBytes32(contestName);
        const contestNameBBytes32 = stringUtils.stringToBytes32(contestNameB);
        console.log('contestNameA ' + nameA);
        console.log('contestNameB ' + nameB);
        assert.equal(contestNameABytes32, nameA, "Contest name should be " + contestName);
        assert.equal(contestNameBBytes32, nameB, "Contest name should be " + contestNameB);
    });

});
