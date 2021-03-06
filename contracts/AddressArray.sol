pragma solidity 0.4.21;

import "./SafeMath.sol";

/*
 * @title TODO Add comments
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
library AddressArray {
    using SafeMath for uint256;

    struct Addresses {
        address[]   items;
        uint        count;
    }

    function containsItem(Addresses storage array, address item) public view returns(bool) {
        for (uint i = 0; i < array.count; i++){
            if(array.items[i] == item) {
                return true;
            }
        }
        return false;
    }

    function addItem(Addresses storage array, address value) public {
        if(array.count == array.items.length) {
            array.items.length = array.items.length.add(1);
        }
        array.items[array.count] = value;
        array.count = array.count.add(1);
    }

    function clear(Addresses storage array) public {
        array.count = 0;
        array.items.length = 0;
    }
} 