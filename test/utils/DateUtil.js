const moment = require('moment');

/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
module.exports = {
    toMoment: function (year, month, day) {
        return moment(year + "-" + month + '-' + day);
    },
    toDate: function (year, month, day) {
        return moment(year + "-" + month + '-' + day).toDate();
    },
    toSeconds: function (year, month, day) {
        const date = year + "-" + month + '-' + day;
        return moment(date, 'YYYY-MM-DD').toDate().getTime() / 1000;
    },
    toMillis: function (year, month, day) {
        const date = year + "-" + month + '-' + day;
        return moment(date, 'YYYY-MM-DD').toDate().getTime();
    },
    nowInMillis: function() {
        return moment().toDate().getTime();
    },
    nowInSeconds: function() {
        return moment().toDate().getTime() / 1000;
    },
    tomorrowInSeconds: function() {
        return moment(0, "HH").add(1,'days').toDate().getTime() / 1000;
    },
    aWeekFromNowInSeconds: function() {
        return moment(0, "HH").add(7,'days').toDate().getTime()/ 1000;
    },
    daysToMillis: function(days) {
        return days * 24 * 60 * 60 * 1000;
    },
    daysToSeconds: function(days) {
        return days * 24 * 60 * 60;
    },
    secondsToMillis: function(seconds) {
        return seconds * 1000;
    },
};