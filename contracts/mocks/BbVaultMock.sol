pragma solidity ^0.4.19;

import '../BbVault.sol';

contract BbVaultMock is BbVault  {

    function BbVaultMock (
        address _storage, address[] _owners, uint _required) public
    BbVault(_storage, _owners, _required) { }

    function _onlyAccountOwner() public view onlyAccountOwner {
    }

    function _requestTransactionIsPresent(bytes _name) public view requestTransactionIsPresent(_name, true) {
    }

    function _requestTransactionIsNotPresent(bytes _name) public view requestTransactionIsPresent(_name, false) {
    }

    function _getRequestTransaction(bytes _name) public view returns (
        bool _exist,
        uint _amount,
        address _toAccount,
        uint _votes,
        bool _done
    ) {
        return getRequestTransaction(_name);
    }

    function doneRequestTransaction(bytes _name) public {
        bbStorage.setBool(keccak256("vault.request.transactions.", _name, ".done"), true);
    }
}
