pragma solidity ^0.4.19;


contract BbStorageInterface {
    /// @dev Eternal Storage Interface 

    // Modifiers
    modifier onlyLatestBitBracketsContract() {_;}
    // Getters
    function getAddress(bytes32 _key) external view returns (address);
    function getUint(bytes32 _key) external view returns (uint);
    function getString(bytes32 _key) external view returns (string);
    function getBytes(bytes32 _key) external view returns (bytes);
    function getBool(bytes32 _key) external view returns (bool);
    function getInt(bytes32 _key) external view returns (int);
    function getInt8Array(bytes32 _key) external view returns (uint8[100]);
    // Setters
    function setAddress(bytes32 _key, address _value) onlyLatestBitBracketsContract external;
    function setUint(bytes32 _key, uint _value) onlyLatestBitBracketsContract external;
    function setString(bytes32 _key, string _value) onlyLatestBitBracketsContract external;
    function setBytes(bytes32 _key, bytes _value) onlyLatestBitBracketsContract external;
    function setBool(bytes32 _key, bool _value) onlyLatestBitBracketsContract external;
    function setInt(bytes32 _key, int _value) onlyLatestBitBracketsContract external;
    function setInt8Array(bytes32 _key, uint8[100] _values) onlyLatestBitBracketsContract external;
    // Deleters
    function deleteAddress(bytes32 _key) onlyLatestBitBracketsContract external;
    function deleteUint(bytes32 _key) onlyLatestBitBracketsContract external;
    function deleteString(bytes32 _key) onlyLatestBitBracketsContract external;
    function deleteBytes(bytes32 _key) onlyLatestBitBracketsContract external;
    function deleteBool(bytes32 _key) onlyLatestBitBracketsContract external;
    function deleteInt(bytes32 _key) onlyLatestBitBracketsContract external;
    function deleteInt8Array(bytes32 _key) onlyLatestBitBracketsContract external;
}

