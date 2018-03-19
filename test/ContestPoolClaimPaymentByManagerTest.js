const leche = require('leche');
const withData = leche.withData;
const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const {assertEvent, emptyCallback} = require("./utils/utils.js");
const t = require('./utils/TestUtil').title;
const amount = require('./utils/AmountUtil').expected;
const Builder = require('./utils/ContestPoolBuilder');

/**
 * @author Guillermo Salazar
 */
contract('ContestPoolClaimPaymentByManagerTest', accounts => {
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

    withData({
        _1_1Win_1Pla: [10, 10, _1_winners, _1_players, _1_payments],
        _2_1Win_2Pla: [ 5,  5, _2_winners, _2_players, _2_payments]//,
        //_3_2Win_4Pla: [10,  5, _3_winners, _3_players, _3_payments]
    }, function(managerFee, ownerFee, winners, players, payments) {
        it(t('aManager', 'claimPaymentByManager', 'Should be able to claim the payment.'), async function() {
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
            
            const initialManagerBalance = await web3.eth.getBalance(manager).toNumber();
            const initialContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();

            await builder.predictionsDef(amountPerPlayer, defaultPrediction, players);
            await builder.currentTime(owner, 2018, 01, 16);
            
            const afterPredictionWinnerBalance = await web3.eth.getBalance(manager).toNumber();
            const afterPredictionContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();
            const expectedManagerAmount = afterPredictionContractBalance * managerFee / 100;
            const expectedOwnerAmount = afterPredictionContractBalance * ownerFee / 100;
            //console.log('Expected Owner:    ' + expectedOwnerAmount);
            //console.log('Expected Manager:    ' + expectedManagerAmount);

            await winners.forEach( async function(winner) {
                await contestPoolInstance.claimPaymentByWinner({from: winner});
            });

            //Invocation
            await contestPoolInstance.claimPaymentByManager({from: manager});

            //Assertions
            //Assert event
            assertEvent(contestPoolInstance, {event: 'LogClaimPaymentByManager', args: {
                contractAddress: contestPoolInstance.address,
                manager: manager
            }}, 1, emptyCallback);

            const finalWinnerBalance = await web3.eth.getBalance(manager).toNumber();
            const finalContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();
            //console.log('After Contract:    ' + afterPredictionContractBalance);
            //console.log('Final Contract:    ' + finalContractBalance);

            //console.log('333');
            //Assert contract balances between before and after claiming payment by the manager (and winners). 
            assert.equal(finalContractBalance, expectedOwnerAmount);
            //console.log('444');
            //Assert payment was done for the winner.
            const paymentsResult = await contestPoolInstance.payments(manager);
            assert.ok(paymentsResult);
            //console.log('555');
            //Assert manager balance between 'after sending prediction' and final one.
            assert.ok(afterPredictionWinnerBalance, finalWinnerBalance + expectedManagerAmount);
        });
    });
});
