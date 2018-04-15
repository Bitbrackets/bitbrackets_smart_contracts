const jsonfile = require('jsonfile');
const config = require("../truffle");
const ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
const ContestPoolFactoryMock = artifacts.require("./mocks/ContestPoolFactoryMock.sol");
const ContestPool = artifacts.require("./ContestPool.sol");
const CustomContract = artifacts.require("./CustomContract.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const BbRole = artifacts.require("./BbRole.sol");
const ResultsLookup = artifacts.require("./ResultsLookup.sol");
const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const contracts = require('./resources/contracts');

const t = require('./utils/TestUtil').title;
const stringUtils = require('./utils/StringUtil');
const dateUtils = require('./utils/DateUtil');
var utils = require("./utils/utils.js");

const events = [];

const addEvent = (event) => {
    const receipt = event.receipt;
    const logs = event.logs;
    /*
    console.log('Receipt:');
    console.log(receipt);
    console.log('Logs');
    console.log(logs)
    */
    console.log(`Event: ${logs[0].event} -> Gas Used: ${receipt.gasUsed}.`)
    events.push({
            "data" : {
                "meta" : {
                    "blockNumber" : receipt.blockNumber,
                    "version" : 1,
                    "sourceId" : "0x9f16E44C9316D06f9B985b97E96259fcD64bc1Ac",
                    "sourceSystem" : "smart_contracts**HARDCODED**",
                    "eventSequenceId" : "0xebc4635b338f82012df61bafa3751a149ef92432a7224ea0000fd3d85a9f4ef0",
                    "sourceTimestampCreation" : Date.now(),
                    "eventWorkerId" : "nodejs_events_worker_1**HARDCODED**",
                    "notes" : {
                        "blockHash" : receipt.blockHash,
                        "signature" : "0xa2cb4b647a50d0b944f3c8a6c174337debf3e98cf866444d3daade6926f5237e",
                        "id" : "log_94d86a45",
                        "transactionIndex" : logs[0].transactionIndex
                    }
                },
                "payload" : logs[0].args
            },
            "blockNumber" : receipt.blockNumber,
            "eventId" : config.web3.utils.soliditySha3(logs[0].transactionHash, logs[0].logIndex),
            "eventType" : logs[0].event,
            "createdAt" : Date.now()
         }
    );
};

const getValues = (transactionResult) => {
    return transactionResult.logs[0].args;
};
const getValue = (transactionResult, fieldName) => {
    return getValues(transactionResult)[fieldName];
};
const logResult = (title, result) => {
    console.log(`>>> ${title} <<<`);
    console.log(result);
    console.log('');
};

contract('ContestPoolFactoryRinkebyTest', function (accounts) {

    if(accounts.length < 3) {
        return;
    }
    console.log('Accounts to use are: ');
    console.log(accounts);
    const owner = accounts[0];
    const ceo = accounts[1];
    const manager = accounts[2];
    const player1 = accounts[3];
    const player2 = accounts[4];
    const player3 = accounts[5];
    const player4 = accounts[6];
    const player5 = accounts[7];
    const player6 = accounts[8];
    const managerFee = 10;
    const ownerFee = 10;
    const defaultPrediction = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100];
    const realResult = [10,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,58,29,30,11,32,13,34,15,36,37,38,39,40,41,42,23,14,25,86,47,48,49,50,51,52,53,54,55,56,57,58,39,10,21,62,63,64,75,36,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,81,92,23,94,45,96,97,98,99,100];

    it(t('aOwner', 'createContestPoolDefinition', 'Should be able to create a contest pool definition.'), async function () {
        const factoryAddress = '0x75c35c980c0d37ef46df04d31a140b65503c0eed';
        const instance = await ContestPoolFactoryMock.new(BbStorage.address);

        console.log(`ContestPoolFactory instance is at address ${instance.address}.`);

        const name = 'Name_' + dateUtils.nowInSeconds();
        const contestName = 'Rinkeby_' + dateUtils.nowInSeconds();
        const startTime = dateUtils.toSeconds(2018, 05, 01);
        const endTime = dateUtils.toSeconds(2018, 06, 01);
        const graceTime = dateUtils.daysToSeconds(05);
        const fee = web3.toWei(0.01, 'ether');
        const maxBalance = web3.toWei(10, 'ether');

        console.log(`Creating a contest pool definition: "${contestName}"`);
        const definitionResult = await instance.createContestPoolDefinition(contestName, fee, startTime, endTime, graceTime, maxBalance, managerFee, ownerFee, {from: owner});
        addEvent(definitionResult);

        const bbRole = await BbRole.deployed();
        const adminRoleAddResult = await bbRole.adminRoleAdd('admin', player6, {from: owner});
        addEvent(adminRoleAddResult);

        const adminRoleRemoveResult = await bbRole.adminRoleRemove('admin', player6, {from: owner});
        addEvent(adminRoleRemoveResult);

        const transferOwnershipToPlayer6Result = await bbRole.transferOwnership(player6, {from: owner});
        addEvent(transferOwnershipToPlayer6Result);

        const transferOwnershipToOwnerResult = await bbRole.transferOwnership(owner, {from: player6});
        addEvent(transferOwnershipToOwnerResult);

        logResult('ContestPoolDefinition created.', getValues(definitionResult));

        const amountPerPlayer = web3.toWei(0.001, 'ether');

        const contestPoolResult = await instance.createContestPool(name, contestName, amountPerPlayer, {
                from: manager,
                value: fee
            });
        addEvent(contestPoolResult);
        logResult('ContestPool created.', getValues(contestPoolResult));

        const withdrawFeeResult = await instance.withdrawFee({from: owner});
        console.log('WithdrawFeeResult sent.');
        //console.log(withdrawFeeResult.receipt);

        const contestPoolAddress = getValue(contestPoolResult, 'contestPoolAddress');

        const contestPoolInstance = await ContestPoolMock.at(contestPoolAddress);
        
        await contestPoolInstance.setCurrentTime(dateUtils.toSeconds(2018, 04, 10));
        const sendPredictionSetResult = await contestPoolInstance.sendPredictionSet(
            defaultPrediction,
            {from: player6, value: amountPerPlayer}
        );
        addEvent(sendPredictionSetResult);
        logResult('PredictionSet sent.', '');//getValues(sendPredictionSetResult)

        const resultsLookup = await ResultsLookup.deployed();
        const registerResultResult = await resultsLookup.registerResult(contestName, realResult, realResult.length);
        addEvent(registerResultResult);
        logResult('RegisterResult sent.', '');//getValues(registerResultResult)

        await contestPoolInstance.setCurrentTime(dateUtils.toSeconds(2018, 06, 02));

        const publishScoreResult = await contestPoolInstance.publishHighScore({from: player6});
        addEvent(publishScoreResult);
        logResult('PublishScoreResult sent.', getValues(publishScoreResult));

        const claimPaymentByOwnerResult = await contestPoolInstance.claimPaymentByOwner({from: owner});
        addEvent(claimPaymentByOwnerResult);
        logResult('ClaimPaymentByOwner sent.', getValues(claimPaymentByOwnerResult));

        await contestPoolInstance.setCurrentTime(dateUtils.toSeconds(2018, 06, 10));

        const claimPaymentByWinnerResult = await contestPoolInstance.claimPaymentByWinner({from: player6});
        addEvent(claimPaymentByWinnerResult);
        logResult('ClaimPaymentByWinner sent.', getValues(claimPaymentByWinnerResult));

        const claimPaymentByManagerResult = await contestPoolInstance.claimPaymentByManager({from: manager});
        addEvent(claimPaymentByManagerResult);
        logResult('ClaimPaymentBymanager sent.', getValues(claimPaymentByManagerResult));

        const customContractInstance = await CustomContract.new();
        await customContractInstance.pay({from: player1, value: web3.toWei(0.04, 'ether')});
        await customContractInstance.attack(contestPoolInstance.address, {from: player1});

        const withdrawResult = await contestPoolInstance.withdraw({from: owner});
        logResult('Withdraw ether from attack sent.', getValues(withdrawResult));

        const eventsFile = './events.json';
        jsonfile.writeFile(eventsFile, events, {spaces: 2, EOL: '\r\n'}, function (err) {
            console.log(`JSON file created at '${eventsFile}'.`);
            if(err !== null || typeof err !== 'undefined') {
                console.error("Errors: " + err);
            }
        });

    });
});