pragma solidity 0.4.21;
import "./interface/BbStorageInterface.sol";
import "./BbBase.sol";
import "./interface/BbSettingsInterface.sol";
/*
* @title TODO Add comments.
*
* @author Douglas Molina <doug.molina@bitbrackets.io>
* @author Guillermo Salazar <guillermo@bitbrackets.io>
* @author Daniel Tutila <daniel@bitbrackets.io>
*/
contract BbSettings is BbBase, BbSettingsInterface {

    function BbSettings(address _storageAddress) public BbBase(_storageAddress) {
        version = 1;
    }

    /*** Modifiers *************/

    /*** Functions */
    function pauseByContestName(bytes32 _contestName) external onlySuperUser {
        bbStorage.setBool(keccak256("state.paused.contestName", _contestName), true);
    }

    function pauseByContestAddress(address _contestAddress) external onlySuperUser {
        bbStorage.setBool(keccak256("state.paused.contestAddress", _contestAddress), true);
    }

    function setEmergency() external onlySuperUser {
        bbStorage.setBool(keccak256("state.EMERGENCY"), true);
    }

    function removePauseByContestName(bytes32 _contestName) external onlySuperUser {
        bbStorage.setBool(keccak256("state.paused.contestName", _contestName), false);
    }

    function removePauseByContestAddress(address _contestAddress) external onlySuperUser {
        bbStorage.setBool(keccak256("state.paused.contestAddress", _contestAddress), false);
    }

    function removeEmergency() external onlySuperUser {
        bbStorage.setBool(keccak256("state.EMERGENCY"), false);
    }

    function isContestNamePaused(bytes32 _contestName) external  returns (bool) {
        return bbStorage.getBool(keccak256("state.paused.contestName", _contestName));
    }

    function isContestAddressPaused(address _contestAddress) external returns (bool) {
        return bbStorage.getBool(keccak256("state.paused.contestAddress", _contestAddress));
    }

    function isEmergency() external returns (bool) {
        return bbStorage.getBool(keccak256("state.EMERGENCY"));
    }


}
