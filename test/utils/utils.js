var _ = require("lodash");
var Promise = require("bluebird");

/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
module.exports = {
    emptyCallback: function (log) {
    },
    defaultCallback: function (log) {
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