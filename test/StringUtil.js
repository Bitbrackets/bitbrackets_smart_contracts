module.exports = {
    cleanNulls: function(value) {
        let newValue = value.replace('\0', '');
        newValue = newValue.replace(/\0/g,'');
        return newValue;
    }
};