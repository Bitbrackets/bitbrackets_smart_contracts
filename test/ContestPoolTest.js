const ContestPool = artifacts.require("./ContestPool.sol");
const dateUtil = require('./DateUtil');

// test suite
contract('ContestPool', accounts => {
    let contestPoolInstance;
    let owner = accounts[9];
    let manager = accounts[0];
    let player1 = accounts[1];
    let player2 = accounts[2];
    let player3 = accounts[3];

    let startTime = dateUtil.toMillis(2018, 6, 14);
    let endTime = dateUtil.toMillis(2018, 7, 16);
    let graceTime = 1;
    const maxBalance = web3.toWei(1, 'ether');

    beforeEach('setup contract for each test', async () => {
        contestPoolInstance = await ContestPool.new(
            owner,
            manager,
            "Rusia2018",
            startTime,
            endTime,
            graceTime,
            maxBalance
        );
    })

    it('should be initialized with correct values', async () => {
        const startTimeContract = await contestPoolInstance.startTime();
        const endTimeContract = await contestPoolInstance.endTime();
        const graceTimeContract = await contestPoolInstance.graceTime();

        assert.equal(startTime, startTimeContract, "Contest start time should be " + startTime);
        assert.equal(endTime, endTimeContract, "Contest end time should be " + endTime);
        assert.equal(graceTime, graceTimeContract, "Contest grace time should be " + graceTime);
    });
});
