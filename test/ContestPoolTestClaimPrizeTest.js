const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const moment = require('moment');

contract('ContestPoolWinnerClaimPrize', accounts => {
    let contestPoolInstance;
    let owner = accounts[9];
    let manager = accounts[0];
    let player1 = accounts[1];
    let player2 = accounts[2];


    let startDate = moment("2018-06-01").toDate().getTime()/1000;
    let endDate = moment("2018-06-10").toDate().getTime()/1000;
    let daysGrace = 1 * 86400;

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

            startDate,
            endDate,
            daysGrace,
            maxBalance
        );


    });

    it('Winner should be able to claim prize', async() => {

        let currentTime = moment("2018-07-12").toDate().getTime()/1000;
        await contestPoolInstance.setCurrentTime(currentTime);

        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });
        //await contestPoolInstance.sendPrediction(prediction, { from: player2, value: contribution });

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        await contestPoolInstance.addWinner(player1, prizeValue, { from: owner });
        //await contestPoolInstance.addWinner(player2, prizeValue, { from: owner });

        await contestPoolInstance.claimThePrize({ from: player1 });
        const finalBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        //console.log(initialBalancePlayer1 + ' - ' + finalBalancePlayer1);


        assert(initialBalancePlayer1 < finalBalancePlayer1);

    });

    it('Winner should not be able to claim prize before endDate + graceTime' , async() => {

        let currentTime = moment("2018-06-10").toDate().getTime()/1000;
        await contestPoolInstance.setCurrentTime(currentTime);

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });
        //await contestPoolInstance.sendPrediction(prediction, { from: player2, value: contribution });

        await contestPoolInstance.addWinner(player1, prizeValue, { from: owner });

        try {
            const result = await contestPoolInstance.claimThePrize({from: player1});
            //console.log(initialBalancePlayer1 + ' - ' + result);
        }  catch (error) {
            assert(error.message.includes("revert"));
            assert(true, "we got an error");
        }


    });

    it('A non winner should not be able to claim prize ', async() => {

        let currentTime = moment("2018-07-10").toDate().getTime()/1000;
        await contestPoolInstance.setCurrentTime(currentTime);

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });
        //await contestPoolInstance.sendPrediction(prediction, { from: player2, value: contribution });

        await contestPoolInstance.addWinner(player1, prizeValue, { from: owner });

        try {
            const result = await contestPoolInstance.claimThePrize({from: player2});
            //console.log(initialBalancePlayer1 + ' - ' + result);
        }  catch (error) {
            assert(error.message.includes("revert"));
            assert(true, "we got an error");
        }


    });

    it('All winners should be able to claim prize', async() => {

        let currentTime = moment("2018-07-12").toDate().getTime()/1000;
        await contestPoolInstance.setCurrentTime(currentTime);

        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });
        await contestPoolInstance.sendPrediction(prediction, { from: player2, value: contribution });

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();
        const initialBalancePlayer2 = web3.eth.getBalance(player2).toNumber();

        await contestPoolInstance.addWinner(player1, prizeValue, { from: owner });
        await contestPoolInstance.addWinner(player2, prizeValue, { from: owner });

        await contestPoolInstance.claimThePrize({ from: player1 });
        await contestPoolInstance.claimThePrize({ from: player2 });

        const finalBalancePlayer1 = web3.eth.getBalance(player1).toNumber();
        const finalBalancePlayer2 = web3.eth.getBalance(player2).toNumber();
        //console.log(initialBalancePlayer1 + ' - ' + finalBalancePlayer1);


        assert(initialBalancePlayer1 < finalBalancePlayer1);
        assert(initialBalancePlayer2 < finalBalancePlayer2);

    });

        it('Winner should be able to claim prize only once', async() => {

        let currentTime = moment("2018-07-12").toDate().getTime()/1000;
        await contestPoolInstance.setCurrentTime(currentTime);

        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });
        //await contestPoolInstance.sendPrediction(prediction, { from: player2, value: contribution });

        const initialBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        await contestPoolInstance.addWinner(player1, prizeValue, { from: owner });
        //await contestPoolInstance.addWinner(player2, prizeValue, { from: owner });

        await contestPoolInstance.claimThePrize({ from: player1 });
        const finalBalancePlayer1 = web3.eth.getBalance(player1).toNumber();

        //console.log(initialBalancePlayer1 + ' - ' + finalBalancePlayer1);


        assert(initialBalancePlayer1 < finalBalancePlayer1);
        try {
            const result = await contestPoolInstance.claimThePrize({from: player1});
            //console.log(initialBalancePlayer1 + ' - ' + result);
        }  catch (error) {
            assert(error.message.includes("revert"));
            assert(true, "we got an error");
        }

    });
});