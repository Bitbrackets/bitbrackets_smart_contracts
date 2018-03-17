pragma solidity ^0.4.18;

/// @title It looks for a specific result.
/// @author Guillermo Salazar

import "./interface/BbStorageInterface.sol";
import "./BbBase.sol";



contract ResultsLookup is BbBase {

    event LogRegisterResult (
        bytes32 indexed contestName,
        uint8[100] result,
        uint numberOfGames,
        uint whenDateTime
    );

    // Modifier


    function ResultsLookup(address _storageAddress) public BbBase(_storageAddress) {
        version = 1;
        // owner = msg.sender;
    }
    
    
    function registerResult(bytes32 contestName, uint8[100] result, uint games) public onlySuperUser {
        bbStorage.setUint(keccak256("contest.playedGames", contestName), games);
        bbStorage.setInt8Array(keccak256("contest.result", contestName), result);

        LogRegisterResult(contestName, result, games, now);
    }

    function getResult(bytes32 contestName) public view returns (uint8[100], uint ) {
        uint games = bbStorage.getUint(keccak256("contest.playedGames", contestName));
        uint8[100] memory result = bbStorage.getInt8Array(keccak256("contest.result", contestName));   

        return (result, games);
        
    }
}
