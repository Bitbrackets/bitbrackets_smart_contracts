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


/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
contract('ResultsLookup', function(accounts) {

  const ceo = accounts[1];
  const manager = accounts[2];
  const playe1 = accounts[3];
  const player2 = accounts[4];

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

  it(t('manager', 'getResult', 'Should able to get a result (pre registered).'), async function(){
   
    await instance.registerResult(contestName, value, games, {from: manager});
    const result = await instance.getResult(contestName, {from: manager});
    
    assertBigNumberArrayIsEqual(toBigNumberArray(value), result[0]);
    
    assert.equal(games,result[1].toNumber());
  });

  it(t('aNonOwner', 'registerResult', 'Should not able to register a result.', true), async function() {
    const player = accounts[5];
    
    try {
      await instance.registerResult(contestName, value, games, {from: player});
      assert(false, 'It should have failed because a player cannot register a result.');
    } catch(error) {
      assert(error);
      assert(error.message.includes("revert"));
    }
  });

  it(t('anOwner', 'getResult', 'Should not able to get a result from a contest that does not exist.', true), async function() {
    const owner = accounts[0];
    const player = accounts[1];

    try {
      await instance.getResult('ContestNameNotExist', {from: player});
      assert(false, 'It should have failed because contest name does not exist.');
    } catch(error) {
      assert(error);
      assert(error.message.includes("revert"));
    }
  });

  it(t('aNonOwner', 'getResult', 'Should able to get a result pre registered.', true), async function() {
    const owner = accounts[0];
    const player = accounts[1];
    const _contestName = 'MyContestName';

    await instance.registerResult(_contestName, value, games, {from: manager});
    const result = await instance.getResult(_contestName, {from: player2});
    
    assertBigNumberArrayIsEqual(toBigNumberArray(value), result[0]);
    
    assert.equal(games,result[1].toNumber());
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