pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ContestPool.sol";


contract ContestPoolFactory is Ownable {

    event CreateContestPoolDefinition(
        bytes32 contestName,
        uint startDate,
        uint endDate,
        uint daysGrace
    );
    
    event CreateContestPool(
        bytes32 contestName,
        address manager,
        address contestPoolAddress
    );

    struct ContestPoolDefinition {
        bytes32 contestName;
        uint startDate;
        uint endDate;
        uint daysGrace;
        uint maxBalance;
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
        require(currentDefinition.maxBalance == 0);
    }

    function validateContestPoolDefinitionExist(bytes32 contestName) view internal {
        ContestPoolDefinition memory currentDefinition = definitions[contestName];
        require(currentDefinition.contestName != bytes32(0x0));
        require(currentDefinition.startDate != 0);
        require(currentDefinition.endDate != 0);
        require(currentDefinition.daysGrace != 0);
    }

    function createContestPoolDefinition(bytes32 contestName, uint startDate, uint endDate, uint daysGrace, uint maxBalance) onlyOwner public {
        validateContestPoolDefinitionNotExist(contestName);
        require(contestName != bytes32(0x0));
        require(startDate != 0);
        require(endDate != 0);
        require(daysGrace != 0);
        require(maxBalance != 0);
        require(startDate < endDate);

        ContestPoolDefinition memory newDefinition = ContestPoolDefinition({
            contestName: contestName,
            startDate: startDate,
            endDate: endDate,
            daysGrace: daysGrace,
            maxBalance: maxBalance
        });
        CreateContestPoolDefinition(contestName, startDate, endDate, daysGrace);
        definitions[contestName] = newDefinition;
    }

    function createContestPool(bytes32 contestName, uint amountPerPlayer) public returns (address){
        validateContestPoolDefinitionExist(contestName);
        require(amountPerPlayer > 0);
        ContestPoolDefinition storage definition = definitions[contestName];
        //TODO Add require definition.amountPerPlayer > amountPerPlayer

        address manager = msg.sender;
        ContestPool newContestPoolAddress = new ContestPool(
            owner,
            manager,
            definition.contestName,
            definition.startDate,
            definition.endDate,
            definition.daysGrace,
            definition.maxBalance
            );
        CreateContestPool(definition.contestName, manager, newContestPoolAddress);
        return newContestPoolAddress;
    }
}