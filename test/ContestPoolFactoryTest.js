var ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
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

    await instance.createContestPoolDefinition(contestName, startTime, endTime, graceTime, maxBalance);
    
    const contestPoolAddress = await instance.createContestPool(contestName, web3.toWei(2, 'ether'));

    const contestNameBytes32 = stringUtils.stringToBytes32(contestName);
    
    await utils.assertEvent(instance, 1, { event: "CreateContestPool", args: {
      contestName: contestNameBytes32,
      contestPoolAddress: '0x5677db552d5fd9911a5560cb0bd40be90a70eff2'
    }});
    assert.ok(contestPoolAddress);
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