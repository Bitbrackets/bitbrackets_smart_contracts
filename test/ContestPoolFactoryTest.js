var ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
var ContestPool = artifacts.require("./ContestPool.sol");

const stringUtils = require('./StringUtil');
var utils = require("./utils.js");

let instance;

contract('ContestPoolFactory', function(accounts) {
  
  beforeEach('setup contract for each test', async() => {
    instance = await ContestPoolFactory.deployed();
  });

  it("Should deploy ContestPoolFactory contract.", async function() {
    assert(instance);
    assert(instance.address);
  });

  it("Creating a contest pool definition.", async function() {
    const contestName = 'ContestPool';
    const startTime = 1000;
    const endTime = 2000;
    const graceTime = 2;
    const maxBalance = web3.toWei(10,'ether');

    await instance.createContestPoolDefinition(contestName, startTime, endTime, graceTime, maxBalance);

    const result = await instance.definitions(contestName);
    
    assert.equal(contestName, stringUtils.cleanNulls(web3.toAscii(result[0])));
    assert.equal(startTime, result[1]);
    assert.equal(endTime, result[2]);
    assert.equal(graceTime, result[3]);
  });

  it("Creating a contest pool definition twice. It should fail.", async function() {
    const contestName = 'NewContestPool';
    const startTime = 1000;
    const endTime = 2000;
    const graceTime = 2;
    const maxBalance = web3.toWei(10,'ether');
    await instance.createContestPoolDefinition(contestName, startTime, endTime, graceTime, maxBalance);

    try {
      await instance.createContestPoolDefinition(contestName, startTime, endTime, graceTime, maxBalance);
      assert(false, 'It should have failed because the contest name is repetead.');
    } catch(err) {
      assert(err);
    }
  });

  it("Creating a contest pool definition with an invalid value for contest name. It should fail.", async function() {
    try {
      await instance.createContestPoolDefinition(null, 1, 2, 2, 10);
      assert(false, 'It should have failed because the contest name is invalid.');
    } catch(err) {
      assert(err);
    }
  });

  it("Creating a contest pool definition with an invalid value for start date. It should fail.", async function() {
    try {
      await instance.createContestPoolDefinition('CustomValue', 0, 2, 2, 10);
      assert(false, 'It should have failed because the start date is zero.');
    } catch(err) {
      assert(err);
    }
  });

  
  it("Creating a contest pool instance.", async function() {
    const contestName = 'Rusia18';
    const startTime = 1000;
    const endTime = 2000;
    const graceTime = 2;
    const maxBalance = web3.toWei(1,'ether');
    const contestNameBytes32 = stringUtils.stringToBytes32(contestName);

    await instance.createContestPoolDefinition(contestName, startTime, endTime, graceTime, maxBalance);
    
    await instance.createContestPool(contestName, web3.toWei(2, 'ether'));

    let contestPoolAddress;
    let contestPool;

    const callback = async function(log) {
      contestPoolAddress = log[0].args.contestPoolAddress;
      contestPool = ContestPool.at(contestPoolAddress);

      assert.ok(contestPoolAddress);
      assert.ok(contestPool);

      const maxBalanceContestPool = await contestPool.maxBalance();
      const contestNameContestPool = await contestPool.contestName();
      const startDateContestPool = await contestPool.startTime();
      const endDateContestPool = await contestPool.endTime();
      const daysGraceContestPool = await contestPool.graceTime();

      assert.equal(maxBalanceContestPool, maxBalance);
      assert.equal(contestNameContestPool, contestNameBytes32);
      assert.equal(startDateContestPool, startDate);
      assert.equal(endDateContestPool, endDate);
      assert.equal(maxBalanceContestPool, maxBalance);
    };
    await utils.assertEvent(instance, { event: "CreateContestPool", args: {
      contestName: contestNameBytes32
    }}, 1, callback);
  });

  it("Creating a contest pool instance using invalid contest name.", async function() {
    const contestName = 'Rusia21';
    try {
      await instance.createContestPool(contestName, web3.toWei(2, 'ether'));
      assert(false, 'It should fail because contest name is invalid.');
    } catch(err) {
      assert(err);
    }    
  });
});