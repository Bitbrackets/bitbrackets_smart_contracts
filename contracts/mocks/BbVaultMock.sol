pragma solidity 0.4.21;

import '../BbVault.sol';

/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
contract BbVaultMock is BbVault  {

    function BbVaultMock (address _storage) public BbVault(_storage) { }

    function _onlyAccountOwner() public view onlySuperUser {}

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
