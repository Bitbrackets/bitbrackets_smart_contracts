const ContestPool = artifacts.require("./ContestPool.sol");
const moment = require('moment');

// test suite
contract('ContestPool', accounts => {
    let contestPoolInstance;
    let owner = accounts[9];
    let manager = accounts[0];
    let player1 = accounts[1];
    let player2 = accounts[2];
    let player3 = accounts[3];
    let startTime = moment("2018-06-14").toDate().getMilliseconds();
    let endTime = moment("2018-07-16").toDate().getMilliseconds();
    let graceTime = 1;

    beforeEach('setup contract for each test', async() => {
        contestPoolInstance = await ContestPool.new(
            owner, 
            "Rusia2018",
            startTime, 
            endTime, 
            graceTime
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

    it('should take contributions from players', async () => {
        
    });


});
