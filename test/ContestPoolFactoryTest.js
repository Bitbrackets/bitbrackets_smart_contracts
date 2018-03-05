var ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");

contract('ContestPoolFactory', function(accounts) {
  it("Should deploy ContestPoolFactory contract.", async function() {
    const instance = await ContestPoolFactory.deployed();
    assert(instance.address);
  });

  it("Creating a contest pool definition.", async function() {
    const contestName = 'ContestPool';
    const startDate = 1000;
    const endDate = 2000;
    const daysGrace = 2;
    const instance = await ContestPoolFactory.deployed();
    await instance.createContestPoolDefinition(contestName, startDate, endDate, daysGrace);

    const result = await instance.definitions(contestName);
    
    //assert.equal(contestName, web3.toAscii(result[0]).replace('\u0000', ''));
    assert.equal(startDate, result[1]);
    assert.equal(endDate, result[2]);
    assert.equal(daysGrace, result[3]);
  });
});