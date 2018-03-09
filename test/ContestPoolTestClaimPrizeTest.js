const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const dateUtil = require('./DateUtil');

contract('ContestPoolWinnerClaimPrize', accounts => {
    let contestPoolInstance;
    let owner = accounts[9];
    let manager = accounts[0];
    let player1 = accounts[1];
    let player2 = accounts[2];

    let startTime = dateUtil.toMillis(2018,6,1)
    let endTime = dateUtil.toMillis(2018,6,10);
    let graceTime = 1 * 86400;

    const maxBalance = web3.toWei(1,'ether');
    const contribution = web3.toWei(0.3, "ether");
    const prizeValue = web3.toWei(0.05, "ether");

    const predictionStr = "01111111 11100100 00100111 10011110 01010001 01101010 00100000 00111010 10001010 10000111 00100100 11100011 00010010 11000111 01011001 10101101 ";
    const prediction = parseInt( predictionStr, 2 );

    beforeEach('setup contract for each test', async () => {
        contestPoolInstance = await ContestPoolMock.new(
            owner,
            manager,
            "Rusia2018",
            startTime,
            endTime,
            graceTime,
            maxBalance
        );
    });

    it('Winner should be able to claim prize', async() => {

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018,5,12));

        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        await contestPoolInstance.addWinner(player1, prizeValue, { from: owner });

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018,7,12));

        await contestPoolInstance.claimThePrize({ from: player1 });
        const finalBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        assert(initialBalancePlayer1 < finalBalancePlayer1);

    });

    it('Winner should not be able to claim prize before endTime.' , async() => {

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018,5,10));

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });

        await contestPoolInstance.addWinner(player1, prizeValue, { from: owner });

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018,6,10));
        try {
            const result = await contestPoolInstance.claimThePrize({from: player1});
            assert(false, 'It should have failed because end date.');
        }  catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    it('A non winner should not be able to claim prize ', async() => {

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018,5,10));

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });

        await contestPoolInstance.addWinner(player1, prizeValue, { from: owner });
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018,7,10));
        try {
            const result = await contestPoolInstance.claimThePrize({from: player2});
            assert(false,'it should have failed because address is not a winner.');
        }  catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    it('All winners should be able to claim prize', async() => {

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018,5,1));

        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });
        await contestPoolInstance.sendPrediction(prediction, { from: player2, value: contribution });

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();
        const initialBalancePlayer2 = web3.eth.getBalance(player2).toNumber();

        await contestPoolInstance.addWinner(player1, prizeValue, { from: owner });
        await contestPoolInstance.addWinner(player2, prizeValue, { from: owner });
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018,7,12));

        await contestPoolInstance.claimThePrize({ from: player1 });
        await contestPoolInstance.claimThePrize({ from: player2 });

        const finalBalancePlayer1 = web3.eth.getBalance(player1).toNumber();
        const finalBalancePlayer2 = web3.eth.getBalance(player2).toNumber();

        assert(initialBalancePlayer1 < finalBalancePlayer1);
        assert(initialBalancePlayer2 < finalBalancePlayer2);
    });

    it('Winner should be able to claim prize only once', async() => {
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018,5,1));
        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });
        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018,7,12));
        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();
        await contestPoolInstance.addWinner(player1, prizeValue, { from: owner });

        await contestPoolInstance.claimThePrize({ from: player1 });
        const finalBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        assert(initialBalancePlayer1 < finalBalancePlayer1);
        try {
            const result = await contestPoolInstance.claimThePrize({from: player1});
            assert(false,'It should have failed. Winner can claim the prize only once.');
        }  catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }
    });

    it('Should take contributions from players', async () => {
        
        const contribution = web3.toWei(0.2, "ether");
        const predictionStr = "01111111 11100100 00100111 10011110 01010001 01101010 00100000 00111010 10001010 10000111 00100100 11100011 00010010 11000111 01011001 10101101 ";
        const prediction = parseInt( predictionStr, 2 );
        const initialBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber()

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018,5,1));

        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });

        const contractPrediction = await contestPoolInstance.predictions(player1);
        const finalBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber();

        assert.equal(contractPrediction, prediction, "Prediction for player 1 should be " + prediction);
        assert.equal(initialBalance + contribution, finalBalance);
    });

    it('Should fail when a player has already contributed', async () => {
        const contribution = web3.toWei(0.2, "ether");
        const predictionStr = "01111111 11100100 00100111 10011110 01010001 01101010 00100000 00111010 10001010 10000111 00100100 11100011 00010010 11000111 01011001 10101101 ";
        const prediction = parseInt( predictionStr, 2 );
        const initialBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber()

        await contestPoolInstance.setCurrentTime(dateUtil.toMillis(2018,5,1));
        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });
        const finalBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber();

        try {
            await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });
            assert(false, "should have failed when trying to contribute two times ");
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
            assert.equal(initialBalance + contribution, finalBalance);
        }
    });
});