pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract ContestPool is Ownable {
    address public manager;
    bytes32 public contestName;
    uint public startTime;
    uint public endTime;
    uint public graceTime;

    mapping(address => uint) public predictions;
    
    function ContestPool(
        address _owner, 
        bytes32 _contestName, 
        uint _startTime, 
        uint _endTime,
        uint _graceTime
    ) public {
        manager = msg.sender;
        owner = _owner;
        contestName = _contestName;
        startTime = _startTime;
        endTime = _endTime;
        graceTime = _graceTime;
    }

    // function sendPrediction(uint prediction, uint contribution)  public payable {

    // }



}