pragma solidity ^0.4.18;

import "../../contracts/ContestPool.sol";


contract ContestPoolMock is ContestPool {
    uint public currentTime;
    
    uint8[] public mockResult;
    uint public mockNoGames;

    function ContestPoolMock (
        address _storage,
        address _manager) public
    ContestPool(_storage, _manager, " ", 0, 0, 0, 0, 0, 0, 0) { }
/*
    function ContestPoolMock2 (
        address _owner,
        address _storage,
        address _manager,
        bytes32 _contestName,
        uint _startTime,
        uint _endTime,
        uint _graceTime,
        uint _maxBalance,
        uint _amountPerPlayer,
        uint _managerFee,
        uint _ownerFee
    ) public

    ContestPool(_owner, _manager, _contestName, _startTime, _endTime, _graceTime, _maxBalance, _amountPerPlayer, _managerFee, _ownerFee) { }
*/

    /**
     * @dev Setter methods ONLY for testing purposes. https://ethereum.stackexchange.com/questions/25498/solidity-private-vs-public-variables
     */
    function setStartTime(uint _startTime) public {
        startTime = _startTime;
    }


    function setEndTime(uint _endTime) public {
        endTime = _endTime;
    }

    function setHighestScore(uint _highestScore) public {
        highestScore = _highestScore;
    }

    function setMaxBalance(uint _maxBalance) public {
        maxBalance = _maxBalance;
    }

    function setManager(address _manager) public {
        manager = _manager;
    }

    function setOwnerFee(uint _ownerFee) public {
        ownerFee = _ownerFee;
    }

    function setManagerFee(uint _managerFee) public {
        managerFee = _managerFee;
    }

    function setAmountPerPlayer(uint _amountPerPlayer) public {
        amountPerPlayer = _amountPerPlayer;
    }

    function setContestName(bytes32 _contestName) public {
        contestName = _contestName;
    }

    function setGraceTime(uint _graceTime) public {
        graceTime = _graceTime;
    }

    function getCurrentTimestamp() public view returns (uint256) {
        return currentTime;
    }

    function setCurrentTime(uint _currentTime) public {
        currentTime = _currentTime;
    }

    function addWinner(address _address) public {
        winners.push(_address);
    }

    function addPaymentFalse(address _address) public {
        addPayment(_address, false);
    }

    function addPaymentTrue(address _address) public {
        addPayment(_address, true);
    }

    function addPayment(address _address, bool state) public {
        payments[_address] = state;
        if (state) {
            _address.transfer(_getWinnerAmount());
        }
    }

    function addPrediction(address _address, uint8[] _prediction) public {
        predictions[_address] = _prediction;
    }

    function getNow() public view returns (uint) {
        return now;
    }

    function _getWinnerAmount() public view returns (uint) {
        return getWinnerAmount();
    }
    
    function _onlyWinner() public view onlyWinner {
    }

    function _isAfterGraceTime() public view isAfterGraceTime {
    }

}
