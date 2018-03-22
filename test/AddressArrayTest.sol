pragma solidity ^0.4.19;

import "truffle/Assert.sol";
import '../contracts/AddressArray.sol';

contract AddressArrayTest {
    using AddressArray for AddressArray.Addresses;

    function testAddItem_oneItem_valid() public {
        //Setup
        AddressArray.Addresses storage array;

        //Invocation
        array.addItem(this);

        //Assertions
        uint length = array.count;
        Assert.equal(1, length, 'It should have only one item.');
        Assert.equal(array.items.length, length, 'It should have only one item.');
    }

    function testContainsItem_oneItem_valid() public {
        //Setup
        AddressArray.Addresses storage array;
        array.addItem(this);

        //Invocation
        bool result = AddressArray.containsItem(array, this);

        //Assertions
        Assert.isTrue(result, 'It should contain item.');
    }

    function testClear_oneItem_valid() public {
        //Setup
        AddressArray.Addresses storage array;
        array.addItem(this);

        //Invocation
        AddressArray.clear(array);

        //Assertions
        Assert.equal(array.count, 0,           'It should contain item.');
        Assert.equal(array.items.length, 0,    'It should contain item.');
    }
} 