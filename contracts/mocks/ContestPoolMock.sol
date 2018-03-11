pragma solidity ^0.4.18;

import "../../contracts/ContestPool.sol";


contract ContestPoolMock is ContestPool {
    uint public currentTime;

    function ContestPoolMock (
        address _owner,
        address _manager,
        bytes32 _contestName,
        uint _startTime,
        uint _endTime,
        uint _graceTime,
        uint _maxBalance,
        uint _amountPerPlayer
    ) public
    ContestPool(_owner, _manager, _contestName, _startTime, _endTime, _graceTime, _maxBalance, _amountPerPlayer) { }

    function getCurrentTimestamp() public view returns (uint256) {

        return currentTime;
    }

    function setCurrentTime(uint _currentTime) public {

        currentTime = _currentTime;
    }

    function getNow() public view returns (uint) {

        return now;
    }

    function getOwner() public view returns (address) {

        return owner;
    }

    // for testing only
    function addWinner(address winnerAddress, uint256 prize) public returns (bool) {
        return addToWinners(winnerAddress, prize);
    }

    // for testing only
    function addPayment(address paymentAddress, uint256 payment) public returns (bool) {
        return addCommission(paymentAddress, payment);

    }



}
