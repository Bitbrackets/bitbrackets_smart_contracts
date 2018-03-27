const BbVault = artifacts.require("./BbVault.sol");
const BbVaultMock = artifacts.require("./mocks/BbVaultMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const leche = require('leche');
const withData = leche.withData;
const t = require('./utils/TestUtil').title;

/**
 * Using 'Leche' for multiple data provider.
 * 
 * @dev https://github.com/box/leche
 */
contract('BbVaultTest', accounts => {
    //let bbVault;
    const owner = accounts[0];
    const manager = accounts[1];
    const ceo = accounts[2];
    const player1 = accounts[3];
    const player2 = accounts[4];
    const player3 = accounts[5];
    const player4 = accounts[6];
    const player5 = accounts[7];
    const player6 = accounts[8];
    const player7 = accounts[9];

    beforeEach('Deploying contract for each test', async () => {
        bbVault = await BbVaultMock.deployed();
    });

    withData({
        _1_player: [player1, true],
        _2_owner: [owner, false],
        _3_manager: [manager, false],
        _4_ceo: [ceo, false]
    }, function(checkOwner, mustFail) {
        it(t('anUser', 'onlyAccountOwner', 'Should check modifier restrictions.'), async function() {
            //Invocation
            try {
                await bbVault._onlyAccountOwner({from: checkOwner});
                assert.ok(!mustFail, "It should not have failed.");
            } catch(error) {
                assert.ok(mustFail, "It should have failed.");
            }
        });
    });

    withData({
        _1_request1: ['Request1', 0.01, player1],
        _2_request2: ['Request2', 0.01, player2],
        _3_request3: ['Request3', 0.01, player3]
    }, function(name, amountInEther, toAccount) {
        it(t('anUser', 'createRequestTransaction', 'Should able to create request transaction.'), async function() {
            //Setup
            await bbVault.createRequestTransaction(
                name,
                web3.toWei(amountInEther, 'ether'),
                toAccount,
                {from: owner}
            );

            //Invocation
            await bbVault._requestTransactionIsPresent(name);
        });
    });

    withData({
        _1_requestIsEmpty: ['', 0.01, player1],
        _2_amountIs0: ['Value1', 0, player2],
        _3_toAccountIs0x0: ['Value2', 0.01, "0x0"]
    }, function(name, amountInEther, toAccount) {
        it(t('anUser', 'createRequestTransaction', 'Should not able to create request transaction.', true), async function() {
            //Invocation
            try {
                await bbVault.createRequestTransaction(
                    name,
                    web3.toWei(amountInEther, 'ether'),
                    toAccount,
                    {from: owner}
                );
                assert(false, "Should have failed because data is invalid.");
            } catch(error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    withData({
        _1_request1: ['Request11', 0.01, player1],
        _2_request2: ['Request12', 0.01, player2],
        _3_request3: ['Request13', 0.01, player3]
    }, function(name, amountInEther, toAccount) {
        it(t('anUser', 'getRequestTransaction', 'Should able to get a request transaction.'), async function() {
            //Invocation
            await bbVault.createRequestTransaction(
                name,
                web3.toWei(amountInEther, 'ether'),
                toAccount,
                {from: owner}
            );

            //Assertions
            const result = await bbVault._getRequestTransaction(name);

            const existResult = result[0];
            const amountResult = result[1];
            const toAccountResult = result[2];
            const votesResult = result[3];

            assert.equal(existResult, true);
            assert.equal(amountResult, web3.toWei(amountInEther, 'ether'));
            assert.equal(toAccountResult, toAccount);
            assert.equal(votesResult, 0);
        });
    });

    withData({
        _1_request1: [owner, 1]
    }, function(who, votesExpected) {
        it(t('anUser', 'voteRequestTransaction', 'Should able to get a request transaction.'), async function() {
            //Setup
            const name = 'CustomValue1';
            await bbVault.createRequestTransaction(
                name,
                web3.toWei(0.001, 'ether'),
                player1,
                {from: owner}
            );

            //Invocation
            await bbVault.voteRequestTransaction(name, {from: owner});

            //Assertions
            const result = await bbVault.getVotes(name);
            assert.equal(result, votesExpected);
        });
    });

    withData({
        _1_request1: [owner]
    }, function(who) {
        it(t('anUser', 'voteRequestTransaction', 'Should not able to vote a request transaction twice.', true), async function() {
            //Setup
            const name = 'CustomValue2';
            await bbVault.createRequestTransaction(
                name,
                web3.toWei(0.001, 'ether'),
                player1,
                {from: owner}
            );

            //Invocation
            await bbVault.voteRequestTransaction(name, {from: owner});

            //Assertions
            try {
                await bbVault.voteRequestTransaction(name, {from: owner});
                assert.ok(false, "It should have failed because a owner cannot vote twice.");
            } catch(error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    //Deposit
    //Withdrawal
    //Vote a request done.
    //Vote a request doesn't exist.
    //withdrawal a request done.
    //withdrawal a request doesn't exist.
});
