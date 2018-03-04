const ContestPool = artifacts.require("./ContestPool.sol");

// test suite
contract('ContestPool', accounts => {
    let contestPoolInstance;
    let owner = accounts[0];
    let manager = accounts[1];

    it('should be initialized with empty values', async () => {
        // contestPoolInstance = await ContestPool.deployed();
        // contestPoolInstance.

        // assert.equal(contestPoolInstance.endDate(), 0, "End Date must be zero");
    });
});
