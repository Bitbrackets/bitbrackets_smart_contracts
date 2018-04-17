const config = require("../truffle");
const BbUpgrade = artifacts.require("./BbUpgrade.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const BbVault = artifacts.require("./BbVault.sol");
const t = require('./utils/TestUtil').title;
const {assertEvent, emptyCallback} = require('./utils/utils');
const stringUtils = require('./utils/StringUtil');
const toMillis = require('./utils/DateUtil').toMillis;
var utils = require("./utils/utils.js");

let instance;
let bbStorage;


/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
contract('BbUpgradeTest', function (accounts) {

    const owner = accounts[0];
    const manager = accounts[1];
    const ceo = accounts[2];
    const player = accounts[3];

    beforeEach('Setup contract for each test', async () => {
        instance = await BbUpgrade.deployed();
        bbStorage = await BbStorage.deployed();
    });

    it(t('owner', 'new', 'Should deploy BbUpgrade contract.'), async function () {
        assert(instance);
        assert(instance.address);
    });

    it(t('aOwner', 'upgradeContract', 'Should be able to upgrade contract address.'), async function () {
        const contractName = 'bbVault';
        const newContractInstance = await BbVault.new(BbStorage.address);

        await instance.upgradeContract(contractName, newContractInstance.address);

        await assertEvent(instance, {event: 'ContractUpgraded', args: {
            contractAddress: instance.address,
            oldContractAddress: BbVault.address,
            newContractAddress: newContractInstance.address
        }}, 1, emptyCallback);

        const newBbValultExpectedByName = await bbStorage.getAddress(config.web3.utils.soliditySha3('contract.name', contractName));
        const newBbValultExpectedByAddress = await bbStorage.getAddress(config.web3.utils.soliditySha3('contract.address', newContractInstance.address));
        
        assert.equal(newContractInstance.address, newBbValultExpectedByAddress);
        assert.equal(newContractInstance.address, newBbValultExpectedByName);
    });

    it(t('nonOwner', 'upgradeContract', 'Should not be able to upgrade contract address.', true), async function () {
        const contractName = 'bbVault';
        const newContractInstance = await BbVault.new(BbStorage.address);

        try {
            await instance.upgradeContract(contractName, newContractInstance.address, {from: player});
            fail('It should have failed because a player cannot upgrade contracts.');
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }

        await assertEvent(instance, {event: 'ContractUpgraded', args: {
            contractAddress: instance.address
        }}, 0, emptyCallback);
    });

    
    it(t('anOwner', 'upgradeContract', 'Should not be able to upgrade contract address with an invalid contract name.', true), async function () {
        const contractName = 'invalidName';
        const newContractInstance = await BbVault.new(BbStorage.address);

        try {
            await instance.upgradeContract(contractName, newContractInstance.address, {from: player});
            fail('It should have failed because a contract name is invalid.');
        } catch (error) {
            assert(error);
            assert(error.message.includes("revert"));
        }

        await assertEvent(instance, {event: 'ContractUpgraded', args: {
            contractAddress: instance.address
        }}, 0, emptyCallback);
    });
});