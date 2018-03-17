pragma solidity ^0.4.18;

/// @title It looks for a specific result.
/// @author Guillermo Salazar

import "./BbBase.sol";



contract ResultsLookup is BbBase {

    event LogRegisterResult (
        bytes32 indexed contestName,
        uint indexed result,
        uint whenDateTime
    );

    struct Result {
        uint result;
        uint dateTime;
    }

    mapping(bytes32 => Result) public results;


    // Modifier


    function ResultsLookup(address _storageAddress) public BbBase(_storageAddress) {
        version = 1;
        // owner = msg.sender;
    }
    
    
    function registerResult(bytes32 contestName, uint result) public onlyOwner {
        uint whenDateTime = now;
        Result memory newResult = Result({
            result: result,
            dateTime: whenDateTime
        });
        results[contestName] = newResult;
        LogRegisterResult(contestName, result, whenDateTime);
    }

    function getResult(bytes32 contestName) public onlyOwner view returns (uint result, uint dateTime) {
        Result memory currentResult = results[contestName];
        return (currentResult.result, currentResult.dateTime);
    }
}
