module.exports = {
    titleFail: function (who, func, desc) {
        return this.title(who, func, desc, true);
    },
    title: function (who, func, desc) {
        return this.title(who, func, desc, false);
    },
    title: function (who, func, desc, fail) {
        const failText = fail ? '\x1b[31mMustFail\x1b[0m .' : '';
        return '\x1b[32m.' + func + ' => \x1b[36m' + who + '\x1b[0m\033[01;34m : ' + desc + ' '+ failText;
    }
};