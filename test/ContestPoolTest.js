const ContestPool = artifacts.require("./ContestPool.sol");
const moment = require('moment');

// test suite
contract('ContestPool', accounts => {
    let contestPoolInstance;
    let owner = accounts[0];
    let manager = accounts[1];
    let startDate = moment("2018-06-14").toDate().getMilliseconds();
    let endDate = moment("2018-07-16").toDate().getMilliseconds();
    let daysGrace = 1;
    const maxBalance = web3.toWei(1,'ether');

    beforeEach('setup contract for each test', async() => {
        contestPoolInstance = await ContestPool.new(
            owner, 
            manager,
            "Rusia2018",
            startDate, 
            endDate, 
            daysGrace,
            maxBalance
        );
    })

    it('should be initialized with correct values', async () => {
        const startTimeContract = await contestPoolInstance.startTime();
        const endTimeContract = await contestPoolInstance.endTime();
        const graceTimeContract = await contestPoolInstance.graceTime();
        
        assert.equal(startDate, startTimeContract, "Contest start time should be " + startDate);
        assert.equal(endDate, endTimeContract, "Contest end time should be " + endDate);
        assert.equal(daysGrace, graceTimeContract, "Contest grace time should be " + daysGrace);
    });
});
