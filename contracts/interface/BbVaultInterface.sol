pragma solidity ^0.4.19;

/**
 * This contract is used as a vault for all the contracts in BitBrackets.
 * 
 * @author Guillermo Salazar
 */
contract BbVaultInterface {

    /*** Modifiers *************/

    modifier onlyAccountOwner() {
       _;
    } 

    modifier requestTransactionIsPresent(bytes _name, bool _exist) {
      _;
    }

    modifier requestTransactionIsDone(bytes _name, bool _done) {
      _;
    }

    /**** Methods ***********/

    function deposit() payable external;

    function createRequestTransaction(bytes _name, uint _amount, address _toAccount) external onlyAccountOwner requestTransactionIsPresent(_name, false);

    function getVotesRequestTransaction(bytes _name) public view returns (uint _votes);

    function isDoneRequestTransaction(bytes _name) external view onlyAccountOwner returns (bool _done);

    function existRequestTransaction(bytes _name) external view onlyAccountOwner returns (bool _exist);

    function voteRequestTransaction(bytes _name) external
    onlyAccountOwner
    requestTransactionIsPresent(_name, true)
    requestTransactionIsDone(_name, false);

    function withdraw(bytes _name) external 
      onlyAccountOwner
      requestTransactionIsPresent(_name, true)
      requestTransactionIsDone(_name, false);
}