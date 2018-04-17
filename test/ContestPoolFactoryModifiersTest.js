const ContestPoolFactoryMock = artifacts.require("./mocks/ContestPoolFactoryMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const dateUtil = require('./utils/DateUtil');
const stringUtils = require('./utils/StringUtil');
const leche = require('leche');
const withData = leche.withData;
const t = require('./utils/TestUtil').title;
const daysToSeconds = require('./utils/DateUtil').daysToSeconds;


/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 * @dev https://github.com/box/leche
 */
contract('ContestPoolFactoryModifiersTest', accounts => {
    let factoryInstance;
    const owner = accounts[0];
    const manager = accounts[1];
    const player1 = accounts[2];
    const player2 = accounts[3];
    const player3 = accounts[4];
    const player4 = accounts[5];
    const player5 = accounts[6];
    const player6 = accounts[7];
    const player7 = accounts[8];
    const player8 = accounts[9];

    beforeEach('Deploying contract for each test', async () => {
        factoryInstance = await ContestPoolFactoryMock.new(
            BbStorage.address
        );
    });

    withData({
        _1_contestName: ['Contest1']
    }, function(value) {
        it(t('anUser', 'isEnabled', 'Should be able to invoke function.'), async function() {
            //Setup
            const contestName = stringUtils.uniqueText(value);
            await factoryInstance.createContestPoolDefinition(
                contestName,
                web3.toWei(0.01, 'ether'),
                dateUtil.toSeconds(2018, 04, 01),
                dateUtil.toSeconds(2018, 04, 10),
                dateUtil.daysToSeconds(4),
                web3.toWei(10, 'ether'),
                10,
                10);
    
            //Invocation
            const result = await factoryInstance._isEnabled(contestName, {from: owner});

            //Assertions
            assert.ok(true, result);
        });
    });

    withData({
        _1_contestName: ['Contest1']
    }, function(value) {
        it(t('anOwner', 'isEnabled', 'Should be able to check if it is enabled.', true), async function() {
            //Setup
            const contestName = stringUtils.uniqueText(value);
            await factoryInstance.createContestPoolDefinition(
                contestName,
                web3.toWei(0.01, 'ether'),
                dateUtil.toSeconds(2018, 04, 01),
                dateUtil.toSeconds(2018, 04, 10),
                dateUtil.daysToSeconds(4),
                web3.toWei(10, 'ether'),
                10,
                10);
            await factoryInstance.disableContestPool(contestName, {from: owner});
    
            //Invocation
            try {
                await factoryInstance._isEnabled(contestName, {from: owner});
                assert(false, 'It should have failed because contest pool definition is disabled.');
            } catch (error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    withData({
        _1_contestName: ['MyContest1']
    }, function(value) {
        it(t('anOwner', 'isDisabled', 'Should be able to check if it is disabled (disableContestPool).', true), async function() {
            //Setup
            const contestName = stringUtils.uniqueText(value);
            await factoryInstance.createContestPoolDefinition(
                contestName,
                web3.toWei(0.01, 'ether'),
                dateUtil.toSeconds(2018, 04, 01),
                dateUtil.toSeconds(2018, 04, 10),
                dateUtil.daysToSeconds(4),
                web3.toWei(10, 'ether'),
                10,
                10);
            
            await factoryInstance._isEnabled(contestName, {from: owner});

            //Invocation
            try {
                const result = await factoryInstance._isDisabled(contestName, {from: owner});
                assert(false, 'It should have failed because contest pool definition is enabled.');
            } catch(error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });
});
