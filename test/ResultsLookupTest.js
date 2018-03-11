var ResultsLookup = artifacts.require("./ResultsLookup.sol");
const stringUtils = require('./StringUtil');
var utils = require("./utils.js");
var date = require("./DateUtil.js");

let instance;

contract('ResultsLookup', function(accounts) {
  
  beforeEach('Setup contract for each test', async() => {
    instance = await ResultsLookup.deployed();
  });

  it("Should deploy ResultsLookup contract.", async function() {
    assert(instance);
    assert(instance.address);
  });

  it("Owner should can register result and get it.", async function() {
    const owner = accounts[0];
    const contestName = stringUtils.stringToBytes32('Rusia2018');
    const value = 10101010101010111011;
    
    await instance.registerResult(contestName, value, {from: owner});
    const result = await instance.getResult(contestName, {from: owner});
    
    assert.equal(value, result[0]);
    
    const whenDateTime = result[1];
    const nowInMillis = date.nowInMillis();

    assert.ok(parseInt(whenDateTime) <= nowInMillis);
  });

  it("A non owner should not can register result.", async function() {
    const player = accounts[1];
    const contestName = stringUtils.stringToBytes32('Rusia2018');
    const value = 10101010101010111011;
    
    try {
      await instance.registerResult(contestName, value, {from: player});
      assert(false, 'It should have failed because a player cannot register a result.');
    } catch(error) {
      assert(error);
      assert(error.message.includes("revert"));
    }
  });

  it("A non owner should not can get a result.", async function() {
    const owner = accounts[0];
    const player = accounts[1];
    const contestName = stringUtils.stringToBytes32('GrandSlam2018');
    const value = 10101010101010111011;
    await instance.registerResult(contestName, value, {from: owner});

    try {
      await instance.getResult(contestName, {from: player});
      assert(false, 'It should have failed because a player cannot get a result.');
    } catch(error) {
      assert(error);
      assert(error.message.includes("revert"));
    }
  });

  it("Owner should can register twice results and get last one.", async function() {
    const owner = accounts[0];
    const contestName = stringUtils.stringToBytes32('Rusia2018');
    const value1 = 10101010101010111011;
    const value2 = 11100011100011100011;
    
    await instance.registerResult(contestName, value1, {from: owner});
    await instance.registerResult(contestName, value2, {from: owner});
    const result = await instance.getResult(contestName, {from: owner});
    
    assert.notEqual(value1, result[0]);
    assert.equal(value2, result[0]);
    
    const whenDateTime = result[1];
    const nowInMillis = date.nowInMillis();

    assert.ok(parseInt(whenDateTime) <= nowInMillis);
  });
});