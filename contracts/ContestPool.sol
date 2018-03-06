pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract ContestPool is Ownable {
    address public manager;
    bytes32 public contestName;
    uint public startTime;
    uint public endTime;
    uint public graceTime;

    mapping(address => uint) public predictions;
    mapping(address => uint) public participantPoints;
    uint public numberOfParticipants;
    uint public maxBalance;
    
    function ContestPool(
        address _owner, 
        address _manager, 
        bytes32 _contestName, 
        uint _startTime, 
        uint _endTime,
        uint _graceTime,
        uint _maxBalance
    ) public {
        owner = _owner;
        manager = _manager;
        contestName = _contestName;
        startTime = _startTime;
        endTime = _endTime;
        graceTime = _graceTime;
        maxBalance = _maxBalance;
    }

    function sendPrediction(uint prediction) public payable {
        require(prediction > 0);
        require(predictions[msg.sender] == 0);
        predictions[msg.sender] = prediction;
    }



}