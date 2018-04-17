const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const {assertEvent, defaultCallback, emptyCallback} = require("./utils/utils.js");
const CustomContract = artifacts.require("./mocks/CustomContract.sol");
const BbStorage = artifacts.require("./BbStorage.sol");

const leche = require('leche');
const withData = leche.withData;
const t = require('./utils/TestUtil').title;


/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
contract('ContestPoolFallbackEventTest', accounts => {
    let contestPoolInstance;
    let customContractInstance;
    const owner = accounts[0];
    const manager = accounts[1];
    const player1 = accounts[2];
    const player2 = accounts[3];

    beforeEach('Deploying contract for each test', async () => {
        contestPoolInstance = await ContestPoolMock.new(
            BbStorage.address,
            manager
        );
        customContractInstance = await CustomContract.new();
    });

    withData({
        dummy: []
    }, function() {
        it(t('anUser', 'selfDestruct', 'Should be able to add ether to a contest pool.'), async function() {
            //Setup
            const contractAddress = contestPoolInstance.address;
            const amount = web3.toWei(0.001, 'ether');
            await customContractInstance.pay({from: player1, value: amount});
            
            //Invocation
            await customContractInstance.attack(contractAddress, {from: player1});
            /*
            await assertEvent(contestPoolInstance, {event: 'LogFallbackEvent', args: {
                contractAddress: contestPoolInstance.address
            }}, 1, defaultCallback);
            */

            //Assertions
            const currentBalance = await contestPoolInstance.getBalance();
            
            assert.equal(amount, currentBalance);
        });
    });
});
