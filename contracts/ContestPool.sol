pragma solidity ^0.4.19;

import "./BbBase.sol";
import "./interface/BbStorageInterface.sol";
import "./interface/BbVaultInterface.sol";
import "./interface/ResultsLookupInterface.sol";
import "./AddressArray.sol";
import "./SafeMath.sol";


contract ContestPool is BbBase {
    using SafeMath for uint256;
    using AddressArray for AddressArray.Addresses;

    uint constant private AVOID_DECIMALS = 100000000000000000;

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
        require(winners.containsItem(msg.sender));
        _;
    }

    modifier isAfterGraceTime() {
        uint endGraceTime = endTime.add(graceTime);
        require(getCurrentTimestamp() > endGraceTime);
        _;
    }

    modifier isInGraceTime() {
        uint startGraceTime = endTime;
        uint endGraceTime = endTime.add(graceTime);
        require(getCurrentTimestamp() > startGraceTime);
        require(getCurrentTimestamp() < endGraceTime);
        _;
    }

    modifier isAfterStartTime() {
        require(getCurrentTimestamp() > startTime);
        _;
    }

    modifier isBeforeStartTime() {
        require(getCurrentTimestamp() < startTime);
        _;
    }

    modifier isAmountPerPlayer() {
        require(msg.value == amountPerPlayer);
        _;
    }
    modifier onlyForPlayers() {
        require(!roleHas("owner", msg.sender) && msg.sender != manager);
        _;
    }

    modifier onlyActivePlayers() {
        require(!roleHas("owner", msg.sender) && msg.sender != manager);
        require(predictions[msg.sender].length != 0);
        _;
    }

    modifier notManager() {
        require(msg.sender != manager);
        _;
    }

    modifier onlyManager() {
        require(msg.sender == manager);
        _;
    }

    modifier allWinnerHaveClaimedPayment() {
        require(winnerPayments == winners.count);
        _;
    }

    function ContestPool(
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
    ) public BbBase(_storage)
    {

        manager = _manager;
        contestName = _contestName;
        startTime = _startTime;
        endTime = _endTime;
        graceTime = _graceTime;
        maxBalance = _maxBalance;
        amountPerPlayer = _amountPerPlayer;
        ownerFee = _ownerFee;
        managerFee = _managerFee;
    }

    /*** Fallback Method ***************/

    function () public payable {
        LogFallbackEvent(address(this), msg.sender, msg.value);
    }

    /*** Methods ***************/

    function getBbVault() internal view returns (BbVaultInterface _vault) {
        return BbVaultInterface(getOwner());
    }





    function getWinners() public view returns (address[] ) {
        return winners.items;
    }

    function getTotalWinners() public view returns (uint _totalWinners) {
        return winners.count;
    }

    function getMaxUsersCount() public view returns (uint usersCount) {
        return maxBalance.div(amountPerPlayer);
    }

    function getPendingPayments() internal view returns (uint _pendingPayments) {
        return winners.count - winnerPayments;
    }

    function getOwnerAndManagerFees() internal view returns (uint _ownerManagerFees) {
        uint totalFees = 0;
        if (!payments[getOwner()]) {
            totalFees = totalFees.add(ownerFee);
        }
        if (!payments[manager]) {
            totalFees = totalFees.add(managerFee);
        }
        return totalFees;
    }
    
    function getTotalWinnersFee() internal view returns (uint _totalWinnersFee) {
        return uint(100).sub(getOwnerAndManagerFees());
    }

    function getOwner() internal view returns (address _owner) {
        return bbStorage.getAddress(keccak256("contract.name", "bbVault"));
    }

    /**
     * @dev gets the fee per a winner multiplicated by AVOID_DECIMALS constant to avoid lossing decimals precision.
     */
    function getFeePerWinner() internal view returns (uint _feePerWinner) {
        uint totalWinnersFee = getTotalWinnersFee();
        uint totalWinners = getTotalWinners();
        return AVOID_DECIMALS.mul(totalWinnersFee).div(totalWinners);
    }

    function getPartialBalanceFee() internal view returns (uint _partialBalanceFee) {
        uint feePerWinner = getFeePerWinner();//Includes AVOID_DECIMALS. 0 - 100
        uint pendingPayments = getPendingPayments();
        uint ownerManagerFees = getOwnerAndManagerFees().mul(AVOID_DECIMALS);
        uint partialBalanceFee = ownerManagerFees + pendingPayments.mul(feePerWinner);//Includes AVOID_DECIMALS
        return partialBalanceFee;
    }

    function getPartialBalance() internal view returns (uint _partialBalance) {
        uint currentBalance = getPoolBalance().mul(AVOID_DECIMALS);
        uint partialBalanceFee = getPartialBalanceFee();//Includes AVOID_DECIMALS. * 100
        uint partialBalance = currentBalance.mul(100).div(partialBalanceFee);//NOT AVOID_DECIMALS.
        return partialBalance;
    }
    
    /**
     * Gets the prize amount for ONLY one winner based on:
     *  - Whether owner withdraw his/her fee.
     *  - Whether manager withdraw his/her fee.
     *  - Whether other winners (when there are multiple winner) withdraw the fee.
    */
    function getWinnerAmount() internal view returns (uint winnersAmount) {
        require(winners.count > 0);
        uint feePerWinner = getFeePerWinner();//Includes AVOID_DECIMALS.
        uint partialBalance = getPartialBalance();//NOT AVOID_DECIMALS.
        uint winnerAmount = partialBalance.mul(feePerWinner).div(uint(100).mul(AVOID_DECIMALS));
        return winnerAmount;
    }

    /**
    * @dev this function is used for a winner to claim the prize
    *   https://consensys.github.io/smart-contract-best-practices/
    *   recommendations/#be-aware-of-the-tradeoffs-between-send-transfer-and-callvalue
    **/    
    function claimPaymentByWinner() public isAfterGraceTime onlyWinner {
        require(winners.count >= winnerPayments);
        require(!payments[msg.sender]);
        uint winnersAmount = getWinnerAmount();
        require(winnersAmount > 0);

		payments[msg.sender] = true;
        winnerPayments = winnerPayments.add(1);
        addAmountPaid(winnersAmount);
        msg.sender.transfer(winnersAmount);

        LogClaimPaymentByWinner(this, msg.sender, winnersAmount);
    }

    function getAmount(uint currentFee) internal view returns (uint _partialBalance){
        uint currentBalance = getPoolBalance().mul(AVOID_DECIMALS);
        uint partialBalanceFee = getPartialBalanceFee();//Includes AVOID_DECIMALS. * 100
        uint partialBalance = currentBalance.mul(100).div(partialBalanceFee);//NOT AVOID_DECIMALS.
        return partialBalance.mul(currentFee).div(uint(100));
    }

    function claimPaymentByManager() public onlyManager isAfterGraceTime allWinnerHaveClaimedPayment {
        require(!payments[manager]);
        uint managerAmount = getAmount(managerFee);

        payments[manager] = true;
        addAmountPaid(managerAmount);
        msg.sender.transfer(managerAmount);
        
        LogClaimPaymentByManager(this, msg.sender, managerAmount);
    }

    function addAmountPaid(uint _amountPaid) internal {
        amountPaid = amountPaid.add(_amountPaid);
    }

    function getPoolBalance() internal view returns (uint _poolBalance) {
        return players.mul(amountPerPlayer).sub(amountPaid);
    }

    function claimPaymentByOwner() public onlySuperUser isAfterStartTime {
        address bbVaultAddress = getOwner();
        require(!payments[bbVaultAddress]);
        uint ownerAmount = getAmount(ownerFee);

        payments[bbVaultAddress] = true;
        addAmountPaid(ownerAmount);

        BbVaultInterface bbVault = getBbVault();
        bbVault.deposit.value(ownerAmount)();
        
        LogClaimPaymentByOwner(this, bbVaultAddress, ownerAmount);
    }

    function addWinnerDependingOnScore(address _potentialWinner, uint _aScore) internal returns (bool _newHighScore){
        if(_aScore >= highestScore) {
            if(_aScore == highestScore) {
                // The _potentialWinner is a "real" winner with the same highest score.
                winners.addItem(_potentialWinner);
                LogNewHighScore(this, _potentialWinner, highestScore, _aScore );
            } else {
                // The _potentialWinner is a "real" and unique winner with the highest score.
                winners.clear();
                winners.addItem(_potentialWinner);
                LogNewHighScore(this, _potentialWinner, highestScore, _aScore );
                highestScore = _aScore;
            }
            return true;
        }
        return false;
    }

    function publishHighScore() external onlyActivePlayers isAfterStartTime  returns (bool) {
        //check sender is a player and has prediction
        
        //check pool graceTime has not ended
        // require(isContestActive());

        //check current results
        var (result, games) = getResult();
        uint8[] memory prediction = predictions[msg.sender];

        //compare players prediction to current results
        // and compute player score
        uint score = calculatePlayerScore(result, prediction, games);

        require(score > 0);

        //update player score in contract if its different from
        //his last score
        // TODO we need to keep track of players score and games counted to save gas
        // each time they publish

        //if player has higher score we update high score
        //add player to the winners array
        LogPublishedScore(this, msg.sender, score, highestScore);
        
        return addWinnerDependingOnScore(msg.sender, score);
    }

    function calculatePlayerScore(uint8[100] results, uint8[] prediction, uint games) private pure returns (uint) {
        assert(games <= results.length);
        assert(games <= prediction.length);
        uint score = 0;
        for (uint i = 0; i < games; i++) {
            if (results[i] == prediction[i]) {
                score = score.add(1);
            }
        }
        return score;
    }

    function getResult() internal view returns (uint8[100], uint) {
        address resultLookupAddress = bbStorage.getAddress(keccak256("contract.name", "resultsLookup"));
        return ResultsLookupInterface(resultLookupAddress).getResult(contestName);
    }

    function sendPredictionSet(uint8[] _prediction) public onlyForPlayers isBeforeStartTime isAmountPerPlayer payable {
        require(_prediction.length > 0);
        require(predictions[msg.sender].length == 0);
        predictions[msg.sender] = _prediction;
        players = players.add(1);
        LogSendPrediction(this, _prediction, msg.sender);
    }

    function getPredictionSet(address _playerAddress) public view returns (uint8[]) {
        return predictions[_playerAddress];
    }

    function getCurrentTimestamp() public view returns (uint256) {
        return now;
    }
    
    function hasContestEnded() private view returns (bool) {
        return getCurrentTimestamp().sub(endTime) > graceTime;
    }

    function isContestActive() private view returns (bool) {
        return !hasContestEnded();
    }
}