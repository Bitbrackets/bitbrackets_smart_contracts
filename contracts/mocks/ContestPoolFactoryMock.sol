pragma solidity 0.4.21;

import "../ContestPoolFactory.sol";
import "./ContestPoolMock.sol";

/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
contract ContestPoolFactoryMock is ContestPoolFactory {
    
    uint public currentTime;

    function ContestPoolFactoryMock (address _storage) public ContestPoolFactory(_storage) { }

    function createContestPoolInstance(ContestPoolDefinition _definition, bytes32 _name, address _manager, uint _amountPerPlayer)
    internal returns (address _newContestPoolAddress) {
        ContestPoolMock newContestPool = new ContestPoolMock(address(bbStorage), _manager);
        newContestPool.init(_definition.contestName,

            _definition.startTime,
            _definition.endTime,
            _definition.graceTime,
            _amountPerPlayer,
            _definition.maxBalance,
            _definition.ownerFee,
            _definition.managerFee,
            _name);
        return newContestPool;
    }

    function getCurrentTimestamp() public view returns (uint256) {
        return currentTime;
    }

    function setCurrentTime(uint _currentTime) public {
        currentTime = _currentTime;
    }

    function _isEnabled(bytes32 _contestName) isEnabled(_contestName) public view {

    }

    function _isDisabled(bytes32 _contestName) isDisabled(_contestName) public view {

    }

    function _isActive(bytes32 _contestName) isActive(_contestName) public view {
        
    }
}