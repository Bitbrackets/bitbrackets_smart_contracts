pragma solidity 0.4.21;

/*
 * @title Eternal Storage for Bit Brackets Contracts inspired by the awesome RocketPool project and Eternal Storage implementations.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
contract BbStorage {

    /**** Storage Types *******/
  
    mapping(bytes32 => string)     private stringStorage;
    mapping(bytes32 => address)    private addressStorage;
    mapping(bytes32 => bytes)      private bytesStorage;
    mapping(bytes32 => bool)       private boolStorage;
    mapping(bytes32 => int256)     private intStorage;
    mapping(bytes32 => uint256)    private uIntStorage;
    mapping(bytes32 => uint8[100])     private int8ArrayStorage; 


    /*** Modifiers ************/

    /// @dev Only allow access from the Bit Brackets contracts
    modifier onlyBitBracketsContract() {
        // The owner and other contracts are only allowed to set the storage upon deployment to register the initial contracts/settings, afterwards their direct access is disabled
        if (boolStorage[keccak256("contract.storage.initialised")] == true) {
            // Make sure the access is permitted to only contracts in our control
            require(addressStorage[keccak256("contract.address", msg.sender)] != 0x0);
        } else {
            require(boolStorage[keccak256("access.role", "owner", msg.sender)]);
        }
        _;
    }


    /// @dev constructor
    function BbStorage() public {
        // Set the main owner upon deployment
        // TODO implement ownable using access.role to allow admins
        boolStorage[keccak256("access.role", "owner", msg.sender)] = true;
    }


    /**** Get Methods ***********/
   
    /// @param _key The key for the record
    function getAddress(bytes32 _key) external view returns (address) {
        return addressStorage[_key];
    }

    /// @param _key The key for the record
    function getUint(bytes32 _key) external view returns (uint) {
        return uIntStorage[_key];
    }

    /// @param _key The key for the record
    function getString(bytes32 _key) external view returns (string) {
        return stringStorage[_key];
    }

    /// @param _key The key for the record
    function getBytes(bytes32 _key) external view returns (bytes) {
        return bytesStorage[_key];
    }

    /// @param _key The key for the record
    function getBool(bytes32 _key) external view returns (bool) {
        return boolStorage[_key];
    }

    /// @param _key The key for the record
    function getInt(bytes32 _key) external view returns (int) {
        return intStorage[_key];
    }

    /// @param _key The key for the record
    function getInt8Array(bytes32 _key) external view returns (uint8[100]) {
        return int8ArrayStorage[_key];
    }

    /**** Set Methods ***********/

    /// @param _key The key for the record
    function setAddress(bytes32 _key, address _value) external onlyBitBracketsContract {
        addressStorage[_key] = _value;
    }

    /// @param _key The key for the record
    function setUint(bytes32 _key, uint _value) external onlyBitBracketsContract {
        uIntStorage[_key] = _value;
    }

    /// @param _key The key for the record
    function setString(bytes32 _key, string _value) external onlyBitBracketsContract {
        stringStorage[_key] = _value;
    }

    /// @param _key The key for the record
    function setBytes(bytes32 _key, bytes _value) external onlyBitBracketsContract {
        bytesStorage[_key] = _value;
    }
    
    /// @param _key The key for the record
    function setBool(bytes32 _key, bool _value) external onlyBitBracketsContract {
        boolStorage[_key] = _value;
    }
    
    /// @param _key The key for the record
    function setInt(bytes32 _key, int _value) external onlyBitBracketsContract {
        intStorage[_key] = _value;
    }
    /// @param _key The key for the record
    /// @param _values Array of Values
    function setInt8Array(bytes32 _key, uint8[100] _values) external onlyBitBracketsContract {
        int8ArrayStorage[_key] = _values;
    }
    
    /**** Delete Methods ***********/
    
    /// @param _key The key for the record
    function deleteAddress(bytes32 _key) external onlyBitBracketsContract {
        delete addressStorage[_key];
    }

    /// @param _key The key for the record
    function deleteUint(bytes32 _key) external onlyBitBracketsContract {
        delete uIntStorage[_key];
    }

    /// @param _key The key for the record
    function deleteString(bytes32 _key) external onlyBitBracketsContract {
        delete stringStorage[_key];
    }

    /// @param _key The key for the record
    function deleteBytes(bytes32 _key) external onlyBitBracketsContract {
        delete bytesStorage[_key];
    }
    
    /// @param _key The key for the record
    function deleteBool(bytes32 _key) external onlyBitBracketsContract {
        delete boolStorage[_key];
    }
    
    /// @param _key The key for the record
    function deleteInt(bytes32 _key) external onlyBitBracketsContract {
        delete intStorage[_key];
    }

    /// @param _key The key for the record
    function deleteInt8Array(bytes32 _key)  external onlyBitBracketsContract {
        delete int8ArrayStorage[_key];
    }
}