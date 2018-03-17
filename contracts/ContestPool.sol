pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import './AddressArray.sol';

contract ContestPool is Ownable {
    using SafeMath for uint256;
    using AddressArray for address[];

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
    uint public     highScore;

    mapping(address => uint8[]) public  predictions;

    uint public     numberOfParticipants;
    uint256 private    pendingWinnerPayments;
    

    /**
     * It contains all the current winners for this contest pool.
     * It may be updated when a player attempts to publish a score, and 
     *  it is higher than the current one(s). 
     *
     * @dev https://ethereum.stackexchange.com/questions/12740/truffle-console-return-array-of-addresses-issue
     */
    address[] public    winners;

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

    event LogClaimPrize (
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
        address indexed player,
        uint score,
        uint highScore
    );

    /*** Modifiers ***************/

    modifier onlyWinner() {
        require(winners.contains(msg.sender));
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
        require(msg.sender != owner && msg.sender != manager);
        _;
    }

    modifier onlyActivePlayers() {
        require(msg.sender != owner && msg.sender != manager);
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

    function ContestPool(
        address _owner,
        address _manager,
        bytes32 _contestName,
        uint _startTime,
        uint _endTime,
        uint _graceTime,
        uint _maxBalance,
        uint _amountPerPlayer,
        uint _managerFee,
        uint _ownerFee
    ) public
    {
        owner = _owner;
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

    /*** Methods ***************/

    function getWinners() public view returns (address[] ) {
        return winners;
    }

    function getMaxUsersCount() public view returns (uint usersCount) {
        return maxBalance.div(amountPerPlayer);
    }

    /**
     * Gets the prize amount for ONLY one winner based on:
     *  - Whether owner withdraw his/her fee.
     *  - Whether manager withdraw his/her fee.
     *  - Whether other winners (when there are multiple winner) withdraw the fee.
    */
    function getWinnerAmount() internal view returns (uint winnersAmount) {
        require(winners.length > 0);
        uint totalFee = uint(100).mul(AVOID_DECIMALS);
        
        if(!payments[owner]) {
            totalFee = totalFee.sub(ownerFee.mul(AVOID_DECIMALS));
        }
        if(!payments[manager]) {
            totalFee = totalFee.sub(managerFee.mul(AVOID_DECIMALS));
        }

        uint totalWinners = AVOID_DECIMALS.mul(winners.length);
        uint feePerPlayer = AVOID_DECIMALS.mul(totalFee).div(totalWinners);

        uint pendingWinners = 0;
        for (uint i = 0; i < winners.length - 1; i++){
            if(!payments[winners[i]]) {
                pendingWinners++;
            }
        }

        totalFee = totalFee.sub(pendingWinners.mul(feePerPlayer));

        uint total = address(this).balance;

        uint quotient = AVOID_DECIMALS.mul(100);

        uint semiTotal = total.mul(feePerPlayer);
        return semiTotal.div(quotient);
    }

    /**
    * @dev this function is used for a winner to claim the prize
    *   https://consensys.github.io/smart-contract-best-practices/
    *   recommendations/#be-aware-of-the-tradeoffs-between-send-transfer-and-callvalue
    **/    
    function claimThePrize() public isAfterGraceTime onlyWinner {
        require(!payments[msg.sender]);
        uint winnersAmount = getWinnerAmount();
        require(winnersAmount > 0);

		payments[msg.sender] = true;        
        msg.sender.transfer(winnersAmount);

        LogClaimPrize(this, msg.sender, winnersAmount);
    }

    function claimPaymentByManager() public onlyManager {
        uint managerFeeAmount = getFeeFor(managerFee, msg.sender);

        payments[manager] = true;
        msg.sender.transfer(managerFeeAmount);
        
        LogClaimPaymentByManager(this, msg.sender, managerFeeAmount);
    }

    function getFeeFor(uint fee, address _address) internal view returns (uint amount){
        require(fee > 0);
        require(!payments[_address]);
        uint feeAmount = fee.div(100).mul(this.balance);
        require(feeAmount > 0);
        return feeAmount;
    }

    function claimPaymentByOwner() public onlyOwner {
        uint ownerFeeAmount = getFeeFor(ownerFee, msg.sender);

        payments[msg.sender] = true;
        msg.sender.transfer(ownerFeeAmount);
        
        LogClaimPaymentByOwner(this, msg.sender, ownerFeeAmount);
    }

    function publishHighScore() onlyActivePlayers isAfterStartTime external returns (bool) {
        //check sender is a player and has prediction
        
        //check pool graceTime has not ended
        // require(isContestActive());

        //check current results
        var (result,games) = getResult();
        uint8[] memory prediction = predictions[msg.sender];

        //compare players prediction to current results
        // and compute player score
        uint score = calculatePlayerScore(result, prediction, games);

        //update player score in contract if its different from
        //his last score
        // TODO we need to keep track of players score and games counted to save gas
        // each time they publish

        //if player has higher score we update high score
        //add player to the winners array
        LogPublishedScore(msg.sender, score, highestScore);

        if (score >= highestScore) {
            if (score > highestScore) {
                highestScore = score;
            }  
            winners.push(msg.sender);
            return true;
        }
        
        return false;

    }

    function calculatePlayerScore(uint8[] results, uint8[] prediction, uint games) private pure returns (uint) {
        assert(games <= results.length);
        uint score = 0;
        for (uint i = 0; i < games; i++) {
            if (results[i] == prediction[i]) {
                score = score.add(1);
            }
        }
        return score;
    }

    function getResult() internal view returns (uint8[] result, uint games) {
        return (new uint8[](0),0);
    }

    function sendPredictionSet(uint8[] _prediction) public onlyForPlayers isBeforeStartTime isAmountPerPlayer payable {
        require(_prediction.length > 0);
        require(predictions[msg.sender].length == 0);
        predictions[msg.sender] = _prediction;
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