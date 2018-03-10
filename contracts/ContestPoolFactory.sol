pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./ContestPool.sol";


contract ContestPoolFactory is Ownable {

    event CreateContestPoolDefinition(
        bytes32 indexed contestName,
        uint indexed startTime,
        uint indexed endTime,
        uint graceTime
    );
    
    event CreateContestPool(
        bytes32 indexed contestName,
        address indexed manager,
        address indexed contestPoolAddress
    );

    struct ContestPoolDefinition {
        bytes32 contestName;
        uint startTime;
        uint endTime;
        uint graceTime;
        uint maxBalance;
    }

    mapping(bytes32 => ContestPoolDefinition) public definitions;

    function ContestPoolFactory() public {
        owner = msg.sender;
    }

    function validateContestPoolDefinitionNotExist(bytes32 contestName) view internal {
        ContestPoolDefinition memory currentDefinition = definitions[contestName];
        require(currentDefinition.contestName == bytes32(0x0));
        require(currentDefinition.startTime == 0);
        require(currentDefinition.endTime == 0);
        require(currentDefinition.graceTime == 0);
        require(currentDefinition.maxBalance == 0);
    }

    function validateContestPoolDefinitionExist(bytes32 contestName) view internal {
        ContestPoolDefinition memory currentDefinition = definitions[contestName];
        require(currentDefinition.contestName != bytes32(0x0));
        require(currentDefinition.startTime != 0);
        require(currentDefinition.endTime != 0);
        require(currentDefinition.graceTime != 0);
    }

    function createContestPoolDefinition(bytes32 contestName, uint startTime, uint endTime, uint graceTime, uint maxBalance) onlyOwner public {
        validateContestPoolDefinitionNotExist(contestName);
        require(contestName != bytes32(0x0));
        require(startTime != 0);
        require(endTime != 0);
        require(graceTime != 0);
        require(maxBalance != 0);
        require(startTime < endTime);

        ContestPoolDefinition memory newDefinition = ContestPoolDefinition({
            contestName: contestName,
            startTime: startTime,
            endTime: endTime,
            graceTime: graceTime,
            maxBalance: maxBalance
        });
        CreateContestPoolDefinition(contestName, startTime, endTime, graceTime);
        definitions[contestName] = newDefinition;
    }

    function createContestPool(bytes32 contestName, uint amountPerPlayer) public returns (address){
        validateContestPoolDefinitionExist(contestName);
        require(amountPerPlayer > 0);
        ContestPoolDefinition storage definition = definitions[contestName];
        require(definition.maxBalance > amountPerPlayer);

        address manager = msg.sender;
        ContestPool newContestPoolAddress = new ContestPool(
            owner,
            manager,
            definition.contestName,
            definition.startTime,
            definition.endTime,
            definition.graceTime,
            definition.maxBalance,
            amountPerPlayer
            );
        CreateContestPool(definition.contestName, manager, newContestPoolAddress);
        return newContestPoolAddress;
    }
}