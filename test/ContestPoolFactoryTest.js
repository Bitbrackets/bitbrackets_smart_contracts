var ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
var ContestPool = artifacts.require("./ContestPool.sol");
const t = require('./TestUtil').title;
const stringUtils = require('./StringUtil');
const toMillis = require('./DateUtil').toMillis;
var utils = require("./utils.js");

let instance;

contract('ContestPoolFactory', function (accounts) {

    const owner = accounts[0];
    const player1 = accounts[1];
    const player2 = accounts[2];

    beforeEach('setup contract for each test', async () => {
        instance = await ContestPoolFactory.deployed();
    });

    it(t('aUser', 'new', 'Should deploy ContestPoolFactory contract.'), async function () {
        assert(instance);
        assert(instance.address);
    });

    it(t('aOwner', 'createContestPoolDefinition', 'Should be able to create a contest pool definition.'), async function () {
        const contestName = stringUtils.uniqueText('ContestPool');
        const startTime = 1000;
        const endTime = 2000;
        const graceTime = 2;
        const fee = web3.toWei(0.01, 'ether');
        const maxBalance = web3.toWei(10, 'ether');

        await instance.createContestPoolDefinition(contestName, fee, startTime, endTime, graceTime, maxBalance);

        const result = await instance.definitions(contestName);

        assert.equal(contestName, stringUtils.cleanNulls(web3.toAscii(result[0])));
        assert.equal(startTime, result[1]);
        assert.equal(endTime, result[2]);
        assert.equal(graceTime, result[3]);
        assert.equal(maxBalance, result[4]);
        assert.equal(fee, result[5]);
    });

    it(t('aOwner', 'createContestPoolDefinition', 'Should not be able to create a contest pool definition twice (equals contest name).', true), async function () {
        const contestName = stringUtils.uniqueText('NewContestPool');
        const startTime = 1000;
        const endTime = 2000;
        const graceTime = 2;
        const maxBalance = web3.toWei(10, 'ether');
        const fee = web3.toWei(0.01, 'ether');
        await instance.createContestPoolDefinition(contestName, fee, startTime, endTime, graceTime, maxBalance);

        try {
            await instance.createContestPoolDefinition(contestName, fee, startTime, endTime, graceTime, maxBalance);
            assert(false, 'It should have failed because the contest name is repetead.');
        } catch (err) {
            assert(err);
            assert(err.message.includes("revert"));
        }
    });

    it(t('aOwner', 'createContestPoolDefinition', 'Should not be able to create a contest pool definition with a 0x0 contest name.', true), async function () {
        try {
          const contestName = '0x0000000000000000000000000000000000000000000000000000000000000000';
          await instance.createContestPoolDefinition(contestName, 10000, 1, 2, 10, 10);
          assert(false, 'It should have failed because the contest name is invalid.');
        } catch (err) {
          assert(err);
          assert(err.message.includes("revert"));
        }
    });

    it(t('aOwner', 'createContestPoolDefinition', 'Should not be able to create a contest pool definition with end date equals to 0.', true), async function () {
        try {
            await instance.createContestPoolDefinition('CustomValue', 20000, 0, 2, 2, 10);
            assert(false, 'It should have failed because the start date is zero.');
        } catch (err) {
            assert(err);
            assert(err.message.includes("revert"));
        }
    });

    it(t('aPlayer', 'createContestPoolDefinition', 'A player should not be able to create a contest pool definition.', true), async function () {
      try {
          const player = accounts[4];
          await instance.createContestPoolDefinition('CustomValue', 1000, 1000, 2000, 2, 10, {from: player});
          assert(false, 'It should have failed because a player should not able to create a definition.');
      } catch (err) {
          assert(err);
          assert(err.message.includes("revert"));
      }
    });

    it(t('aUser', 'createContestPool', 'Should be able to send create a contest pool based on a definition.'), async function () {
        const contestName = stringUtils.uniqueText('Rusia2018');
        // TODO : add test to check manager and owner address of contest pool should be different
        const startTime = 1000;
        const endTime = 2000;
        const graceTime = 2;
        const maxBalance = web3.toWei(1, 'ether');
        const fee = web3.toWei(0.01, 'ether');
        const amountPerPlayer = web3.toWei(0.1, 'ether');
        const contestNameBytes32 = stringUtils.stringToBytes32(contestName);

        await instance.createContestPoolDefinition(contestName, fee, startTime, endTime, graceTime, maxBalance);

        await instance.createContestPool(contestName, amountPerPlayer, {
            from: accounts[3],
            value: fee
        });

        let contestPoolAddress;
        let contestPool;

        const callback = async function (log) {
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
            assert.equal(startDateContestPool, startTime);
            assert.equal(endDateContestPool, endTime);
            assert.equal(maxBalanceContestPool, maxBalance);
        };
        await utils.assertEvent(instance, {
            event: "CreateContestPool", args: {
                contestName: contestNameBytes32
            }
        }, 1, callback);
    });

    it(t('aUser', 'createContestPool', 'Should not be able to create a contest pool with not pre-existed contest name.', true), async function () {
        const contestName = stringUtils.uniqueText('Rusia2018');
        const amountPerPlayer = web3.toWei(2, 'ether');
        const fee = web3.toWei(0.01, 'ether');
        try {
            await instance.createContestPool(contestName, amountPerPlayer, {
                value: fee
            });
            assert(false, 'It should fail because contest name is invalid.');
        } catch (err) {
            assert(err);
            assert(err.message.includes("revert"));
        }
    });

    it(t('aPlayer', 'createContestPool', 'Should not be able to create a contest pool without paying a fee.', true), async function () {
        const contestName = stringUtils.uniqueText('MyCustomContestPool');
        const startTime = 1000;
        const endTime = 2000;
        const graceTime = 2;
        const maxBalance = web3.toWei(1, 'ether');
        const fee = web3.toWei(0.01, 'ether');
        const amountPerPlayer = web3.toWei(0.1, 'ether');
        const contestNameBytes32 = stringUtils.stringToBytes32(contestName);

        await instance.createContestPoolDefinition(contestNameBytes32, fee, startTime, endTime, graceTime, maxBalance);

        try {
            await instance.createContestPool(contestNameBytes32, amountPerPlayer, {
                from: accounts[3],
                value: 0
            });
            assert(false, 'It should fail because player did not pay the fee.');
        } catch (err) {
            assert(err);
            assert(err.message.includes("revert"));
        }
    });

    it(t('aPlayer', 'createContestPool', 'When creating a contest pool, the factory balance should be increased based on the fee defined in the pool definition.'), async function () {
        const contestName = stringUtils.uniqueText('MyPool');
        const startTime = 1000;
        const endTime = 2000;
        const graceTime = 2;
        const maxBalance = web3.toWei(10, 'ether');
        const amountPerPlayer = web3.toWei(0.01, 'ether');
        const fee = web3.toWei(5, 'ether');

        const initialBalanceFactory = web3.eth.getBalance(instance.address).toNumber();

        const previousBalanceFactory = parseInt(fee) + parseInt(initialBalanceFactory);
        await instance.createContestPoolDefinition(contestName, fee, startTime, endTime, graceTime, maxBalance);

        await instance.createContestPool(contestName, amountPerPlayer, {
            from: accounts[3],
            value: fee
        });

        const finalBalanceFactory = web3.eth.getBalance(instance.address).toNumber();
       
        assert.equal(previousBalanceFactory, finalBalanceFactory);
    });

    it(t('aPlayer', 'createContestPool', 'Should not be able to create a contest pool paying a different fee.', true), async function () {
        const contestName = stringUtils.uniqueText('MyContest');
        const startTime = 1000;
        const endTime = 2000;
        const graceTime = 2;
        const maxBalance = web3.toWei(10, 'ether');
        const amountPerPlayer = web3.toWei(0.01, 'ether');
        const fee = web3.toWei(5, 'ether');
        const myFee = web3.toWei(4.9, 'ether');

        await instance.createContestPoolDefinition(contestName, fee, startTime, endTime, graceTime, maxBalance);

        try {
            await instance.createContestPool(contestName, amountPerPlayer, {
                from: accounts[3],
                value: myFee
            });
            assert(false, 'It should fail because fee is not correct.');
        } catch (err) {
            assert(err);
            assert(err.message.includes("revert"));
        }
    });

    it(t('aOwner', 'withdrawFee', 'Should be able to withdraw factory balance.'), async function () {
        const contestName = stringUtils.uniqueText('MyContest');
        const graceTime = 2;
        const amountPerPlayer = web3.toWei(0.01, 'ether');
        const fee = web3.toWei(0.005, 'ether');

        await instance.createContestPoolDefinition(
            contestName,
            fee,
            toMillis(2018, 01, 01),
            toMillis(2018, 02, 01),
            graceTime,
            web3.toWei(5, 'ether')
        );

        const initialOwnerBalance = await web3.eth.getBalance(owner).toNumber();
        
        const initialBalanceFactory = await web3.eth.getBalance(instance.address).toNumber();
        
        await instance.createContestPool(
            contestName,
            amountPerPlayer, {
                from: accounts[3],
                value: fee
            }
        );

        await instance.withdrawFee({
            from: owner
        });

        const finalBalanceFactory = await web3.eth.getBalance(instance.address).toNumber();
        assert.equal(finalBalanceFactory, 0);

        const finalOwnerBalance = await web3.eth.getBalance(owner).toNumber();
        assert.ok(finalOwnerBalance >= initialOwnerBalance);
        
        const marginError = initialOwnerBalance * 0.00001976;//Gas consumed.
        const expectedFinalOwnerBalance = parseInt(initialBalanceFactory) + parseInt(initialOwnerBalance);
        const finalDifference = finalOwnerBalance - expectedFinalOwnerBalance;

        assert.ok(marginError >= finalDifference);
    });
    
    it(t('aPlayer', 'withdrawFee', 'Should not able to withdraw balance from factory.', true), async function () {
        const contestName = stringUtils.uniqueText('MyContest');
        const graceTime = 2;
        const amountPerPlayer = web3.toWei(0.01, 'ether');
        const fee = web3.toWei(0.005, 'ether');

        await instance.createContestPoolDefinition(
            contestName,
            fee,
            toMillis(2018, 01, 01),
            toMillis(2018, 02, 01),
            graceTime,
            web3.toWei(5, 'ether')
        );

        await instance.createContestPool(
            contestName,
            amountPerPlayer, {
                from: accounts[3],
                value: fee
            }
        );

        try {
            await instance.withdrawFee({
                from: player1
            });
            assert(false, 'It should fail because a non owner is trying to withdraw.');
        } catch (err) {
            assert(err);
            assert(err.message.includes("revert"));
        }
    });

    it(t('aPlayer', 'createContestPoolDefinition', 'Should be able to create a contest pool definition with fee equals to 0.'), async function () {
        const contestName = stringUtils.uniqueText('MyContestPool');
        const startTime = 1000;
        const endTime = 2000;
        const graceTime = 2;
        const maxBalance = web3.toWei(10, 'ether');
        const fee = 0;

        await instance.createContestPoolDefinition(contestName, fee, startTime, endTime, graceTime, maxBalance);
        const result = await instance.definitions(contestName);

        assert.equal(contestName, stringUtils.cleanNulls(web3.toAscii(result[0])));
        assert.equal(startTime, result[1]);
        assert.equal(endTime, result[2]);
        assert.equal(graceTime, result[3]);
        assert.equal(maxBalance, result[4]);
        assert.equal(fee, result[5]);
    });
});