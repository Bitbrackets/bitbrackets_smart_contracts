const ContestPoolMock = artifacts.require("./mocks/ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const BbVault = artifacts.require("./BbVault.sol");
const leche = require('leche');
const withData = leche.withData;
const dateUtil = require('./utils/DateUtil');
const t = require('./utils/TestUtil').title;
const amount = require('./utils/AmountUtil').expected;

const { getScore, parseToInt } = require('./utils/ScoreUtil');

const Builder = require('./utils/ContestPoolBuilder');


/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
contract('ContestPoolGetTotalWinnersFeeTest', accounts => {
    let contestPoolInstance;
    const owner = accounts[0];
    const manager = accounts[1];
    const player1 = accounts[2];
    const player2 = accounts[3];
    const player3 = accounts[4];
    const player4 = accounts[5];
    const player5 = accounts[6];
    const player6 = accounts[7];
    const amountPerPlayer = web3.toWei(0.001, 'ether');
    const player7 = accounts[8];
    const player8 = accounts[9];

    beforeEach('Deploying contract for each test', async () => {
        contestPoolInstance = await ContestPoolMock.new(
            BbStorage.address,
            manager
        );
    });

    emptyPayments = [];
    ownerPayment = [owner];
    managerPayment = [manager];
    ownerAndManagerPayment = [owner, manager];
    withData({
        _1_0Pay_fee_10_10: [10, 10, emptyPayments, 80],
        _2_0Pay_fee_05_00: [ 5,  0, emptyPayments, 95],
        _3_0Pay_fee_00_00: [ 0,  0, emptyPayments, 100],
        _4_1Pay_fee_10_00: [10,  0, [BbVault.address], 100],
        _5_1Pay_fee_10_00: [ 0,  10, [owner], 90],
        _6_1Pay_fee_10_00: [10,  0, [manager], 90],
        _7_1Pay_fee_10_00: [ 0,  10, [manager], 100],
        _8_1Pay_fee_10_10: [10,  10, [manager], 90],
        _9_2Pay_fee_05_05: [ 5,   5, [manager, BbVault.address], 100] 
    }, function(ownerFee, managerFee, payments, expectedTotalWinnersFee) {
        it(t('anUser', 'getTotalWinnersFee', 'Should be equals to ' + expectedTotalWinnersFee + '.'), async function() {
            //Setup
            const builder = new Builder(contestPoolInstance);
            await builder.managerFee(owner, managerFee);
            await builder.ownerFee(owner, ownerFee);
            await builder.paymentsTrue(owner, payments);

            //Invocation
            const result = await contestPoolInstance._getTotalWinnersFee();
            
            //Assertions
            assert.equal(expectedTotalWinnersFee, parseInt(result));
        });
    });
});
