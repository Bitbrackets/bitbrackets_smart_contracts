const leche = require('leche');
const dateUtil = require('./utils/DateUtil');
const withData = leche.withData;
const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const {assertEvent, emptyCallback} = require("./utils/utils.js");
const t = require('./utils/TestUtil').title;
const amount = require('./utils/AmountUtil').expected;
const Builder = require('./utils/ContestPoolBuilder');

/**
 * 
 * @author Guillermo Salazar
 */
contract('ContestPoolClaimPaymentByWinnerTest', accounts => {
    let contestPoolInstance;
    const defaultPrediction = [1,2,3,4,5,6,7,8,9,10];
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
    // _1_1Winners
    const _1_players = [player1];
    const _1_winners = [player1];
    const _1_payments = [];
    const _1_expectedAmount = amount(amountPerPlayer, _1_winners, _1_players, 10, 10);
    // _2_1Winners2Players
    const _2_players = [player1, player2];
    const _2_winners = [player1];
    const _2_payments = [];
    const _2_expectedAmount = amount(amountPerPlayer, _2_players, _2_winners, 10, 10);

    // _3_2Winners2Players
    const _3_players = [player1, player2];
    const _3_winners = [player1, player2];
    const _3_payments = [];
    const _3_expectedAmount = amount(amountPerPlayer, _3_players, _3_winners, 10, 10);

    // _4_2Winners3Players
    const _4_players = [player1, player2, player3];
    const _4_winners = [player1, player2];
    const _4_payments = [];
    const _4_expectedAmount = amount(amountPerPlayer, _4_players, _4_winners, 5, 5);

    // _5_2Winners5Players
    const _5_players = [player1, player2, player3, player4, player5];
    const _5_winners = [player1, player2];
    const _5_payments = [];
    const _5_expectedAmount = amount(amountPerPlayer, _5_players, _5_winners, 10, 15);

    withData({
        _1_1Win_1Pla: [10, 10, player1, _1_winners, _1_players, _1_payments, _1_expectedAmount],
        _2_1Win_2Pla: [10, 10, player1, _2_winners, _2_players, _2_payments, _2_expectedAmount],
        _3_2Win_2Pla: [10, 10, player1, _3_winners, _3_players, _3_payments, _3_expectedAmount],
        _4_2Win_3Pla: [ 5,  5, player1, _4_winners, _4_players, _4_payments, _4_expectedAmount],
        _5_2Win_5Pla: [10, 15, player1, _5_winners, _5_players, _5_payments, _5_expectedAmount]
    }, function(managerFee, ownerFee, winner, winners, players, payments, expectedAmount) {
        it(t('aWinner', 'claimPaymentByWinner', 'Winner should be able to claim prize.'), async function() {
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

            const initialWinnerBalance = await web3.eth.getBalance(winner).toNumber();
            const initialContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();

            await builder.predictionsDef(amountPerPlayer, defaultPrediction, players);
            await builder.currentTime(owner, 2018, 01, 16);
            
            const afterPredictionWinnerBalance = await web3.eth.getBalance(winner).toNumber();
            const afterPredictionContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();

            //Invocation
            await contestPoolInstance.claimPaymentByWinner({from: winner});

            //Assertions
            //Assert event
            assertEvent(contestPoolInstance, {event: 'LogClaimPaymentByWinner', args: {
                contractAddress: contestPoolInstance.address,
                winner: winner
            }}, 1, emptyCallback);

            const finalWinnerBalance = await web3.eth.getBalance(winner).toNumber();
            const finalContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();

            //Assert contract balances between before and after claiming payment by the winner. 
            const expectedContractBalance = finalContractBalance + expectedAmount;
            assert.equal(afterPredictionContractBalance, expectedContractBalance);

            //Assert payment was done for the winner.
            const paymentsResult = await contestPoolInstance.payments(winner);
            assert.ok(paymentsResult);

            //Assert winner balance between 'after sending prediction' and final one.
            assert.ok(afterPredictionWinnerBalance, finalWinnerBalance + expectedAmount);
        });
    });

    withData({
        _1_1Win_1Pla: [10, 10, player1, _1_winners, _1_players, _1_payments, _1_expectedAmount],
        _2_1Win_2Pla: [10, 10, player1, _2_winners, _2_players, _2_payments, _2_expectedAmount],
        _3_2Win_2Pla: [10, 10, player1, _3_winners, _3_players, _3_payments, _3_expectedAmount],
        _4_2Win_3Pla: [ 5,  5, player1, _4_winners, _4_players, _4_payments, _4_expectedAmount],
        _5_2Win_5Pla: [10, 15, player1, _5_winners, _5_players, _5_payments, _5_expectedAmount]
    }, function(managerFee, ownerFee, winner, winners, players, payments, expectedAmount) {
        it(t('aWinner', 'claimPaymentByWinner', 'Should not be able to claim payment before endTime.', true),
        async () => {
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
            await builder.currentTime(owner, 2018, 01, 08);
            const initialContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();
            //Invocation
            try {
                await contestPoolInstance.claimPaymentByWinner({from: winner});
                assert(false, 'It should have failed because it is before the end date.');
            } catch (error) {
                assert(error);
                assert(error.message.includes("revert"));
                const finalContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();
                assert.equal(finalContractBalance, initialContractBalance);
            }
        })
    });

    withData({
        _1_1Win_1Pla: [10, 10, player1, _1_winners, _1_players, _1_payments, _1_expectedAmount],
        _2_1Win_2Pla: [10, 10, player1, _2_winners, _2_players, _2_payments, _2_expectedAmount],
        _3_2Win_2Pla: [10, 10, player1, _3_winners, _3_players, _3_payments, _3_expectedAmount],
        _4_2Win_3Pla: [ 5,  5, player1, _4_winners, _4_players, _4_payments, _4_expectedAmount],
        _5_2Win_5Pla: [10, 15, player1, _5_winners, _5_players, _5_payments, _5_expectedAmount]
    }, function(managerFee, ownerFee, winner, winners, players, payments, expectedAmount) {
        it(t('aWinner', 'claimPaymentByWinner', 'Winner should not be able to claim prize twice', true), async () => {
                //Setup
            const builder = new Builder(contestPoolInstance);
            await builder.startTime(owner, 2018, 01, 5);
            await builder.endTime(owner, 2018, 01, 10);//5 days to wait for the match results.
            await builder.graceTimeDays(owner, 5);//5 days to publish your scores.
            await builder.managerFee(owner, 10);
            await builder.ownerFee(owner, 10);
            await builder.amountPerPlayer(owner, amountPerPlayer);
            await builder.winners(owner, winners);
            await builder.paymentsTrue(owner, payments);
            await builder.currentTime(owner, 2018, 01, 01);

            await builder.predictionsDef(amountPerPlayer, defaultPrediction, [player1]);
            await builder.currentTime(owner, 2018, 01, 08);
            const initialContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();


            await builder.currentTime(owner, 2018, 1, 16);
            const initialBalancePlayer1 = await web3.eth.getBalance(player1).toNumber();

            await contestPoolInstance.claimPaymentByWinner({from: player1});
            const finalBalancePlayer1 = await web3.eth.getBalance(player1).toNumber();

            try {
                const result = await contestPoolInstance.claimPaymentByWinner({from: player1});
                assert(false, 'It should have failed. Winner can claim the prize only once.');
            } catch (error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    it(t('anUser', 'claimPaymentByWinner', 'A non winner should not be able to claim prize', true), async () => {
        const builder = new Builder(contestPoolInstance);
        await builder.startTime(owner, 2018, 01, 5);
        await builder.endTime(owner, 2018, 01, 10);//5 days to wait for the match results.
        await builder.graceTimeDays(owner, 5);//5 days to publish your scores.
        await builder.managerFee(owner, 10);
        await builder.ownerFee(owner, 10);
        await builder.amountPerPlayer(owner, amountPerPlayer);
        await builder.winners(owner, _3_winners);
        await builder.paymentsTrue(owner, []);
        await builder.currentTime(owner, 2018, 01, 01);

        await builder.predictionsDef(amountPerPlayer, defaultPrediction, _3_players);
        await builder.currentTime(owner, 2018, 01, 08);
        const initialContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();


        await builder.currentTime(owner, 2018, 1, 16);
        const initialBalancePlayer5 = await web3.eth.getBalance(player5).toNumber();

        try {
            await contestPoolInstance.claimPaymentByWinner({from: player5});
            assert(false, 'it should have failed because player is not a winner.');
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });
});
