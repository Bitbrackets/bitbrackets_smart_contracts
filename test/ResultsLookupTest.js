var ResultsLookup = artifacts.require("./ResultsLookup.sol");

const stringUtils = require('./utils/StringUtil');
const { toBigNumberArray, assertBigNumberArrayIsEqual } = require('./utils/TestUtil');
const t = require('./utils/TestUtil').title;
var utils = require("./utils/utils.js");
var date = require("./utils/DateUtil.js");


let instance;
let games;
let value;
let contestName;

contract('ResultsLookup', function(accounts) {

  beforeEach('Setup contract for each test', async() => {
    instance = await ResultsLookup.deployed();
    contestName = stringUtils.stringToBytes32('Rusia2018');
    value = [8,3,111,3,5,1,24,17,21,13,9,7,31,28,22,14,18,7,11,30];
    games = 20;
  });

  it(t('aPlayer', 'new', 'Should able to deploy a ResultsLookup contract.'), async function() {
    assert(instance);
    assert(instance.address);
  });

  it(t('aOwner', 'getResult', 'Should able to get a result (pre registered).'), async function() {
    const owner = accounts[0];

    await instance.registerResult(contestName, value, games, {from: owner});
    const result = await instance.getResult(contestName, {from: owner});

    assertBigNumberArrayIsEqual(toBigNumberArray(value), result[0]);

    assert.equal(games,result[1].toNumber());
  });

  it(t('aNonOwner', 'registerResult', 'Should not able to register a result.', true), async function() {
    const player = accounts[5];
    
    try {
      await instance.registerResult(contestName, value, games, {from: player});
      assert(false, 'It should have failed because a player cannot register a result.');
    } catch(error) {
      console.log('error1: ' + error);
        console.log('error2: ' + error.message);
      assert(error);
      assert(error.message.includes("revert"));
    }
  });
  // TODO should not be able to get a result from a contest that does not exist
  // TODO access to be restricted to contracts in ContestPool
  xit(t('aNonOwner', 'getResult', 'Should not able to get a result pre registered.', true), async function() {
    const owner = accounts[0];
    const player = accounts[1];

    await instance.registerResult(contestName, value, games,  {from: owner});

    try {
      await instance.getResult(contestName, {from: player});
      assert(false, 'It should have failed because a player cannot get a result.');
    } catch(error) {
      assert(error);
      assert(error.message.includes("revert"));
    }
  });
  
  it(t('aOwner', 'getResult', 'Should able to register two results and get the last result.', true), async function() {
    const owner = accounts[0];

    const value2 = [8,3,111,3,5,1,24,17,21,13,9,7,31,28,22,14,18,7,11,30,2,4,7,1,11,32,8,7];
    const games2 = 28;

    await instance.registerResult(contestName, value, games, {from: owner});
    await instance.registerResult(contestName, value2, games2, {from: owner});
    const result = await instance.getResult(contestName, {from: owner});

    assertBigNumberArrayIsEqual(toBigNumberArray(value2), result[0]);

    assert.equal(games2,result[1].toNumber());
  });
});