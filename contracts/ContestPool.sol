pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";


contract ContestPool is Ownable {
    using SafeMath for uint256;

    address public manager;
    bytes32 public contestName;
    uint public startTime;
    uint public endTime;
    uint public graceTime;
    uint public numberOfParticipants;
    uint public maxBalance;

    mapping(address => uint) public predictions;
    mapping(address => uint) private winners;

    function ContestPool(
        address _owner, 
        address _manager, 
        bytes32 _contestName, 
        uint _startTime, 
        uint _endTime,
        uint _graceTime,
        uint _maxBalance
    ) public 
    {
        owner = _owner;
        manager = _manager;
        contestName = _contestName;
        startTime = _startTime;
        endTime = _endTime;
        graceTime = _graceTime;
        maxBalance = _maxBalance;
    }

    /**
    * @dev this function is used for a winner to claim the prize
    *
    **/
    function claimThePrize() public returns(bool) {
        require(winners[msg.sender] > 0);
        require(getCurrentTimestamp().sub(endTime) > graceTime);

        uint prize = winners[msg.sender];
        // TODO sera >= ?? habra que refactorizar con manager y comision
        require(this.balance > prize);

        winners[msg.sender] = 0;

//        if (!msg.sender.send(prize)) {
//            winners[msg.sender] = prize;
//            return false;
//        }
        //TODO: which one is cheaper to use:
        // use assert or use if to validate the send
        assert(msg.sender.send(prize));

        return true;
        
    }

    function sendPrediction(uint prediction) public payable {
        require(prediction > 0);
        require(predictions[msg.sender] == 0);
        predictions[msg.sender] = prediction;
    }

    function addressPrize () public view returns (uint256) {

        return winners[msg.sender];
    }
    
    function getCurrentTimestamp() public view returns (uint256)
    { 
        return now; 
    }

    function addToWinners(address winnerAddress, uint256 prize) internal returns (bool) {
        winners[winnerAddress] = prize;
        return true;
    }


}