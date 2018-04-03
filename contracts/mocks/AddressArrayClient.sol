pragma solidity 0.4.21;

import "../../contracts/AddressArray.sol";

/**
 * This contract is ONLY to can test AddressArray from JS side.
 *
 * @author Guillermo Salazar
 */
contract AddressArrayClient  {
    using AddressArray for AddressArray.Addresses;

    AddressArray.Addresses public data;
    
    function addItem(address _address) public {
        data.addItem(_address);
    }

    function containsItem(address _address) public view returns (bool) {
        return data.containsItem(_address);
    }

    function clear() public {
        data.clear();
    }

    function getItems() public view returns (address[]) {
        return data.items;
    }

    function getCount() public view returns (uint) {
        return data.count;
    }

    function getLength() public view returns (uint) {
        return data.items.length;
    }
}
