pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract ContestPool is Ownable {
    address public manager;
    bytes32 public contestName;
    uint public startDate;
    uint public endDate;
    uint public daysGrace;
    
    function ContestPool(
        address _owner, 
        bytes32 _contestName, 
        uint _startDate, 
        uint _endDate,
        uint _daysGrace
    ) public {
        manager = msg.sender;
        owner = _owner;
        contestName = _contestName;
        startDate = _startDate;
        endDate = _endDate;
        daysGrace = _daysGrace;
    }

}