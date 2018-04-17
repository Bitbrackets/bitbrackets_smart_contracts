const BbVault = artifacts.require("./BbVault.sol");
const BbVaultMock = artifacts.require("./mocks/BbVaultMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const leche = require('leche');
const withData = leche.withData;
const t = require('./utils/TestUtil').title;


/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
contract('BbVaultTest', accounts => {

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
        it(t('anOwner', 'createRequestTransaction', 'Should able to create request transaction.'), async function() {
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
        _1_request1: ['PlayerRequest1', 0.01, player1],
        _2_request2: ['PlayerRequest2', 0.01, player2],
        _3_request3: ['PlayerRequest3', 0.01, player3]
    }, function(name, amountInEther, toAccount) {
        it(t('anUser', 'createRequestTransaction', 'Should not able to create request transaction.'), async function() {
            try {
                //Invocation
                await bbVault.createRequestTransaction(
                    name,
                    web3.toWei(amountInEther, 'ether'),
                    toAccount,
                    {from: toAccount}
                );
                assert.ok(false, "It should have failed because an user cannot create a request transaction.");
            } catch (error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    withData({
        _1_requestIsEmpty: ['', 0.01, player1],
        _2_amountIs0: ['Value1', 0, player2],
        _3_toAccountIs0x0: ['Value2', 0.01, "0x0"]
    }, function(name, amountInEther, toAccount) {
        it(t('anOwner', 'createRequestTransaction', 'Should not able to create request transaction with invalid data.', true), async function() {
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
        it(t('anOwner', 'getRequestTransaction', 'Should able to get a request transaction.'), async function() {
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
        it(t('anOwner', 'voteRequestTransaction', 'Should able to get a request transaction.'), async function() {
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
            const result = await bbVault.getVotesRequestTransaction(name);
            assert.equal(result, votesExpected);
        });
    });

    withData({
        _1_request1: [owner]
    }, function(who) {
        it(t('anOwner', 'voteRequestTransaction', 'Should not able to vote a request transaction twice.', true), async function() {
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

    withData({
        _1_owner: ['nameOwner1', owner],
        _2_owner: ['nameCeo1', ceo],
        _3_manager: ['nameManager1', manager]
    }, function(name, who) {
        it(t('anOwner', 'voteRequestTransaction', 'Should not able to vote a request transaction done.', true), async function() {
            //Setup
            await bbVault.createRequestTransaction(
                name,
                web3.toWei(0.001, 'ether'),
                player1,
                {from: who}
            );

            //Done
            await bbVault.doneRequestTransaction(name);
            const isDone = await bbVault.isDoneRequestTransaction(name, {from: who});
            assert.equal(isDone, true);

            //Invocation
            try {
                await bbVault.voteRequestTransaction(name, {from: who});
                assert.ok(false, "It should have failed because request transaction is done.");
            } catch(error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    withData({
        _1_owner: ['invalidNameOwner1', owner],
        _2_owner: ['invalidNameCeo1', ceo],
        _3_manager: ['invalidNameManager1', manager]
    }, function(name, who) {
        it(t('anOwner', 'voteRequestTransaction', 'Should not able to vote a request transaction does NOT exist.', true), async function() {
            //Invocation
            try {
                await bbVault.voteRequestTransaction(name, {from: who});
                assert.ok(false, "It should have failed because request transaction does not exist.");
            } catch(error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    withData({
        _1_deposit_0_001: ['anUser', player1, 0.001],
        _1_deposit_1_000: ['anUser', player3, 1.000],
        _1_deposit_1_000: ['aOwner', owner, 1.000]
    }, function(whoTitle, who, amountInEther) {
        it(t(whoTitle, 'deposit', 'Should able to deposit.'), async function() {
            //Setup
            const amountInWei = web3.toWei(amountInEther, 'ether');
            const initialBalance = await web3.eth.getBalance(bbVault.address).toNumber();
            
            //Invocation
            await bbVault.deposit(
                {
                    from: who,
                    value: amountInWei
                }
            );

            //Assertions
            const finalBalance = await web3.eth.getBalance(bbVault.address).toNumber();
            assert.equal(finalBalance, parseInt(initialBalance) + parseInt(amountInWei));
        })
    });

    withData({
        _1_deposit_0_001: ['anUser', player1],
        _1_deposit_1_000: ['anUser', player3],
        _1_deposit_1_000: ['aOwner', owner]
    }, function(whoTitle, who, amountInEther) {
        it(t(whoTitle, 'deposit', 'Should not able to deposit zero weis.', true), async function() {
            //Setup
            const amountInWei = web3.toWei(amountInEther, 'ether');
            const initialBalance = await web3.eth.getBalance(bbVault.address).toNumber();
            
            //Invocation
            try {
                await bbVault.deposit(
                    {
                        from: who,
                        value: 0
                    }
                );
                assert.ok(false, "It should have failed because amount is zero.");
            } catch(error) {
                assert(error);
                assert(error.message.includes("revert"));
                //Assertions
                const finalBalance = await web3.eth.getBalance(bbVault.address).toNumber();
                assert.equal(finalBalance, parseInt(initialBalance));
            }
        })
    });

    withData({
        _1_request1: ['ANewRequest1', 0.01, player1],
        _2_request2: ['ANewRequest2', 0.01, player2],
        _3_request3: ['ANewRequest3', 0.01, player3]
    }, function(name, amountInEther, toAccount) {
        it(t('anUser', 'voteRequestTransaction', 'Should not able to vote a request transaction.'), async function() {
            //Setup
            await bbVault.createRequestTransaction(
                name,
                web3.toWei(amountInEther, 'ether'),
                toAccount,
                {from: owner}
            );

            try {
                //Invocation
                await bbVault.voteRequestTransaction(name, {from: toAccount});
                assert.ok(false, "It should have failed because an user cannot vote a request transaction.");
            } catch (error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    withData({
        _1_request1: ['AWithdrawalRequest1', 0.01, [player1, player2], owner],
        _2_request2: ['AWithdrawalRequest2', 0.02, [player2], manager],
        _3_request3: ['AWithdrawalRequest3', 0.03, [player3], ceo]
    }, function(name, amountInEther, whoDeposits, whoWithdraw) {
        it(t('anOwner', 'withdrawal', 'Should able to withdrawal a request transaction.'), async function() {
            //Setup
            const initialBalance = await web3.eth.getBalance(bbVault.address).toNumber();
            const amountInWeis = web3.toWei(amountInEther, 'ether');
            const totalDeposit = whoDeposits.length * amountInWeis;
            
            for(whoDeposit in whoDeposits) {
                await bbVault.deposit({from: whoDeposits[whoDeposit], value: amountInWeis});    
            }

            const afterDepositBalance = await web3.eth.getBalance(bbVault.address).toNumber();
            await bbVault.createRequestTransaction(
                name,
                totalDeposit,
                player3,
                {from: owner}
            );
            await bbVault.voteRequestTransaction(name, {from: owner});
            await bbVault.voteRequestTransaction(name, {from: manager});

            //Invocation
            await bbVault.withdraw(name, {from: owner});

            assert.equal(afterDepositBalance - initialBalance, totalDeposit);
            
            const finalBalance = await web3.eth.getBalance(bbVault.address).toNumber();

            assert.equal(finalBalance, initialBalance);
        });
    });

    withData({
        _1_request1: ['InvalidTransactionRequest1', owner],
        _2_request2: ['InvalidTransactionRequest2', manager],
        _3_request3: ['InvalidTransactionRequest3', ceo]
    }, function(name, who) {
        it(t('anOwner', 'withdrawal', 'Should not able to withdrawal a invalid request transaction.', true), async function() {
            //Invocation
            try {
                await bbVault.withdraw(name, {from: who});
                assert.ok(false, "It should have failed because transaction request does not exist.");
            } catch(error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    withData({
        _1_request1: ['DoneTransactionRequest1', owner],
        _2_request2: ['DoneTransactionRequest2', manager],
        _3_request3: ['DoneTransactionRequest3', ceo]
    }, function(name, who) {
        it(t('anOwner', 'withdrawal', 'Should not able to withdrawal a request transaction done.', true), async function() {
            await bbVault.doneRequestTransaction(name);
            //Invocation
            try {
                await bbVault.withdraw(name, {from: who});
                assert.ok(false, "It should have failed because transaction request is done.");
            } catch(error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });
});
