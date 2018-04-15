pragma solidity 0.4.21;

import "./interface/BbStorageInterface.sol";
import "./BbBase.sol";

/*
 * @title It looks for a result for contest pools.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
contract ResultsLookup is BbBase {

    // Events

    event LogRegisterResult (
        bytes32 indexed contestName,
        uint8[100] result,
        uint numberOfGames
    );

    // Functions

    function ResultsLookup(address _storageAddress) public BbBase(_storageAddress) {
        version = 1;
    }
    
    
    function registerResult(bytes32 contestName, uint8[100] result, uint games) public onlySuperUser {
        bbStorage.setUint(keccak256("contest.playedGames", contestName), games);
        bbStorage.setInt8Array(keccak256("contest.result", contestName), result);
        emit LogRegisterResult(contestName, result, games);
    }

    function getResult(bytes32 contestName) public view returns (uint8[100], uint ) {
        uint games = bbStorage.getUint(keccak256("contest.playedGames", contestName));
        uint8[100] memory result = bbStorage.getInt8Array(keccak256("contest.result", contestName));   

        require(games > 0);
        require(result.length > 0);

        return (result, games);
    }
}
