pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract ContestPool is Ownable {
    address public manager;
    bytes32 public contestName;
    uint public startTime;
    uint public endTime;
    uint public graceTime;
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

}