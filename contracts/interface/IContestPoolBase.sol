pragma solidity ^0.4.19;

import "../BbBase.sol";
//import "./interface/BbStorageInterface.sol";
//import "./interface/BbVaultInterface.sol";
//import "./interface/ResultsLookupInterface.sol";
import "../AddressArray.sol";
//import "./SafeMath.sol";
//import "./interface/IContestPool.sol";

contract IContestPoolBase is BbBase{

    uint constant public AVOID_DECIMALS = 100000000000000000;

    /**** Properties ***********/
    address public  manager;
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

    modifier onlyWinner() {
        _;
    }

    modifier isAfterGraceTime() {
        _;
    }

    modifier isInGraceTime() {
        _;
    }

    modifier isAfterStartTime() {
        _;
    }

    modifier isBeforeStartTime() {
        _;
    }

    modifier isAmountPerPlayer() {
        _;
    }
    modifier onlyForPlayers() {
        _;
    }

    modifier onlyActivePlayers() {
        _;
    }

    modifier notManager() {
        _;
    }

    modifier onlyManager() {
        _;
    }

    modifier allWinnerHaveClaimedPayment() {
        _;
    }


    /*** Methods ***************/

//    function getBbVault() internal view returns (BbVaultInterface _vault) {
//        return BbVaultInterface(getOwner());
//    }

    function getVersion() public pure returns (uint256 );

    function getWinners() public view returns (address[] );

    function getTotalWinners() public view returns (uint _totalWinners);

    function getMaxUsersCount() public view returns (uint usersCount) ;

//    function getPendingPayments() internal view returns (uint _pendingPayments) {
//        return winners.count - winnerPayments;
//    }

//    function getOwnerAndManagerFees() internal view returns (uint _ownerManagerFees) {
//        uint totalFees = 0;
//        if (!payments[getOwner()]) {
//            totalFees = totalFees.add(ownerFee);
//        }
//        if (!payments[manager]) {
//            totalFees = totalFees.add(managerFee);
//        }
//        return totalFees;
//    }
//
//    function getTotalWinnersFee() internal view returns (uint _totalWinnersFee) {
//        return uint(100).sub(getOwnerAndManagerFees());
//    }
//
//    function getOwner() internal view returns (address _owner) {
//        return bbStorage.getAddress(keccak256("contract.name", "bbVault"));
//    }

//    /**
//     * @dev gets the fee per a winner multiplicated by AVOID_DECIMALS constant to avoid lossing decimals precision.
//     */
//    function getFeePerWinner() internal view returns (uint _feePerWinner) {
//        uint totalWinnersFee = getTotalWinnersFee();
//        uint totalWinners = getTotalWinners();
//        return AVOID_DECIMALS.mul(totalWinnersFee).div(totalWinners);
//    }
//
//    function getPartialBalanceFee() internal view returns (uint _partialBalanceFee) {
//        uint feePerWinner = getFeePerWinner();//Includes AVOID_DECIMALS. 0 - 100
//        uint pendingPayments = getPendingPayments();
//        uint ownerManagerFees = getOwnerAndManagerFees().mul(AVOID_DECIMALS);
//        uint partialBalanceFee = ownerManagerFees + pendingPayments.mul(feePerWinner);//Includes AVOID_DECIMALS
//        return partialBalanceFee;
//    }
//
//    function getPartialBalance() internal view returns (uint _partialBalance) {
//        uint currentBalance = getPoolBalance().mul(AVOID_DECIMALS);
//        uint partialBalanceFee = getPartialBalanceFee();//Includes AVOID_DECIMALS. * 100
//        uint partialBalance = currentBalance.mul(100).div(partialBalanceFee);//NOT AVOID_DECIMALS.
//        return partialBalance;
//    }
//
//    /**
//     * Gets the prize amount for ONLY one winner based on:
//     *  - Whether owner withdraw his/her fee.
//     *  - Whether manager withdraw his/her fee.
//     *  - Whether other winners (when there are multiple winner) withdraw the fee.
//    */
//    function getWinnerAmount() internal view returns (uint winnersAmount) {
//        require(winners.count > 0);
//        uint feePerWinner = getFeePerWinner();//Includes AVOID_DECIMALS.
//        uint partialBalance = getPartialBalance();//NOT AVOID_DECIMALS.
//        uint winnerAmount = partialBalance.mul(feePerWinner).div(uint(100).mul(AVOID_DECIMALS));
//        return winnerAmount;
//    }

    /**
    * @dev this function is used for a winner to claim the prize
    *   https://consensys.github.io/smart-contract-best-practices/
    *   recommendations/#be-aware-of-the-tradeoffs-between-send-transfer-and-callvalue
    **/    
    function claimPaymentByWinner() isAfterGraceTime onlyWinner public;
//
//    function getAmount(uint currentFee) internal view returns (uint _partialBalance){
//        uint currentBalance = getPoolBalance().mul(AVOID_DECIMALS);
//        uint partialBalanceFee = getPartialBalanceFee();//Includes AVOID_DECIMALS. * 100
//        uint partialBalance = currentBalance.mul(100).div(partialBalanceFee);//NOT AVOID_DECIMALS.
//        return partialBalance.mul(currentFee).div(uint(100));
//    }

    function claimPaymentByManager()  onlyManager isAfterGraceTime allWinnerHaveClaimedPayment public;

//    function addAmountPaid(uint _amountPaid) internal {
//        amountPaid = amountPaid.add(_amountPaid);
//    }
//
//    function getPoolBalance() internal view returns (uint _poolBalance) {
//        return players.mul(amountPerPlayer).sub(amountPaid);
//    }

    function claimPaymentByOwner()  onlySuperUser isAfterStartTime public;

//    function addWinnerDependingOnScore(address _potentialWinner, uint _aScore) internal returns (bool _newHighScore){
//        if(_aScore >= highestScore) {
//            if(_aScore == highestScore) {
//                // The _potentialWinner is a "real" winner with the same highest score.
//                winners.addItem(_potentialWinner);
//                LogNewHighScore(this, _potentialWinner, highestScore, _aScore );
//            } else {
//                // The _potentialWinner is a "real" and unique winner with the highest score.
//                winners.clear();
//                winners.addItem(_potentialWinner);
//                LogNewHighScore(this, _potentialWinner, highestScore, _aScore );
//                highestScore = _aScore;
//            }
//            return true;
//        }
//        return false;
//    }

    function publishHighScore() external onlyActivePlayers isAfterStartTime  returns (bool);

//    function calculatePlayerScore(uint8[100] results, uint8[] prediction, uint games) private pure returns (uint) {
//        assert(games <= results.length);
//        assert(games <= prediction.length);
//        uint score = 0;
//        for (uint i = 0; i < games; i++) {
//            if (results[i] == prediction[i]) {
//                score = score.add(1);
//            }
//        }
//        return score;
//    }
//
//    function getResult() internal view returns (uint8[100], uint) {
//        address resultLookupAddress = bbStorage.getAddress(keccak256("contract.name", "resultsLookup"));
//        return ResultsLookupInterface(resultLookupAddress).getResult(contestName);
//    }

    function sendPredictionSet(uint8[] _prediction) public onlyForPlayers isBeforeStartTime isAmountPerPlayer payable ;

    function getPredictionSet(address _playerAddress) public view returns (uint8[]) ;

    function getCurrentTimestamp() public view returns (uint256) ;
    
//    function hasContestEnded() private view returns (bool) {
//        return getCurrentTimestamp().sub(endTime) > graceTime;
//    }
//
//    function isContestActive() private view returns (bool) {
//        return !hasContestEnded();
//    }
}