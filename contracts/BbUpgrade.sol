pragma solidity 0.4.21;


import "./BbBase.sol";
import "./BbStorage.sol";


/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
contract BbUpgrade is BbBase {

    /*** Events ****************/

    event ContractUpgraded (
        address indexed contractAddress,
        address indexed oldContractAddress,
        address indexed newContractAddress,
        string contractName
    );

    /*** Constructor ***********/    

    /// @dev BbUpgrade constructor
    function BbUpgrade(address _bbStorageAddress) BbBase(_bbStorageAddress) public {
        // Set the version
        version = 1;
    }

    /**** Contract Upgrade Methods ***********/
    function upgradeContract(string _name, address _upgradedContractAddress)  external onlySuperUser {
        address oldContractAddress = bbStorage.getAddress(keccak256("contract.name", _name));
        
        require(oldContractAddress != 0x0);
        require(oldContractAddress != _upgradedContractAddress);
        require(oldContractAddress.balance == 0);
        
        bbStorage.setAddress(keccak256("contract.name", _name), _upgradedContractAddress);
        bbStorage.setAddress(keccak256("contract.address", _upgradedContractAddress), _upgradedContractAddress);
        bbStorage.deleteAddress(keccak256("contract.address", oldContractAddress));

        emit ContractUpgraded(address(this), oldContractAddress, _upgradedContractAddress, _name);
    }
}