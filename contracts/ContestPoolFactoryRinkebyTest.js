const ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
const ContestPool = artifacts.require("./ContestPool.sol");
const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const contracts = require('./resources/contracts');

const t = require('./utils/TestUtil').title;
const stringUtils = require('./utils/StringUtil');
const dateUtils = require('./utils/DateUtil');
var utils = require("./utils/utils.js");

contract('ContestPoolFactoryRinkebyTest', function (accounts) {

    if(accounts.length < 3) {
        return;
    }
    console.log('Accounts to use are: ');
    console.log(accounts);
    const owner = accounts[0];
    const player1 = accounts[1];
    const player2 = accounts[2];
    const managerFee = 10;
    const ownerFee = 10;
/*
    beforeEach('setup contract for each test', async () => {
        instance = await ContestPoolFactory.deployed();
    });
*/
    it(t('aOwner', 'createContestPoolDefinition', 'Should be able to create a contest pool definition.'), async function () {
        const instance = await ContestPoolFactory.at(contracts.contestPoolFactory.address);

        console.log(`ContestPoolFactory instance is at address ${instance.address}.`);

        const name = 'Name_' + dateUtils.nowInSeconds();
        const contestName = 'Rinkeby_' + dateUtils.nowInSeconds();
        const startTime = dateUtils.toSeconds(2018, 05, 01);
        const endTime = dateUtils.toSeconds(2018, 06, 01);
        const graceTime = dateUtils.daysToSeconds(05);
        const fee = web3.toWei(0.01, 'ether');
        const maxBalance = web3.toWei(10, 'ether');

        console.log(`Creating a contest pool definition: ${contestName}`);
        const definitionResult = await instance.createContestPoolDefinition(contestName, fee, startTime, endTime, graceTime, maxBalance, managerFee, ownerFee, {from: accounts[0]});
        console.log(`Contest pool definition result:`);
        console.log(definitionResult);

        const amountPerPlayer = web3.toWei(0.001, 'ether');
        console.log(`Creating a contest pool instance: ${contestName}.`);
        const contestPoolResult = await instance.createContestPool(name, contestName, amountPerPlayer, {
                from: accounts[2],
                value: fee
            });
        console.log('Logs');
        console.log(contestPoolResult.logs[0]);
        /*
        const contestPoolAddress = contestPoolResult.logs[0].contestPoolAddress;
        const contestPool = await ContestPoolMock.at(contestPoolAddress);
        const bbStorage = await contestPool.bbStorage();
        console.log(`BBStorage: ${bbStorage}.`)
        */
    });
});