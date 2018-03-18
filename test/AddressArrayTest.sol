pragma solidity ^0.4.19;

import "truffle/Assert.sol";
import '../contracts/AddressArray.sol';

contract AddressArrayTest {

    function testContains_emptyArray_valid() public {
        //Setup
        address[] memory array;

        //Invocation
        bool result = AddressArray.contains(array, this);

        //Assertions
        Assert.isFalse(result, 'It should not contain item.');
    }

    function testContains_oneItem_valid() public {
        //Setup
        address[] storage array;
        array.push(this);

        uint length = array.length;
        Assert.equal(1, length, 'It should have only one item.');

        //Invocation
        bool result = AddressArray.contains(array, this);

        //Assertions
        Assert.isTrue(result, 'It should contain item.');
    }
} 