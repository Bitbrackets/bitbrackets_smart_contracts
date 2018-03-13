pragma solidity ^0.4.19;

library BitUtil {
    
    function and(bytes32 a, bytes32 b) public pure returns (bytes32) {
        return a & b;
    }
    
    function or(bytes32 a, bytes32 b) public pure returns (bytes32) {
        return a | b;
    }
    
    function xor(bytes32 a, bytes32 b) public pure returns (bytes32) {
        return a ^ b;
    }
    
    function negate(bytes32 a) public pure returns (bytes32) {
        return a ^ allOnes();
    }
    
    function shiftLeft(bytes32 a, uint8 n) public pure returns (bytes32) {
        uint shifted = uint(a) * uint(2) ** n;
        return bytes32(shifted);
    }
    
    function shiftRight(bytes32 a, uint8 n) public pure returns (bytes32) {
        uint shifted = uint(a) / uint(2) ** n;
        return bytes1(shifted);
    }
    
    function getFirstN(bytes32 a, uint8 n) public pure returns (bytes32) {
        bytes32 nOnes = bytes32(uint(2) ** n - 1);
        bytes32 mask = shiftLeft(nOnes, 8 - n); // Total 8 bits
        return a & mask;
    } 
    
    function getLastN(bytes32 a, uint8 n) public pure returns (bytes32) {
        uint lastN = uint(a) % uint(2) ** n;
        return bytes32(lastN);
    } 
    
    // Sets all bits to 1
    function allOnes() public pure returns (bytes32) {
        return bytes32(-1); // 0 - 1, since data type is unsigned, this results in all 1s.
    }
    
    // Get bit value at position
    function getBit(bytes32 a, uint8 n) public pure returns (bool) {
        return a & shiftLeft(0x01, n) != 0;
    }
    
    // Set bit value at position
    function setBit(bytes32 a, uint8 n) public pure returns (bytes32) {
        return a | shiftLeft(0x01, n);
    }
    
    // Set the bit into state "false"
    function clearBit(bytes32 a, uint8 n) public pure returns (bytes32) {
        bytes32 mask = negate(shiftLeft(0x01, n));
        return a & mask;
    }
    
}