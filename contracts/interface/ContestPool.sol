pragma solidity 0.4.21;

import "../BbBase.sol";
import "../AddressArray.sol";


contract ContestPool is BbBase {

    uint constant public AVOID_DECIMALS = 100000000000000000;

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

    /**** Events ***********/

    event LogWithdraw (
        address indexed contractAddress,
        address indexed player,
        uint amount
    );

    event LogSendPrediction (
        address indexed contractAddress,
        uint8[] prediction,
        address indexed player
    );

    event LogClaimPaymentByWinner (
        address indexed contractAddress,
        address indexed winner,
        uint prize
    );

    event LogClaimPaymentByManager (
        address indexed contractAddress,
        address indexed manager,
        uint prize
    );

    event LogClaimPaymentByOwner (
        address indexed contractAddress,
        address indexed owner,
        uint prize
    );

    event LogPublishedScore (
        address indexed contractAddress,
        address indexed player,
        uint score,
        uint highScore
    );

    event LogNewHighScore (
        address indexed contractAddress,
        address indexed player,
        uint previousHighScore,
        uint newHighScore
    );

    event LogFallbackEvent (
        address indexed contractAddress,
        address indexed player,
        uint value
    );

    /*** Modifiers ***************/
    modifier onlyWinner() { _; }

    modifier isAfterGraceTime() { _; }

    modifier isInGraceTime() { _; }

    modifier isAfterStartTime() { _; }

    modifier isBeforeStartTime() { _; }

    modifier isAmountPerPlayer() { _; }
    modifier onlyForPlayers() { _; }

    modifier onlyActivePlayers() { _; }

    modifier notManager() { _; }

    modifier onlyManager() { _; }

    modifier allWinnerHaveClaimedPayment() { _; }


    function getWinners() public view returns (address[] );

    function getTotalWinners() public view returns (uint _totalWinners);

    function getMaxUsersCount() public view returns (uint usersCount) ;

    function claimPaymentByWinner()  isAfterGraceTime onlyWinner notPaused(contestName, this) public;

    function claimPaymentByManager()  onlyManager isAfterGraceTime allWinnerHaveClaimedPayment notPaused(contestName, this) public;

    function getPoolBalance() public view returns (uint _poolBalance);

    function claimPaymentByOwner()  onlySuperUser isAfterStartTime notPaused(contestName, this) public;

    function publishHighScore() external onlyActivePlayers isAfterStartTime notPaused(contestName, this)  returns (bool);

    function sendPredictionSet(uint8[] _prediction)  onlyForPlayers isBeforeStartTime isAmountPerPlayer notPaused(contestName, this) public payable;

    function getPredictionSet(address _playerAddress) public view returns (uint8[]);

    function getCurrentTimestamp() public view returns (uint256);

    function getBalance() public view returns (uint _balance);

    function withdraw()  onlySuperUser notPaused(contestName, this) public;

    function getVersion() public pure returns (uint256 );
}