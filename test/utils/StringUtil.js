const util = require('ethereumjs-util');
const now = require('./DateUtil').nowInMillis;

/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
module.exports = {
    cleanNulls: function (value) {
        let newValue = value.replace('\0', '');
        newValue = newValue.replace(/\0/g, '');
        return newValue;
    },
    stringToBytes32: function (text) {
        return util.bufferToHex(util.setLengthRight(text, 32));
    },
    stringToBytes8: function (text) {
        return util.bufferToHex(util.setLengthRight(text, 8));
    },
    uniqueText: function (text) {
        return text + '_' + now();
    }
};