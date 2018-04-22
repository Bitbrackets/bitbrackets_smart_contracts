const config = require("../truffle");
const BbStorage = artifacts.require("./BbStorage.sol");
const BbVault = artifacts.require("./BbVault.sol");
const ResultsLookup = artifacts.require("./ResultsLookup.sol");
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
contract('BbStorageTest', accounts => {
    let bbStorage;

    const owner = accounts[0];
    const manager = accounts[1];
    const ceo = accounts[2];
    const player1 = accounts[3];
    const player2 = accounts[4];
    const player3 = accounts[5];
    const player4 = accounts[6];
    const player5 = accounts[7];
    const player6 = accounts[8];
    const player7 = accounts[9];

    beforeEach('Deploying contract for each test', async () => {
        bbStorage = await BbStorage.new();
    });

    withData({
        _1_player5: [player5],
        _2_player6: [player6],
        _3_player7: [player7]
    }, function(checkOwner) {
        it(t('aPlayer', 'setAddress', 'Should not able to set contract address before initializing storage.', true), async function() {
            //Invocation
            try {
                await bbStorage.setAddress(
                    config.web3.utils.soliditySha3('contract.address', ResultsLookup.address),
                    ResultsLookup.address,
                    {
                        from: checkOwner
                    }
                );
                assert(false, 'It should have failed because a player must not deploy a contract.');
            } catch (error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    withData({
        _1_player5: [player5]
    }, function(checkOwner) {
        it(t('aPlayer', 'setAddress', 'Should not able to add contract name before initializing storage.', true), async function() {
            //Invocation
            try {
                await bbStorage.setAddress(
                    config.web3.utils.soliditySha3('contract.name', 'contractName'),
                    ResultsLookup.address,
                    {
                        from: checkOwner
                    }
                );
                assert(false, 'It should have failed because a player must not deploy a contract.');
            } catch (error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    withData({
        _1_player7: ['aPlayer', player7],
        _2_owner: ['anOwner', owner],
    }, function(role, checkOwner) {
        it(t(role, 'setAddress', 'Should not able to add contract name after initializing storage.', true), async function() {
            await bbStorage.setBool(
                config.web3.utils.soliditySha3('contract.storage.initialised'),
                true
            );

            try {
                await bbStorage.setAddress(
                    config.web3.utils.soliditySha3('contract.name', 'customContractName'),
                    ResultsLookup.address,
                    {
                        from: checkOwner
                    }
                );
                assert(false, 'It should have failed because a player must not deploy a contract.');
            } catch (error) {
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });

    withData({
        _1_owner: [owner]
    }, function(checkOwner) {
        it(t('anOwner', 'setAddress', 'Should able to add contract name before initializing storage.'), async function() {
            const contractName = 'newContractName';
            //Invocation
            await bbStorage.setAddress(
                config.web3.utils.soliditySha3('contract.name', contractName),
                BbVault.address,
                {
                    from: checkOwner
                }
            );

            const result = await bbStorage.getAddress(
                config.web3.utils.soliditySha3('contract.name', contractName)
            );

            assert.equal(result, BbVault.address);
        });
    });
});
