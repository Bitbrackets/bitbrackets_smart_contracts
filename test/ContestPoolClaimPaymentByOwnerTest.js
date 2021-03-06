const leche = require('leche');
const withData = leche.withData;
const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const BbVault = artifacts.require("./BbVault.sol");
const {assertEvent, emptyCallback} = require("./utils/utils.js");
const t = require('./utils/TestUtil').title;
const amount = require('./utils/AmountUtil').expected;
const Builder = require('./utils/ContestPoolBuilder');


/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
contract('ContestPoolClaimPaymentByOwnerTest', accounts => {
    let contestPoolInstance;
    const defaultPrediction = [10101010, 01010101];
    const owner = accounts[0];
    const manager = accounts[1];
    const player1 = accounts[2];
    const player2 = accounts[3];
    const player3 = accounts[4];
    const player4 = accounts[5];
    const player5 = accounts[6];
    const player6 = accounts[7];
    const amountPerPlayer = web3.toWei(0.01, 'ether');
    const player7 = accounts[8];
    const player8 = accounts[9];

    beforeEach('Deploying contract for each test', async () => {
        contestPoolInstance = await ContestPoolMock.new(
            BbStorage.address,
            manager
        );
    });

    // _1_1Win_1Play
    const _1_players = [player1];
    const _1_winners = [player1];
    const _1_payments = [];
    // _2_1Win_2Play
    const _2_players = [player2, player1];
    const _2_winners = [player1];
    const _2_payments = [];
    // _3_2Win_5Play
    const _3_players = [player2, player1, player4, player3];
    const _3_winners = [player1, player2];
    const _3_payments = [];

    //_4_Fee_05_05_Win_3_Pla_8
    const _4_players = [player1, player2, player3, player4, player5, player6, player7, player8];
    const _4_winners = [player1, player2, player8];
    const _4_payments = [];
    withData({
        _1_Fee_10_10_Win_1_Pla_1: [10, 10, _1_winners, _1_players, _1_payments],
        _2_Fee_05_05_Win_1_Pla_2: [ 5,  5, _2_winners, _2_players, _2_payments],
        _3_Fee_10_05_Win_2_Pla_4: [10,  5, _3_winners, _3_players, _3_payments],
        _4_Fee_05_05_Win_3_Pla_8: [5,  5, _4_winners, _4_players, _4_payments],
    }, function(managerFee, ownerFee, winners, players, payments) {
        it(t('aOwner', 'claimPaymentByOwner', 'Should be able to claim the payment.'), async function() {
            //Setup
            const builder = new Builder(contestPoolInstance);
            await builder.startTime(owner, 2018, 01, 5);
            await builder.endTime(owner, 2018, 01, 10);//5 days to wait for the match results.
            await builder.graceTimeDays(owner, 5);//5 days to publish your scores.
            await builder.managerFee(owner, managerFee);
            await builder.ownerFee(owner, ownerFee);
            await builder.amountPerPlayer(owner, amountPerPlayer);
            await builder.winners(owner, winners);
            await builder.paymentsTrue(owner, payments);
            await builder.currentTime(owner, 2018, 01, 01);
            
            const initialBbVaultBalance = await web3.eth.getBalance(BbVault.address).toNumber();
            const initialContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();

            await builder.predictionsDef(amountPerPlayer, defaultPrediction, players);
            await builder.currentTime(owner, 2018, 01, 16);

            const afterPredictionBbVaultBalance = await web3.eth.getBalance(BbVault.address).toNumber();
            const afterPredictionContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();
            const expectedOwnerAmount = afterPredictionContractBalance * ownerFee / 100;

            //Invocation
            await contestPoolInstance.claimPaymentByOwner({from: owner});

            //Assertions
            //Assert event
            await assertEvent(contestPoolInstance, {event: 'LogClaimPaymentByOwner', args: {
                contractAddress: contestPoolInstance.address,
                owner: BbVault.address
            }}, 1, emptyCallback);

            const finalBbVaultBalance = await web3.eth.getBalance(BbVault.address).toNumber();
            const finalContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();

            //Assert contract balance between before and after claiming payment by the owner. 
            assert.equal(finalContractBalance, afterPredictionContractBalance - expectedOwnerAmount);

            //Assert payment was done for the winner.
            const paymentsResult = await contestPoolInstance.payments(BbVault.address);
            assert.ok(paymentsResult);

            //Assert owner balance between 'after sending prediction' and final one.
            assert.ok(finalBbVaultBalance, afterPredictionBbVaultBalance + expectedOwnerAmount);
        });
    });

    withData({
        _1_Fee_10_10_Win_1_Pla_1_claimTwice: [10, 10, _1_winners, _1_players, _1_payments]
    }, function(managerFee, ownerFee, winners, players, payments) {
        it(t('aOwner', 'claimPaymentByOwner', 'Should not be able to claim the payment twice.', true), async function() {
            //Setup
            const builder = new Builder(contestPoolInstance);
            await builder.startTime(owner, 2018, 01, 5);
            await builder.endTime(owner, 2018, 01, 10);//5 days to wait for the match results.
            await builder.graceTimeDays(owner, 5);//5 days to publish your scores.
            await builder.managerFee(owner, managerFee);
            await builder.ownerFee(owner, ownerFee);
            await builder.amountPerPlayer(owner, amountPerPlayer);
            await builder.winners(owner, winners);
            await builder.paymentsTrue(owner, payments);
            await builder.currentTime(owner, 2018, 01, 01);
            await builder.predictionsDef(amountPerPlayer, defaultPrediction, players);
            await builder.currentTime(owner, 2018, 01, 16);
            await builder.claimPaymentByWinner(winners);

            //Invocation
            await contestPoolInstance.claimPaymentByOwner({from: owner});

            //Assertions
            await assertEvent(contestPoolInstance, {event: 'LogClaimPaymentByOwner', args: {
                contractAddress: contestPoolInstance.address,
                owner: BbVault.address
            }}, 1, emptyCallback);

            try {
                await contestPoolInstance.claimPaymentByOwner({from: owner});
                assert(false, "It should have failed because owner have already claimed the payment.")
            } catch (error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    withData({
        _1_Fee_10_10_Win_1_Pla_1_claimTwice: [10, 10, _1_winners, _1_players, _1_payments]
    }, function(managerFee, ownerFee, winners, players, payments) {
        it(t('aOwner', 'claimPaymentByOwner', 'Should not be able to claim the payment because pool has not started.', true), async function() {
            //Setup
            const builder = new Builder(contestPoolInstance);
            await builder.startTime(owner, 2018, 01, 5);
            await builder.endTime(owner, 2018, 01, 10);//5 days to wait for the match results.
            await builder.graceTimeDays(owner, 5);//5 days to publish your scores.
            await builder.managerFee(owner, managerFee);
            await builder.ownerFee(owner, ownerFee);
            await builder.amountPerPlayer(owner, amountPerPlayer);
            await builder.winners(owner, winners);
            await builder.paymentsTrue(owner, payments);
            await builder.currentTime(owner, 2018, 01, 01);
            await builder.predictionsDef(amountPerPlayer, defaultPrediction, players);
            await builder.currentTime(owner, 2018, 01, 5);

            //Invocation
            try {
                await contestPoolInstance.claimPaymentByOwner({from: owner});
                assert(false, "It should have failed because the contest pool has not started yet.")
            } catch (error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });
});
