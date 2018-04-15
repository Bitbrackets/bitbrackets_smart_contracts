pragma solidity 0.4.21;

import "../../contracts/ContestPoolBase.sol";

/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
contract ContestPoolMock is ContestPoolBase {
    uint public currentTime;
    
    uint8[] public mockResult;
    uint public mockNoGames;

    function ContestPoolMock (
        address _storage,
        address _manager) public
    ContestPoolBase(_storage) {
        manager = _manager;
    }
//    ContestPool(_storage, "", _manager, " ", 0, 0, 0, 0, 0, 0, 0) { }

    /**
     * @dev Setter methods ONLY for testing purposes.
     * https://ethereum.stackexchange.com/questions/25498/solidity-private-vs-public-variables
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

    function setName(bytes32 _name) public {
        name = _name;
    }

    function getCurrentTimestamp() public view returns (uint256) {
        return currentTime;
    }

    function setCurrentTime(uint _currentTime) public {
        currentTime = _currentTime;
    }

    function addWinner(address _address) public {
        winners.addItem(_address);
    }

    function addPaymentTrue(address _address) public {
        addPayment(_address, true);
    }

    function addPayment(address _address, bool state) public {
        payments[_address] = state;
        winnerPayments = winnerPayments.add(1);
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

    function _getOwner() public view returns (address _owner) {
        return getOwner();
    }

    function _getTotalWinnersFee() public view returns (uint) {
        return getTotalWinnersFee();
    }

    function _getFeePerWinner() public view returns (uint) {
        return getFeePerWinner();
    }

    function _getPendingPayments() public view returns (uint) {
        return getPendingPayments();
    }

    function _getOwnerAndManagerFees() public view returns (uint) {
        return getOwnerAndManagerFees();
    }

    function _addWinnerDependingOnScore(address _potentialWinner, uint _aScore) public returns (bool) {
        return addWinnerDependingOnScore(_potentialWinner, _aScore);
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function _onlyWinner() public view onlyWinner {
    }

    function _isAfterGraceTime() public view isAfterGraceTime {
    }
}
