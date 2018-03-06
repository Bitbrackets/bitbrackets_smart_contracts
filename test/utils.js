var _ = require("lodash");
var Promise = require("bluebird");

module.exports = {
    assertEvent: function(contract, count, filter) {
        return new Promise((resolve, reject) => {
            var event = contract[filter.event]();
            event.watch();
            event.get((error, logs) => {
                var log = _.filter(logs, filter);
                if(count != log.length) {
                    throw Error("Failed to find filtered event for " + filter.event);
                }
                if (log) {
                    resolve(log);
                } else {
                    throw Error("Failed to find filtered event for " + filter.event);
                }
            });
            event.stopWatching();
        });
    }
}