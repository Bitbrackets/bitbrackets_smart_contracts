const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");

const leche = require('leche');
const withData = leche.withData;
const t = require('./utils/TestUtil').title;
const daysToSeconds = require('./utils/DateUtil').daysToSeconds;
const Builder = require('./utils/ContestPoolBuilder');


/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
contract('ContestPoolModifiersTest', accounts => {
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
        player1IsWinner: [player1, [player1, player2], false],
        player1IsNotWinner: [player1, [player2, player3], true],
        player1OnlyWinner: [player1, [player1], false],
        player1OnlyWinner: [player1, [player2, player1], false],
        emptyWinners: [player1, [], true]
    }, function(player, winners, shouldFail) {
        it(t('anUser', 'onlyWinners', 'Should be able to invoke function.'), async function() {
            //Setup
            const builder = new Builder(contestPoolInstance);
            await builder.winners(owner, winners);

            
            //Invocation
            try {
                await contestPoolInstance._onlyWinner({from: player});
                assert.ok(!shouldFail);
            } catch(err) {
                assert.ok(shouldFail);
            }
        });
    });

    withData({
        inLimitGraceTime: [{year: 2018, month: 01, day: 01}, daysToSeconds(2), {year: 2018, month: 01, day:03}, true],
        _1DayAfterGraceTime: [{year: 2018, month: 01, day: 01}, daysToSeconds(2), {year: 2018, month: 01, day:04}, false],
        _5DayAfterGraceTime: [{year: 2018, month: 01, day: 01}, daysToSeconds(2), {year: 2018, month: 01, day:08}, false],
        inGraceTime: [{year: 2018, month: 01, day: 01}, daysToSeconds(2), {year: 2018, month: 01, day:02}, true],
        beforeEndTime: [{year: 2018, month: 01, day: 02}, daysToSeconds(2), {year: 2018, month: 01, day:01}, true]
    }, function(endTime, graceTimeInSeconds, currentTime, shouldFail) {
        it(t('anUser', 'isAfterGraceTime', 'Should be able to invoke function.'), async function() {
            //Setup
            const builder = new Builder(contestPoolInstance);
            await builder.currentTime(owner, currentTime.year, currentTime.month, currentTime.day);
            await builder.endTime(owner, endTime.year, endTime.month, endTime.day);
            await builder.graceTime(owner, graceTimeInSeconds);
            
            //Invocation
            try {
                await contestPoolInstance._isAfterGraceTime();
                assert.ok(!shouldFail);
            } catch(err) {
                assert.ok(shouldFail);
            }
        });
    });
});
