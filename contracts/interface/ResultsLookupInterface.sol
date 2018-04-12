pragma solidity 0.4.21;


contract ResultsLookupInterface {

     // Modifiers
    modifier onlySuperUser() {_;}
    
    function registerResult(bytes32 contestName, uint8[100] result, uint games) onlySuperUser public;

    function getResult(bytes32 contestName) public view returns (uint8[100], uint );      
}