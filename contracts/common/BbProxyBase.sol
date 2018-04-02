pragma solidity ^0.4.19;

import "../BbBase.sol";
import "./DelegateProxy.sol";
import "../interface/BbStorageInterface.sol";

/// @title Base Proxy Implementation for Contracts
/// @author Doug Molina
contract BbProxyBase is DelegateProxy, BbBase {
    
    string public targetId;

    /**
    * @dev Constructor BbProxyBase
    * @param _storage Reference for Global storage
    * @param _targetId Identifier for Forward Contract
    */
    function BbProxyBase(address _storage, string _targetId) public BbBase(_storage) {
        targetId = _targetId;

        // Check that targetAddress is a contract to delegate
        address targetAddress = getTargetAddress(_targetId);
        //require(isContract(targetAddress));
    }

    function () public payable {
        address target = getTargetAddress(targetId);
        require(target != 0); // if contract code hasn't been set yet, don't call
        delegatedFwd(target, msg.data);
    }

    function getTargetId() external view returns (string) {
        return targetId;
    }

    function getTargetAddress(string _targetId) internal view returns (address) {
        return bbStorage.getAddress(keccak256("contract.name", _targetId));
    }




}