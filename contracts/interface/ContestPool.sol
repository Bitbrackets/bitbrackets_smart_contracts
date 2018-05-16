pragma solidity 0.4.21;

import "../BbBase.sol";
import "../AddressArray.sol";


 /*
 * @title TODO add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
contract ContestPool is  BbBase {


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

    function claimPaymentByWinner()  isAfterGraceTime onlyWinner  public;

    function claimPaymentByManager()  onlyManager isAfterGraceTime allWinnerHaveClaimedPayment public;

    function getPoolBalance() public view returns (uint _poolBalance);

    function claimPaymentByOwner()  onlySuperUser isAfterStartTime  public;

    function publishHighScore() external onlyActivePlayers isAfterStartTime   returns (bool);

    function sendPredictionSet(uint8[] _prediction)  onlyForPlayers isBeforeStartTime isAmountPerPlayer  public payable;

    function getPredictionSet(address _playerAddress) public view returns (uint8[]);

    function getCurrentTimestamp() public view returns (uint256);

    function getBalance() public view returns (uint _balance);

    function withdraw()  onlySuperUser  public;

    function getVersion() public pure returns (uint256 );

    function getContestName() public view returns(bytes32);

    function getContestDetails() public view returns(address, bytes32, uint, uint, uint, uint, uint, uint);
}