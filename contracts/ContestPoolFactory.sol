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
        uint fee;
        bool exists;
    }

    mapping(bytes32 => ContestPoolDefinition) public definitions;

    function ContestPoolFactory() public {
        owner = msg.sender;
    }

    function validateContestPoolDefinitionNotExist(bytes32 contestName) view internal {
        require(!definitions[contestName].exists);
    }

    function validateContestPoolDefinitionExist(bytes32 contestName) view internal {
        require(definitions[contestName].exists);
    }

    function createContestPoolDefinition(
        bytes32 _contestName, 
        uint _fee,
        uint _startTime, 
        uint _endTime, 
        uint _graceTime, 
        uint _maxBalance) 
    onlyOwner public 
    {
        validateContestPoolDefinitionNotExist(contestName);
        require(contestName != bytes32(0x0));
        validateContestPoolDefinitionNotExist(contestName);
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
            maxBalance: maxBalance,
            fee: fee,
            exists: true
        });
        CreateContestPoolDefinition(
            contestName, 
            startTime, 
            endTime, 
            graceTime
        );
        definitions[contestName] = newDefinition;
    }

    function createContestPool(bytes32 contestName, uint amountPerPlayer) public payable returns (address) {
        validateContestPoolDefinitionExist(contestName);
        require(amountPerPlayer > 0);
        ContestPoolDefinition storage definition = definitions[contestName];
        require(definition.fee == msg.value);
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

    function withdrawFee() onlyOwner public {
        require(this.balance > 0);
        owner.transfer(this.balance);
    }
}