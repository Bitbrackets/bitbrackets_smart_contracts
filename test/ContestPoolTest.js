const ContestPool = artifacts.require("./ContestPool.sol");
const moment = require('moment');

// test suite
contract('ContestPool', accounts => {
    let contestPoolInstance;
    let owner = accounts[9];
    let manager = accounts[0];
    let player1 = accounts[1];
    let player2 = accounts[2];
    let player3 = accounts[3];
    let startTime = moment("2018-06-14").toDate().getMilliseconds();
    let endTime = moment("2018-07-16").toDate().getMilliseconds();
    let graceTime = 1;

    beforeEach('setup contract for each test', async() => {
        contestPoolInstance = await ContestPool.new(
            owner, 
            "Rusia2018",
            startTime, 
            endTime, 
            graceTime
        );
    })

    it('should be initialized with correct values', async () => {
        const startTimeContract = await contestPoolInstance.startTime();
        const endTimeContract = await contestPoolInstance.endTime();
        const graceTimeContract = await contestPoolInstance.graceTime();
        
        assert.equal(startTime, startTimeContract, "Contest start time should be " + startTime);
        assert.equal(endTime, endTimeContract, "Contest end time should be " + endTime);
        assert.equal(graceTime, graceTimeContract, "Contest grace time should be " + graceTime);
    });

    it('should take contributions from players', async () => {
        
        const contribution = web3.toWei(0.2, "ether");
        const predictionStr = "01111111 11100100 00100111 10011110 01010001 01101010 00100000 00111010 10001010 10000111 00100100 11100011 00010010 11000111 01011001 10101101 ";
        const prediction = parseInt( predictionStr, 2 );
        const initialBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber()

        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });

        const contractPrediction = await contestPoolInstance.predictions(player1);
        const finalBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber();

        assert.equal(contractPrediction, prediction, "Prediction for player 1 should be " + prediction);
        assert.equal(initialBalance + contribution, finalBalance);

    });

    it('should fail when a player has already contributed', async () => {
        
        const contribution = web3.toWei(0.2, "ether");
        const predictionStr = "01111111 11100100 00100111 10011110 01010001 01101010 00100000 00111010 10001010 10000111 00100100 11100011 00010010 11000111 01011001 10101101 ";
        const prediction = parseInt( predictionStr, 2 );
        const initialBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber()

        await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });
        const finalBalance = web3.eth.getBalance(contestPoolInstance.address).toNumber();

        try {
            await contestPoolInstance.sendPrediction(prediction, { from: player1, value: contribution });
        } catch (error) {
            assert(error.message.includes("revert"));
            assert(true, "we got an error");
            assert.equal(initialBalance + contribution, finalBalance);
            return;
        }

        throw new Error("should have failed when trying to contribute two times ");


        
    });


});
