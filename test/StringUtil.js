const util = require('ethereumjs-util');    

module.exports = {
    cleanNulls: function(value) {
        let newValue = value.replace('\0', '');
        newValue = newValue.replace(/\0/g,'');
        return newValue;
    },    
    stringToBytes32: function(text) {
        return util.bufferToHex(util.setLengthRight(text, 32));
    },
    stringToBytes8: function(text) {
        return util.bufferToHex(util.setLengthRight(text, 8));
    }
};