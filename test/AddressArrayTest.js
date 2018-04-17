const AddressArrayClient = artifacts.require("./mocks/AddressArrayClient.sol");

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
 * @dev https://github.com/box/leche
 */
contract('AddressArrayTest', accounts => {
    let client;
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
        client = await AddressArrayClient.new();
    });

    withData({
        _1_address_1: [[player1], 1],
        _1_address_2: [[player1, player2], 2],
        _1_address_5: [[player1, player2, player3, player4, player5], 5]
    }, function(addresses, expectedCount) {
        it(t('anUser', 'addItem', 'Should be able to add ' + expectedCount + ' address(es).'), async function() {
            //Invocation
            for (var address in addresses) {
                await client.addItem(addresses[address]);
            }
            
            //Assertions
            const countResult = await client.getCount();
            const lengthResult = await client.getLength();

            assert.equal(countResult, expectedCount);
            assert.equal(lengthResult, expectedCount);
        });
    });

    withData({
        _1_address_0: [[]],
        _2_address_1: [[player1]],
        _3_address_2: [[player1, player2]],
        _4_address_5: [[player1, player2, player3, player4, player5]]
    }, function(addresses) {
        it(t('anUser', 'clear', 'Should be able to clear array.'), async function() {
            //Setup
            for (var address in addresses) {
                await client.addItem(addresses[address]);
            }

            //Invocation
            await client.clear();
            
            //Assertions
            const countResult = await client.getCount();
            assert.equal(countResult, 0);

            const lengthResult = await client.getLength();
            assert.equal(lengthResult, 0);

            for (var address in addresses) {
                const containsResult = await client.containsItem(addresses[address]);
                assert.ok(!containsResult);
            }
        });
    });

    withData({
        _1_address_0: [[], player1, false],
        _2_address_1: [[player1], player1, true],
        _2_address_1: [[player1], player2, false],
        _3_address_2: [[player1, player2], player2, true],
        _4_address_2: [[player1, player2], player1, true],
        _5_address_2: [[player1, player2], player3, false],
        _6_address_5: [[player1, player2, player3, player4, player5], player6, false],
        _7_address_5: [[player1, player2, player3, player4, player5], player5, true],
        _8_address_5: [[player1, player2, player3, player4, player5], player1, true]
    }, function(addresses, addressToTest, expectedContains) {
        it(t('anUser', 'containsItem', 'Should contains ' + expectedContains + ' item.'), async function() {
            //Setup
            for (var address in addresses) {
                await client.addItem(addresses[address]);
            }

            //Invocation
            const result = await client.containsItem(addressToTest);
            
            //Assertions
            assert.equal(result, expectedContains);

            const lengthResult = await client.getLength();
            assert.equal(lengthResult, addresses.length);

            const countResult = await client.getCount();
            assert.equal(countResult, addresses.length);
        });
    });

    withData({
        _1_address_0: [[]],
        _2_address_1: [[player1]],
        _3_address_2: [[player1, player2]],
        _4_address_5: [[player1, player2, player3, player4, player5]]
    }, function(addresses) {
        it(t('anUser', 'getItemsAfterClearing', 'Should be able to get an empty array after clearing.'), async function() {
            //Setup
            for (var address in addresses) {
                await client.addItem(addresses[address]);
            }

            //Invocation
            await client.clear();
            
            //Assertions
            const result = await client.getItems();

            assert.equal(result.length, 0);
        });
    });
});
