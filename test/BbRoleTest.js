const BbRole = artifacts.require("./BbRole.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const leche = require('leche');
const withData = leche.withData;
const t = require('./utils/TestUtil').title;
const {assertEvent, emptyCallback} = require('./utils/utils');

/**
 * Using 'Leche' for multiple data provider.
 * 
 * @dev https://github.com/box/leche
 */
contract('BbRoleTest', accounts => {
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
    let bbRole;

    beforeEach('Deploying contract for each test', async () => {
        bbRole = await BbRole.deployed();
    });

    withData({
        _1_player_to_player: ['player', 'admin', player1, player1, true],
        _2_owner_to_player: ['anOwner', 'admin', player1, owner, false],
        _3_owner_to_player: ['anOwner', '', player1, owner, true],
        _4_owner_to_player: ['anOwner', 'admin', owner, owner, true]
    }, function(roleText, role, accessTo, accessFrom, mustFail) {
        it(t(roleText, 'adminRoleAdd', `Should ${mustFail} able to add a new role.`, mustFail), async function() {
            //Invocation
            try {
                await bbRole.adminRoleAdd(role, accessTo ,{from: accessFrom});
                assert.ok(!mustFail, "It should not have failed.");
                await assertEvent(bbRole, {event: 'LogRoleAdded', args: {
                    anAddress: accessTo
                }}, 1, emptyCallback);
            } catch(error) {
                assert.ok(mustFail, "It should have failed.");
            }
        });
    });
});
