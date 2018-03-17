pragma solidity ^0.4.19;

library AddressArray {

    function remove(address[] storage array, uint index) public returns(address[]) {
        if (index >= array.length) return;

        for (uint i = index; i < array.length-1; i++){
            array[i] = array[i+1];
        }
        array.length--;
        return array;
    }    

    function contains(address[] array, address item) public pure returns(bool) {

        for (uint i = 0; i < array.length-1; i++){
            if(array[i] == item) {
                return true;
            }
        }
        return false;
    }
} 