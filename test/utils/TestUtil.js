const BigNumber = require('bignumber.js');

/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 * 
 */
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
    },
    toBigNumberArray(array) {
        const res =  array.map(n => {
            return new BigNumber(n);
        });

        return res;
    },
    assertBigNumberArrayIsEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i =0; i < arr1.length; i++) {
            assert(arr1[i] !== arr2[i], 'found difference in arr1 element ', arr1[i], '!= array2 element ', arr2[i]);
        }
    }
};