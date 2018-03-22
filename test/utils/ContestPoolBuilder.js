const dateUtil = require('./DateUtil');

/**
 * @dev https://stackoverflow.com/questions/20534702/node-js-use-of-module-exports-as-a-constructor
 */
function ContestPoolBuilder(_contestPool) {
    if (!(this instanceof ContestPoolBuilder)) {
        return new ContestPoolBuilder(_contestPool);
    }
    this.contestPool = _contestPool;
}

ContestPoolBuilder.prototype.startTime = async function startTime(who, year, month, day) {
    const startTimeInMillis = dateUtil.toSeconds(year, month, day);
    await this.contestPool.setStartTime(startTimeInMillis, {from: who});
};

ContestPoolBuilder.prototype.endTime = async function endTime(who, year, month, day) {
    const endTimeInMillis = dateUtil.toSeconds(year, month, day);
    await this.contestPool.setEndTime(endTimeInMillis, {from: who});
};

ContestPoolBuilder.prototype.graceTimeDays = async function graceTimeDays(who, graceTimeInDays) {
    const graceTimeInSeconds = dateUtil.daysToSeconds(graceTimeInDays);
    await this.contestPool.setGraceTime(graceTimeInSeconds, {from: who});
};

ContestPoolBuilder.prototype.graceTime = async function graceTime(who, graceTimeInSeconds) {
    await this.contestPool.setGraceTime(graceTimeInSeconds, {from: who});
};

ContestPoolBuilder.prototype.maxBalance = async function maxBalance(who, maxBalance) {
    await this.contestPool.setMaxBalance(maxBalance, {from: who});
};

ContestPoolBuilder.prototype.ownerFee = async function ownerFee(who, ownerFee) {
    await this.contestPool.setOwnerFee(ownerFee, {from: who});
};

ContestPoolBuilder.prototype.amountPerPlayer = async function amountPerPlayer(who, amountPerPlayer) {
    await this.contestPool.setAmountPerPlayer(amountPerPlayer, {from: who});
};

ContestPoolBuilder.prototype.managerFee = async function managerFee(who, managerFee) {
    await this.contestPool.setManagerFee(managerFee, {from: who});
};

ContestPoolBuilder.prototype.contestName = async function contestName(who, contestName) {
    await this.contestPool.setContestName(contestName, {from: who});
};

ContestPoolBuilder.prototype.highestScore = async function highestScore(who, highestScore) {
    await this.contestPool.setHighestScore(highestScore, {from: who});
};

ContestPoolBuilder.prototype.manager = async function manager(who, manager) {
    await this.contestPool.setManager(manager, {from: who});
};

ContestPoolBuilder.prototype.currentTime = async function currentTime(who, year, month, day) {
    const timeInMillis = dateUtil.toSeconds(year, month, day);
    await this.contestPool.setCurrentTime(timeInMillis, {from: who});
};

ContestPoolBuilder.prototype.winners = async function winners(who, winners) {
    const _contestPool = this.contestPool;
    for (var winner in winners) {
        await _contestPool.addWinner(winners[winner], {from: who});
    };
};

ContestPoolBuilder.prototype.paymentsTrue = async function paymentsTrue(who, payments) {
    const _contestPool = this.contestPool;
    for (var payment in payments) {
        await _contestPool.addPaymentTrue(payments[payment], {from: who});
    }
};

ContestPoolBuilder.prototype.paymentsFalse = async function paymentsFalse(who, payments) {
    const _contestPool = this.contestPool;
    for (var payment in payments) {
        await _contestPool.addPaymentsFalse(payments[payment], {from: who});
    };
};

ContestPoolBuilder.prototype.predictions = async function predictions(who, amount, predictions) {
    const _contestPool = this.contestPool;
    for (var prediction in predictions) {
        await _contestPool.sendPredictionSet(
            predictions[prediction].prediction,
            {
                from: predictions[prediction].player,
                value: amount
            }
        );
    };
};

ContestPoolBuilder.prototype.predictionsDef = async function predictionsDef(amount, defaultPredictions, players) {
    const _contestPool = this.contestPool;
    for (var player in players) {
        await _contestPool.sendPredictionSet(
            defaultPredictions,
            {
                from: players[player],
                value: amount
            }
        );
    }
};

ContestPoolBuilder.prototype.claimPaymentByWinner = async function claimPaymentByWinner(winners) {
    const _contestPool = this.contestPool;
    for (var winner in winners) {
        await _contestPool.claimPaymentByWinner({from: winners[winner]});
    }
};

module.exports = ContestPoolBuilder;
