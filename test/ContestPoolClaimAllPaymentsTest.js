const leche = require('leche');
const withData = leche.withData;
const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const CustomContract = artifacts.require("./mocks/CustomContract.sol");

const BbStorage = artifacts.require("./BbStorage.sol");
const {assertEvent, emptyCallback} = require("./utils/utils.js");
const t = require('./utils/TestUtil').title;
const amount = require('./utils/AmountUtil').expected;
const Builder = require('./utils/ContestPoolBuilder');

/**
 * @author Guillermo Salazar
 */
contract('ContestPoolClaimAllPaymentsTest', accounts => {
    let contestPoolInstance;
    let attackerInstance;
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
        attackerInstance = await CustomContract.new();
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
        _3_Fee_15_15_Win_2_Pla_4: [15, 15, _3_winners, _3_players, _3_payments],
        _4_Fee_10_05_Win_3_Pla_8: [10, 05, _4_winners, _4_players, _4_payments]
    }, function(managerFee, ownerFee, winners, players, payments) {
        it(t('all', 'claimAllPayments', 'Should be able to claim all the payments.'), async function() {
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

            const initial_ContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();

            //Claim payment by owner
            await contestPoolInstance.claimPaymentByOwner({from: owner});
            const afterOwner_ContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();
            const ownerAmount = initial_ContractBalance - afterOwner_ContractBalance;
            
            //Claim payment by winners
            await builder.claimPaymentByWinner(winners);
            const afterWinners_ContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();
            const winnersAmount = afterOwner_ContractBalance - afterWinners_ContractBalance;

            //Claim payment by manager
            await contestPoolInstance.claimPaymentByManager({from: manager});
            const afterManager_ContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();
            const managerAmount = afterWinners_ContractBalance - afterManager_ContractBalance;

            //Assertions
            assert.equal(initial_ContractBalance, ownerAmount + winnersAmount + managerAmount);
            assert.equal(afterManager_ContractBalance, 0);
        });
    });

    withData({
        _1_Fee_10_10_Win_1_Pla_1: [10, 10, _1_winners, _1_players, _1_payments, web3.toWei(0.1, 'ether')],
        _2_Fee_05_05_Win_1_Pla_2: [ 5,  5, _2_winners, _2_players, _2_payments, web3.toWei(1, 'ether')],
        _3_Fee_15_15_Win_2_Pla_4: [15, 15, _3_winners, _3_players, _3_payments, web3.toWei(2, 'ether')],
        _4_Fee_10_05_Win_3_Pla_8: [10, 05, _4_winners, _4_players, _4_payments, web3.toWei(0.0256, 'ether')]
    }, function(managerFee, ownerFee, winners, players, payments, attackingAmount) {
        it(t('all', 'claimAllPaymentsWithAttacking', 'Should be able to claim all the payments.'), async function() {
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

            const initial_ContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();

            await attackerInstance.pay({value: attackingAmount, from: player8});
            const initialAttackerInstanceBalance = await web3.eth.getBalance(attackerInstance.address).toNumber();
            assert.equal(attackingAmount, initialAttackerInstanceBalance);

            await attackerInstance.attack(contestPoolInstance.address);

            const afterAttacking_ContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();

            assert.equal(initial_ContractBalance + initialAttackerInstanceBalance, afterAttacking_ContractBalance);

            //Claim payment by owner
            await contestPoolInstance.claimPaymentByOwner({from: owner});
            const afterOwner_ContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();
            const ownerAmount = afterAttacking_ContractBalance - afterOwner_ContractBalance;
            
            //Claim payment by winners
            await builder.claimPaymentByWinner(winners);
            const afterWinners_ContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();
            const winnersAmount = afterOwner_ContractBalance - afterWinners_ContractBalance;

            //Claim payment by manager
            await contestPoolInstance.claimPaymentByManager({from: manager});
            const afterManager_ContractBalance = await web3.eth.getBalance(contestPoolInstance.address).toNumber();
            const managerAmount = afterWinners_ContractBalance - afterManager_ContractBalance;

            //Assertions
            assert.equal(initial_ContractBalance, ownerAmount + winnersAmount + managerAmount);
            assert.equal(afterManager_ContractBalance, initialAttackerInstanceBalance);
        });
    });

});
