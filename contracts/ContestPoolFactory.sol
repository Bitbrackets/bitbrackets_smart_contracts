pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";

contract ContestPoolFactory is Ownable {

    struct ContestPoolDefinition {
        bytes32 contestName;
        uint startDate;
        uint endDate;
        uint daysGrace;
    }

    mapping(bytes32 => ContestPoolDefinition) public definitions;

    function ContestPoolFactory() public {
        owner = msg.sender;
    }

    function validateContestPoolDefinitionNotExist(bytes32 contestName) view internal {
        ContestPoolDefinition memory currentDefinition = definitions[contestName];
        require(currentDefinition.contestName == bytes32(0x0));
        require(currentDefinition.startDate == 0);
        require(currentDefinition.endDate == 0);
        require(currentDefinition.daysGrace == 0);
    }

    function createContestPoolDefinition(bytes32 contestName, uint startDate, uint endDate, uint daysGrace) onlyOwner public {
        validateContestPoolDefinitionNotExist(contestName);
        require(contestName != bytes32(0x0));
        require(startDate != 0);
        require(endDate != 0);
        require(daysGrace != 0);
        require(startDate < endDate);

        ContestPoolDefinition memory newDefinition = ContestPoolDefinition({
            contestName: contestName,
            startDate: startDate,
            endDate: endDate,
            daysGrace: daysGrace
        });
        
        definitions[contestName] = newDefinition;
    }
}