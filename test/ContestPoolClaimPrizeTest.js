const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const dateUtil = require('./utils/DateUtil');
const ResultsLookup = artifacts.require("./ResultsLookup.sol");
const BbStorage = artifacts.require("./BbStorage.sol");

const _ = require('lodash');
const t = require('./utils/TestUtil').title;
const { toBigNumberArray, assertBigNumberArrayIsEqual } = require('./utils/TestUtil');
const { getScoreWithArray } = require('./utils/ScoreUtil');

contract('ContestPoolClaimPrizeTest', accounts => {
    let contestPoolInstance;
    let resultsLookupInstance;
    let owner = accounts[0];
    let manager = accounts[9];
    let player1 = accounts[1];
    let player2 = accounts[2];
    let player3 = accounts[3];
    let player4 = accounts[4];
    let player5 = accounts[5];

    let startTime = dateUtil.toMillis(2018, 6, 1)
    let endTime = dateUtil.toMillis(2018, 6, 10);
    let graceTime = dateUtil.daysToMillis(1);

    const maxBalance = web3.toWei(1, 'ether');
    const amountPerPlayer = web3.toWei(0.3, "ether");
    const contribution = web3.toWei(0.3, "ether");
    const prizeValue = web3.toWei(0.05, "ether");
    const managerFee = 10;
    const ownerFee = 10;
    const managerAndOwnerFee = managerFee + ownerFee;
    const winnersFee = 100 - managerAndOwnerFee;


    const prediction = [8,2,1,3,5,6,111,17,32,111,9,7,31,28,22,14,111,7,11,30];

    const result = [8,3,111,3,5,1,24,17,21,13,9,7,31,28,22,14,18,7,11,30];

/*
    beforeEach('setup contract for each test', async () => {
        resultsLookupInstance = await ResultsLookup.deployed();
        contestPoolInstance = await ContestPoolMock.new(
            BbStorage.address,
            manager,
            "Rusia2018",
            startTime,
            endTime,
            graceTime,
            maxBalance,
            amountPerPlayer,
            managerFee,
            ownerFee
        );
    });
    */

    xit(t('anUser', 'publishScore', 'Player should be able to publish score'), async () => {
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 12));

        await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});
        //start the contest
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 6, 5));
        // setting results
        // await contestPoolInstance.setMockResults(result, 4);
        await resultsLookupInstance.registerResult(
            "Rusia2018", 
            result, 
            4, 
            { from:  owner}
        );
        
        const success = await contestPoolInstance.publishHighScore({from: player1});

        const highScore = await contestPoolInstance.highScore();
        console.log("high score", highScore.toNumber());

        assert(success, "should update score to high score");

        assert.equal(getScoreWithArray(prediction, result,4), highScore.toNumber(), 'Player 1 should have high score');
    });

    xit(t('anUser', 'claimThePrize', 'Winner should be able to claim prize.'), async () => {

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 12));
        console.log('AAA');
        await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();
        const initialBalanceConstestPool = web3.eth.getBalance(contestPoolInstance.address).toNumber();
        console.log('BBB');
        await contestPoolInstance.addWinner(player1);
        await contestPoolInstance.setHighestScore(25);
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 7, 12));
        console.log('CCC');
        await contestPoolInstance.claimThePrize({from: player1});
        const finalBalancePlayer1 = web3.eth.getBalance(player1).toNumber();
        const finalBalanceConstestPool = web3.eth.getBalance(contestPoolInstance.address).toNumber();
        console.log('DDD');
        const winnersAmount = initialBalanceConstestPool * (winnersFee / 100);

        assert(initialBalancePlayer1 < finalBalancePlayer1);
        assert.equal(finalBalanceConstestPool, initialBalanceConstestPool * ( managerAndOwnerFee / 100));

    });

    xit(t('anUser', 'claimThePrize', 'Winner should not be able to claim prize before endTime.', true), async () => {

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 10));

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});

        await contestPoolInstance.addWinner(player1, prizeValue, {from: owner});

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 6, 10));
        try {
            const result = await contestPoolInstance.claimThePrize({from: player1});
            assert(false, 'It should have failed because end date.');
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    xit(t('anUser', 'claimThePrize', 'A non winner should not be able to claim prize', true), async () => {

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 10));

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});

        await contestPoolInstance.addWinner(player1);
        await contestPoolInstance.setHighestScore(25);
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 7, 10));
        try {
            const result = await contestPoolInstance.claimThePrize({from: player2});
            assert(false, 'it should have failed because address is not a winner.');
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    xit(t('allWinners', 'claimThePrize', 'All winners should be able to claim prize'), async () => {

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 1));

        await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});
        await contestPoolInstance.sendPredictionSet(prediction, {from: player2, value: contribution});

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();
        const initialBalancePlayer2 = web3.eth.getBalance(player2).toNumber();

        await contestPoolInstance.addWinner(player1, prizeValue, {from: owner});
        await contestPoolInstance.addWinner(player2, prizeValue, {from: owner});
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 7, 12));

        await contestPoolInstance.claimThePrize({from: player1});
        await contestPoolInstance.claimThePrize({from: player2});

        const finalBalancePlayer1 = web3.eth.getBalance(player1).toNumber();
        const finalBalancePlayer2 = web3.eth.getBalance(player2).toNumber();

        assert(initialBalancePlayer1 < finalBalancePlayer1);
        assert(initialBalancePlayer2 < finalBalancePlayer2);
    });

    xit(t('aWinner', 'claimThePrize', 'Winner should not be able to claim prize twice', false), async () => {
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 1));
        await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 7, 12));
        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();
        await contestPoolInstance.addWinner(player1, prizeValue, {from: owner});

        await contestPoolInstance.claimThePrize({from: player1});
        const finalBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        assert(initialBalancePlayer1 < finalBalancePlayer1);
        try {
            const result = await contestPoolInstance.claimThePrize({from: player1});
            assert(false, 'It should have failed. Winner can claim the prize only once.');
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });
    
    xit(t('aPlayer', 'sendPrediction', 'Should take contributions from players'), async () => {
        const contribution = web3.toWei(0.3, "ether");

        const initialBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber()

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 1));

        await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});

        const contractPrediction = await contestPoolInstance.getPredictionSet(player1);
        const finalBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber();

        assertBigNumberArrayIsEqual(contractPrediction, toBigNumberArray(prediction));
        assert.equal(initialBalance + contribution, finalBalance);
    });

    xit(t('aPlayer', 'sendPrediction', 'Should not be able to contributes twice.', true), async () => {
        const contribution = web3.toWei(0.3, "ether");
   
        const initialBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber()

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 1));
        await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});
        const finalBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber();

        try {
            await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});
            assert(false, "should have failed when trying to contribute two times ");
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
            assert.equal(initialBalance + contribution, finalBalance);
        }
    });

    xit(t('aPlayer', 'sendPrediction', 'Should not able to take contributions higher than max balance.', true), async () => {
        const contribution = web3.toWei(2, "ether");//Max Balance: 1 eth

        const initialBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber()

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 1));

        try {
            await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});
            asser(false, 'It should have failed because contribution is higher than max balance.');
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    xit(t('aPlayer', 'sendPrediction', 'Should not able to take contributions equals to max balance.', true), async () => {
        const contribution = web3.toWei(1, "ether");//Max Balance: 1 eth

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 1));

        try {
            await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});
            asser(false, 'It should have failed because contribution is higher than max balance.');
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    xit(t('aManager', 'sendPrediction', 'Should not be able to contribute to his contest pool.', true), async () => {
        const contribution = web3.toWei(0.2, "ether");


        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 1));
        try {
            await contestPoolInstance.sendPredictionSet(prediction, {from: manager, value: contribution});
            assert(false, 'It should have failed because a manager must not participate in his own contest pool.');
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    xit(t('aManager', 'claimCommissionByManager', 'Should not be able to claim commission before all winner have claimed the prize', true), async () => {
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 1));
        await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 7, 12));
        await contestPoolInstance.addWinner(player1, prizeValue, {from: owner});

        // await contestPoolInstance.claimThePrize({from: player1});
        try {
            await contestPoolInstance.claimCommissionByManager({from: manager});
            assert(false, 'It should have failed because a manager can not claim his commission before the winners.');
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    xit(t('aManager', 'claimCommissionByManager', 'Should  be able to claim commission after all winner have claimed the prize'), async () => {
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 1));
        await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 7, 12));

        const managerInitialBalance = web3.eth.getBalance(manager).toNumber();

        await contestPoolInstance.addWinner(player1, prizeValue, {from: owner});
        await contestPoolInstance.addPayment(manager, managerCommission, {from: owner});
        await contestPoolInstance.claimThePrize({from: player1});

        await contestPoolInstance.claimCommissionByManager({from: manager});

        const managerFinalBalance = web3.eth.getBalance(manager).toNumber();
        assert(managerFinalBalance > managerInitialBalance);

    });

    xit(t('theOwner', 'claimCommissionByOwner', 'Owner should  be able to claim commission'), async () => {
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018, 5, 1));
        await contestPoolInstance.sendPredictionSet(prediction, {from: player1, value: contribution});
        await contestPoolInstance.sendPredictionSet(prediction, {from: player2, value: contribution});
        const managerInitialBalance = web3.eth.getBalance(owner).toNumber();

        await contestPoolInstance.addPayment(owner, managerCommission, {from: owner});

        await contestPoolInstance.claimCommissionByOwner({from: owner});

        const managerFinalBalance = web3.eth.getBalance(owner).toNumber();

        assert(managerFinalBalance > managerInitialBalance);

    });

    xit(t('theOwner', 'claimCommissionByOwner', 'Owner should not be able to claim commission without enough balance', true), async () => {

        await contestPoolInstance.addPayment(owner, managerCommission, {from: owner});

        try {
            await contestPoolInstance.claimCommissionByOwner({from: owner});
            assert(false, 'It should have failed because there is not enough balance to claim the commission.');
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }


    });
});
