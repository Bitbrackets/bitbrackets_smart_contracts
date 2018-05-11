const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const leche = require('leche');
const withData = leche.withData;
const dateUtil = require('./utils/DateUtil');
const stringUtils = require('./utils/StringUtil');
const t = require('./utils/TestUtil').title;
const amount = require('./utils/AmountUtil').expected;

const Builder = require('./utils/ContestPoolBuilder');


/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
contract('ContestPoolGetContestDetailsTest', accounts => {
    let contestPoolInstance;
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
        contestPoolInstance = await ContestPoolMock.new(
            BbStorage.address,
            manager
        );
    });

    withData({
        _1_getContestDetails: [player1, 'Name1', web3.toWei(0.1, 'ether')]
    }, function(manager, name, amountPerPlayer) {
        it(t('any', 'getContestDetails', 'Should be able to get contest details.'), async function() {
            //Setup
            const builder = new Builder(contestPoolInstance);
            const startTimeSeconds = await builder.startTime(owner, 2018, 01, 10);
            const endTimeSeconds = await builder.endTime(owner, 2018, 01, 15);
            await builder.graceTime(owner, dateUtil.daysToSeconds(5));
            await builder.managerFee(owner, 10);
            await builder.manager(owner, manager);
            await builder.name(owner, name);
            await builder.ownerFee(owner, 10);
            await builder.amountPerPlayer(owner, amountPerPlayer);
            await builder.currentTime(owner, 2018, 01, 05);

            //Invocation
            const result = await contestPoolInstance.getContestDetails();

            const managerResult = result[0];
            const nameResult = stringUtils.cleanNulls(web3.toAscii(result[1]));
            const startTimeResult = result[2];
            const endTimeResult = result[3];
            const playersResult = result[4];
            const amountPerPlayerResult = result[5];

            assert.equal(managerResult, manager);
            assert.equal(nameResult, name);
            assert.equal(startTimeResult, startTimeSeconds);
            assert.equal(endTimeResult, endTimeSeconds);
            assert.equal(playersResult, 0);
            assert.equal(amountPerPlayerResult, amountPerPlayer);
        });
    });
});
