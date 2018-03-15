pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";


contract ContestPool is Ownable {
    using SafeMath for uint256;

    /**** Properties ***********/
    address public  manager;
    bytes32 public  contestName;
    uint public     startTime;
    uint public     endTime;
    uint public     graceTime;
    uint public     numberOfParticipants;
    uint public     maxBalance;
    uint public     amountPerPlayer;
    uint256 private    pendingWinnerPayments;
    uint public highScore;

    address[] public winnerArray;

    mapping(address => uint) public     predictions;
    mapping(address => uint) private    payments;
    mapping(address => bool) public winners;

    /**** Events ***********/

    event SendPrediction (
        uint prediction,
        address indexed player
    );

    event ClaimPrize (
        address indexed winner,
        uint prize
    );

    event ClaimManagerCommission (
        address indexed manager,
        uint prize
    );
    
    event ClaimPaymentByOwner (
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
        require(payments[msg.sender] > 0);
        _;
    }

    modifier poolHasEnded() {
        require(getCurrentTimestamp().sub(endTime) > graceTime);
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
        require(predictions[msg.sender] != 0);
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

    modifier allWinnersHaveClaimedTheirPrize() {
        require(pendingWinnerPayments == 0);
        _;
    }

    modifier hasPendingPayment() {
        require(pendingWinnerPayments > 0);
        require(payments[msg.sender] > 0);
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
        uint _amountPerPlayer
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

    }

    /*** Methods ***************/
    function getMaxUsersCount() public view returns (uint usersCount) {
        return maxBalance.div(amountPerPlayer);
    }

    /**
    * @dev this function is used for a winner to claim the prize
    *   https://consensys.github.io/smart-contract-best-practices/
    *   recommendations/#be-aware-of-the-tradeoffs-between-send-transfer-and-callvalue
    **/
    function claimThePrize() public hasPendingPayment onlyWinner poolHasEnded {
        uint prize = payments[msg.sender];
        // TODO sera >= ?? habra que refactorizar con manager y comision
        require(this.balance > prize);

        payments[msg.sender] = 0;
        pendingWinnerPayments = pendingWinnerPayments.sub(1);
        msg.sender.transfer(prize);
        ClaimPrize(msg.sender, prize);
    }

    function claimCommissionByManager() public onlyManager allWinnersHaveClaimedTheirPrize {

        uint claimedCommission = claimCommission();
        ClaimManagerCommission(msg.sender, claimedCommission);
    }

    function claimCommissionByOwner() public onlyOwner {

        uint claimedCommission = claimCommission();
        ClaimPaymentByOwner(msg.sender, claimedCommission);
    }

    function publishHighScore() onlyActivePlayers isAfterStartTime view external returns (bool) {
        //check sender is a player and has prediction
        
        //check pool graceTime has not ended
        require(isContestActive());

        //check current results
        // var (result,games) = getResult();

        //compare players prediction to current results
        // and compute player score

        //update player score in contract if its different from
        //his last score

        //if player has higher score we update high score
        //add player to the winners array


        return false;

    }

    function getResult() internal view returns (uint result, uint games) {
        return (0,0);
    }

    function sendPrediction(uint _prediction) public onlyForPlayers isBeforeStartTime isAmountPerPlayer payable {
        require(_prediction > 0);
        require(predictions[msg.sender] == 0);
        predictions[msg.sender] = _prediction;
        SendPrediction(_prediction, msg.sender);
    }

    function addressPrize() public view returns (uint256) {
        return payments[msg.sender];
    }

    function getCurrentTimestamp() public view returns (uint256) {
        return now;
    }

    function getPendingPayments() public view returns (uint) {
        return pendingWinnerPayments;
    }

    function addToWinners(address winnerAddress, uint256 prize) internal returns (bool) {
        pendingWinnerPayments = pendingWinnerPayments.add(1);
        payments[winnerAddress] = prize;
        return true;
    }

    function addCommission(address paymentAddress, uint256 commission) internal onlyOwner returns (bool) {

        payments[paymentAddress] = commission;
        return true;
    }

    function claimCommission() internal returns (uint) {
        uint commission = payments[msg.sender];
        require(this.balance >= commission);

        payments[msg.sender] = 0;
        msg.sender.transfer(commission);

        return commission;
    }
    
    function hasContestEnded() private view returns (bool) {
        return getCurrentTimestamp().sub(endTime) > graceTime;
    }

    function isContestActive() private view returns (bool) {
        return !hasContestEnded();
    }


}