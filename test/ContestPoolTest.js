const ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
const ContestPool = artifacts.require("./ContestPool.sol");
const BbStorage = artifacts.require("./BbStorage.sol");

const dateUtil = require('./utils/DateUtil');
const t = require('./utils/TestUtil').title;
const stringUtils = require('./utils/StringUtil');


// test suite
contract('ContestPool', accounts => {
    let bbStorageInstance;
    let contestPoolInstance;
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

        let contestPoolAddress;
        const tx = await contestPoolFactoryInstance.createContestPool(
            contestName, 
            amountPerPlayer,
            {
                from: manager,
                value: fee
            }
        );
        
        // contestPoolAddress = tx.logs[0].args.contestPoolAddress;
        // console.log('Contest Pool Address', contestPoolAddress);
        // constestPoolInstance = ContestPool(contestPoolAddress);

        // console.log("contest pool instance", contestPoolInstance);

    });

    beforeEach('setup contract for each test', async () => {

        contestPoolInstance = await ContestPool.new(
            BbStorage.address,
            manager,
            "Rusia2018",
            startTime,
            endTime,
            graceTime,
            maxBalance,
            amountPerPlayer,
            managerFee,
            ownerFee
        );
    })

    it(t('AnyUser', 'setup', 'should have valid instance of ContestPoolFactory'), async () => {

        assert(contestPoolFactoryInstance);
        assert(contestPoolFactoryInstance.address);
        assert(contestPoolInstance);
        assert(contestPoolInstance.address);
    });

    it(t('AnyUser', 'new', 'Should be initialized with correct values'), async () => {
        const startTimeContract = await contestPoolInstance.startTime();
        const endTimeContract = await contestPoolInstance.endTime();
        const graceTimeContract = await contestPoolInstance.graceTime();

        assert.equal(startTime, startTimeContract, "Contest start time should be " + startTime);
        assert.equal(endTime, endTimeContract, "Contest end time should be " + endTime);
        assert.equal(graceTime, graceTimeContract, "Contest grace time should be " + graceTime);
    });
});
