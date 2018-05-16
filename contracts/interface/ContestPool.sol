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



    function getWinners() public view returns (address[] );

    function getTotalWinners() public view returns (uint _totalWinners);

    function getMaxUsersCount() public view returns (uint usersCount) ;

    function claimPaymentByWinner()  public;

    function claimPaymentByManager()  public;

    function getPoolBalance() public view returns (uint _poolBalance);

    function claimPaymentByOwner()  public;

    function publishHighScore() external  returns (bool);

    function sendPredictionSet(uint8[] _prediction) public payable;

    function getPredictionSet(address _playerAddress) public view returns (uint8[]);

    function getCurrentTimestamp() public view returns (uint256);

    function getBalance() public view returns (uint _balance);

    function withdraw()  public;

    function getVersion() public pure returns (uint256 );

    function getContestName() public view returns(bytes32);

    function getContestDetails() public view returns(address, bytes32, bytes32, uint, uint, uint, uint, uint, uint, uint, uint, uint);
}