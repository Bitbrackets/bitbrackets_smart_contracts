var _ = require("lodash");
var Promise = require("bluebird");

module.exports = {
    defaultCallback: async function (log) {
        console.log('Default event callback:');
        console.log(log);
    },
    assertEvent: function (contract, filter, count, callback = this.defaultCallback) {
        return new Promise((resolve, reject) => {
            var event = contract[filter.event]();
            event.watch();
            event.get((error, logs) => {
                var log = _.filter(logs, filter);
                if (count != log.length) {
                    throw Error("Failed to find filtered event for " + filter.event);
                }
                if (log) {
                    resolve(callback(log));
                } else {
                    throw Error("Failed to find filtered event for " + filter.event);
                }
            });
            event.stopWatching();
        });
    }
}