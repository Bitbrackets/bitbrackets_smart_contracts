pragma solidity 0.4.21;

import "./interface/BbStorageInterface.sol";

/*
 * @title Base settings / modifiers for BitBrackets Contracts.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
contract BbBase {


    /**** Properties ************/

    uint8 public version;  // Version of this contract


    /*** Contracts **************/

    BbStorageInterface public bbStorage = BbStorageInterface(0);     
    // The main storage contract where primary persistant storage is maintained


    /*** Modifiers ************/

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        roleCheck("owner", msg.sender);
        _;
    }

    /**
    * @dev Modifier to scope access to admins
    */
    modifier onlyAdmin() {
        roleCheck("admin", msg.sender);
        _;
    }

    /**
    * @dev Modifier to scope access to admins
    */
    modifier onlySuperUser() {
        require(roleHas("owner", msg.sender) || roleHas("admin", msg.sender));
        _;
    }

    /**
    * @dev Reverts if the address doesn't have this role
    */
    modifier onlyRole(string _role) {
        roleCheck(_role, msg.sender);
        _;
    }

    modifier notPaused(bytes32 _contestName, address _contestAddress) {
        require(!bbStorage.getBool(keccak256("state.paused.contestName", _contestName)) &&
            !bbStorage.getBool(keccak256("state.paused.contestAddress", _contestAddress)) &&
            !bbStorage.getBool(keccak256("state.EMERGENCY")));
        _;
    }

    modifier emergencyOnly(){
        require(bbStorage.getBool(keccak256("state.EMERGENCY")));
        _;
    }
  
    /*** Constructor **********/
   
    /// @dev Set the main Storage address
    function BbBase(address _storageAddress) public {
        // Update the contract address
        bbStorage = BbStorageInterface(_storageAddress);
    }


    /*** Role Utilities */

    /**
    * @dev Check if an address has this role
    * @return bool
    */
    function roleHas(string _role, address _address) internal view returns (bool) {
        return bbStorage.getBool(keccak256("access.role", _role, _address));
    }

     /**
    * @dev Check if an address has this role, reverts if it doesn't
    */
    function roleCheck(string _role, address _address) internal view {
        require(roleHas(_role, _address) == true);
    }



}

