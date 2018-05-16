pragma solidity ^0.4.0;
import "./AddressArray.sol";

contract ContestPoolStorage {
    using AddressArray for AddressArray.Addresses;

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


}
