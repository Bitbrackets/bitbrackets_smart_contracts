pragma solidity ^0.4.19;

interface IContestPool {



     function getVersion() public pure returns (uint256 );
     function getEndTime() public  returns (uint256 );
     function getStartTime() public  returns (uint256 );
     function getGraceTime() public  returns (uint256 );
     function getTargetId() public  returns (address );
}
