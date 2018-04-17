pragma solidity 0.4.21;

interface BbSettingsInterface {
    modifier onlySuperUser() {_;}

    function pauseByContestName(bytes32 _contestName) onlySuperUser external;
    function pauseByContestAddress(address _contestAddress) onlySuperUser external;
    function setEmergency() onlySuperUser external;

    function removePauseByContestName(bytes32 _contestName) onlySuperUser external;
    function removePauseByContestAddress(address _contestAddress) onlySuperUser external;
    function removeEmergency() onlySuperUser external;

    function isContestNamePaused(bytes32 _contestName) external returns (bool);
    function isContestAddressPaused(address _contestAddress) external returns (bool);
    function isEmergency() external returns (bool);




}
