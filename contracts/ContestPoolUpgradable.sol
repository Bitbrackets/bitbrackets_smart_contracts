pragma solidity 0.4.21;

import "./AddressArray.sol";
import "./common/BbProxyBase.sol";




contract ContestPoolUpgradable is BbProxyBase {
    using AddressArray for AddressArray.Addresses;

    uint constant private AVOID_DECIMALS = 100000000000000000;

    /**** Properties ***********/
    address public  manager;
    bytes32 public  name;
    bytes32 public  contestName;
    /** Start time in seconds. */
    uint public    startTime;
    /** End time in seconds. */
    uint public     endTime;

    /** Time (in seconds) after finishing this contest pool which allows the winners to claim the prize. */
    uint public    graceTime;
    uint public    maxBalance;
    uint public    amountPerPlayer;
    /** Percentage (between 0 and 100) that represents the manager fee. */
    uint public    managerFee;
    /** Percentage (between 0 and 100) that represents the owner fee. */
    uint public     ownerFee;
    uint public     highestScore;
    /** Total winner payments made. It is for optimizing payments for winners. */
    uint public     winnerPayments;
    /** Current players playing this contest pool. */
    uint public     players;
    /** Current amount of weis paid to winners, manager, and owner. */
    uint public    amountPaid;

    mapping(address => uint8[]) public  predictions;

    /**
     * It contains all the current winners for this contest pool.
     * It may be updated when a player attempts to publish a score, and 
     *  it is higher than the current one(s). 
     *
     * @dev https://ethereum.stackexchange.com/questions/12740/truffle-console-return-array-of-addresses-issue
     * @dev https://ethereum.stackexchange.com/questions/3373/how-to-clear-large-arrays-without-blowing-the-gas-limit
     */
    AddressArray.Addresses public winners;
    
    /**
     * This is used to identify if an address has claimed its prize.
     */
    mapping(address => bool) public payments;


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
        // bytes32 _targetId
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


//    function getVersion() public view returns (uint256 ) {
//        address target = getTargetAddress(targetId);
//        require(target != 0); // if contract code hasn't been set yet, don't call
//        delegatedFwd(target, msg.data);
//    }

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