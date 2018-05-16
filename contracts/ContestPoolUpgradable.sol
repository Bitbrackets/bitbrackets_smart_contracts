pragma solidity 0.4.21;

import "./AddressArray.sol";
import "./common/BbProxyBase.sol";
import "./ContestPoolStorage.sol";

/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
contract ContestPoolUpgradable is ContestPoolStorage, BbProxyBase {



    function ContestPoolUpgradable(
        address _storage,
        bytes32 _name,
        address _manager,
        bytes32 _contestName,
        uint _startTime,
        uint _endTime,
        uint _graceTime,
        uint _maxBalance,
        uint _amountPerPlayer,
        uint _managerFee,
        uint _ownerFee
    ) public BbBase(_storage) BbProxyBase(_storage, "contestPoolBase")
    {
        manager = _manager;
        name = _name;
        contestName = _contestName;
        startTime = _startTime;
        endTime = _endTime;
        graceTime = _graceTime;
        maxBalance = _maxBalance;
        amountPerPlayer = _amountPerPlayer;
        ownerFee = _ownerFee;
        managerFee = _managerFee;
    }

    /**
    * @dev ERC897, the address the proxy would delegate calls to
    */
    function implementation() public view returns (address) {
        return getTargetAddress(targetId);
    }

    /**
     * @dev ERC897, whether it is a forwarding (1) or an upgradeable (2) proxy
     */
    function proxyType() public pure returns (uint256 proxyTypeId) {
        return 2;
    }
}