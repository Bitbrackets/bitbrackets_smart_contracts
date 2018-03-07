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
    function claimThePrize() external returns(bool) {
        require(winners[msg.sender] > 0);
        require(getTimestamp().sub(endTime) > graceTime);

        uint prize = winners[msg.sender];

        require(this.balance > prize);

        winners[msg.sender] = 0;

        if (!msg.sender.send(prize)) {
            winners[msg.sender] = prize;
            return false;
        }

        return true;
        
    }

    function sendPrediction(uint prediction) public payable {
        require(prediction > 0);
        require(predictions[msg.sender] == 0);
        predictions[msg.sender] = prediction;
    }

    function addWinner(address winnerAddress, uint256 prize) public returns(bool){
        winners[winnerAddress] = prize;
        return true;
    }

    function addressHasPrize () public view returns (bool res) {

        return winners[msg.sender] > 0;
    }
    
    function getTimestamp() public view returns (uint256)
    { 
        return now; 
    }


}