var ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
const stringUtils = require('./StringUtil');

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
    
    assert.equal(contestName, stringUtils.cleanNulls(web3.toAscii(result[0])));
    assert.equal(startDate, result[1]);
    assert.equal(endDate, result[2]);
    assert.equal(daysGrace, result[3]);
  });

  it("Creating a contest pool definition twice. It should fail.", async function() {
    const contestName = 'NewContestPool';
    const startDate = 1000;
    const endDate = 2000;
    const daysGrace = 2;
    const instance = await ContestPoolFactory.deployed();
    await instance.createContestPoolDefinition(contestName, startDate, endDate, daysGrace);

    try {
      await instance.createContestPoolDefinition(contestName, startDate, endDate, daysGrace);
      assert(false, 'It should have failed because the contest name is repetead.');
    } catch(err) {
      assert(err);
    }
  });

  it("Creating a contest pool definition with an invalid value for contest name. It should fail.", async function() {
    try {
      await instance.createContestPoolDefinition(null, 1, 2, 2);
      assert(false, 'It should have failed because the contest name is invalid.');
    } catch(err) {
      assert(err);
    }
  });

  it("Creating a contest pool definition with an invalid value for start date. It should fail.", async function() {
    try {
      await instance.createContestPoolDefinition('CustomValue', 0, 2, 2);
      assert(false, 'It should have failed because the start date is zero.');
    } catch(err) {
      assert(err);
    }
  });
});