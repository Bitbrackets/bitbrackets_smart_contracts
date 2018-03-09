const moment = require('moment');

module.exports = {
    toMoment: function(year, month, day) {
        return moment(year + "-" + month + '-' + day);
    },
    toDate: function(year, month, day) {
        return moment(year + "-" + month + '-' + day).toDate();
    },
    toMillis: function(year, month, day) {
        const date = year + "-" + month + '-' + day;
        return moment(date, 'YYYY-MM-DD').toDate().getTime()/1000;
    }
};