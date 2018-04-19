pragma solidity 0.4.21;


 /*
 * @title TODO add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
contract ResultsLookupInterface {

     // Modifiers
    modifier onlySuperUser() {_;}
    
    function registerResult(bytes32 contestName, uint8[100] result, uint games) onlySuperUser public;

    function getResult(bytes32 contestName) public view returns (uint8[100], uint );      
}