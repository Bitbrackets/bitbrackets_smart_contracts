pragma solidity 0.4.21;

import "./BbBase.sol";
import "./interface/BbStorageInterface.sol";

/// @title Role Based Access Control for BitBrackets
/// @author Doug Molina
contract BbRole is BbBase {

    /*** Events **************/

    event LogRoleAdded(
        address indexed anAddress,
        string roleName
    );

    event LogRoleRemoved(
        address indexed anAddress,
        string roleName
    );

    event LogOwnershipTransferred(
        address indexed previousOwner, 
        address indexed newOwner
    );


    /*** Modifiers ************/

    /// @dev Only allow access from the latest version of the RocketRole contract
    modifier onlyLatestBbRole() {
        require(address(this) == bbStorage.getAddress(keccak256("contract.name", "bbRole")));
        _;
    }
  
    /*** Constructor **********/
   
    /// @dev constructor
    function BbRole(address _bbStorageAddress)  public BbBase(_bbStorageAddress) {
        // Set the version
        version = 1;
    }

     /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param _newOwner The address to transfer ownership to.
    */
    function transferOwnership(address _newOwner) public onlyLatestBbRole onlyOwner {
        // Legit address?
        require(_newOwner != 0x0);
        // Check the role exists 
        roleCheck("owner", msg.sender);
        // Remove current role
        bbStorage.deleteBool(keccak256("access.role", "owner", msg.sender));
        // Add new owner
        bbStorage.setBool(keccak256("access.role", "owner", _newOwner), true);
    }


    /**** Admin Role Methods ***********/


   /**
   * @dev Give an address access to this role
   */
    function adminRoleAdd(string _role, address _address) public onlyLatestBbRole onlySuperUser {
        roleAdd(_role, _address);
    }

    /**
   * @dev Remove an address access to this role
   */
    function adminRoleRemove(string _role, address _address) public onlyLatestBbRole onlySuperUser {
        roleRemove(_role, _address);
    }


    /**** Internal Role Methods ***********/
   
    /**
   * @dev Give an address access to this role
   */
    function roleAdd(string _role, address _address) internal {
        // Legit address?
        require(_address != 0x0);
        // Only one owner to rule them all
        require(keccak256(_role) != keccak256("owner"));
        // Add it
        bbStorage.setBool(keccak256("access.role", _role, _address), true);
        // Log it
        emit LogRoleAdded(_address, _role);
    }

    /**
    * @dev Remove an address' access to this role
    */
    function roleRemove(string _role, address _address) internal {
        // Only an owner can transfer their access
        require(!roleHas("owner", _address));
        // Remove from storage
        bbStorage.deleteBool(keccak256("access.role", _role, _address));
        // Log it
        emit LogRoleRemoved(_address, _role);
    }


}