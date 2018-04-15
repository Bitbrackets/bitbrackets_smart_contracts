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
    
    function ContestPoolFactoryMock (address _storage) public ContestPoolFactory(_storage) { }

    function createContestPoolInstance(ContestPoolDefinition _definition, bytes32 _name, address _manager, uint _amountPerPlayer) internal returns (address _newContestPoolAddress) {
        ContestPoolMock newContestPool = new ContestPoolMock(address(bbStorage), _manager);
        newContestPool.setStartTime(_definition.startTime);
        newContestPool.setEndTime(_definition.endTime);
        newContestPool.setGraceTime(_definition.graceTime);
        newContestPool.setAmountPerPlayer(_amountPerPlayer);
        newContestPool.setOwnerFee(_definition.ownerFee);
        newContestPool.setManagerFee(_definition.managerFee);
        newContestPool.setMaxBalance(_definition.maxBalance);
        newContestPool.setContestName(_definition.contestName);
        newContestPool.setName(_name);
        return newContestPool;
    }
}