pragma solidity ^0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";


contract ContestPool is Ownable {
    using SafeMath for uint256;

    event SendPrediction (
        uint prediction,
        address indexed player
    );

    event ClaimPrize (
        address indexed manager,
        uint prize
    );

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
    *   https://consensys.github.io/smart-contract-best-practices/
    *   recommendations/#be-aware-of-the-tradeoffs-between-send-transfer-and-callvalue
    **/
    function claimThePrize() public returns(bool) {
        require(winners[msg.sender] > 0);
        require(getCurrentTimestamp().sub(endTime) > graceTime);

        uint prize = winners[msg.sender];
        // TODO sera >= ?? habra que refactorizar con manager y comision
        require(this.balance > prize);

        winners[msg.sender] = 0;
        msg.sender.transfer(prize);

        ClaimPrize(msg.sender, prize);
        return true;
    }

    modifier isBeforeStartTime() {
        require(getCurrentTimestamp() < startTime);
        _;
    }

    function sendPrediction(uint prediction) isBeforeStartTime public payable {
        require(prediction > 0);
        require(predictions[msg.sender] == 0);
        predictions[msg.sender] = prediction;
        SendPrediction(prediction, msg.sender);
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