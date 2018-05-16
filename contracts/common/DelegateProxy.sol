pragma solidity ^0.4.19;


/**
* Borrowed from the Awesome AragonOS project.
*
*/
contract DelegateProxy {
    /**
    * @dev Performs a delegatecall and returns whatever the delegatecall 
    * returned (entire context execution will return!)
    * @param _dst Destination address to perform the delegatecall
    * @param _calldata Calldata for the delegatecall
    */
    function delegatedFwd(address _dst, bytes _calldata) internal {
        delegatedFwd(_dst, _calldata, 0);
    }

    /**
    * @dev Performs a delegatecall and returns whatever the delegatecall returned 
    * (entire context execution will return!)
    * @param _dst Destination address to perform the delegatecall
    * @param _calldata Calldata for the delegatecall
    * @param _minReturnSize Minimum size the call needs to return, if less than that it will revert
    */
    function delegatedFwd(address _dst, bytes _calldata, uint256 _minReturnSize) internal {
        require(isContract(_dst));
        //Adds 185 in costs with no return value.
        //Adds 208 in gas with 32byte return value
        assembly{

        //gas needs to be uint:ed
            let g := and(gas,0xEFFFFFFF)
            let o_code := mload(0x40) //Memory end
        //Address also needs to be masked
        //Also, important, storage location must be correct
        // sload(0) is dependant on the order of declaration above
            let addr := and(sload(0),0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) //Dest address
        //Get call data (method sig & params)
            calldatacopy(o_code, 0, calldatasize)

        //callcode or delegatecall or call
            let retval := call(g
            , addr //address
            , 0 //value
            , o_code //mem in
            , calldatasize //mem_insz
            , o_code //reuse mem
            , 32) //Hardcoded to 32 b return value

        // Check return value
        // 0 == it threw, so we do aswell by jumping to
        // bad destination (02)
            jumpi(0x02,iszero(retval))

        // return(p,s) : end execution, return data mem[p..(p+s))
            return(o_code,32)
        }
    }

    /**
   * @dev Performs a delegatecall and returns whatever the delegatecall returned
   * (entire context execution will return!)
   * @param _dst Destination address to perform the delegatecall
   * @param _calldata Calldata for the delegatecall
   * @param _minReturnSize Minimum size the call needs to return, if less than that it will revert
   */
    function delegatedFwd_old(address _dst, bytes _calldata, uint256 _minReturnSize) internal {
        require(isContract(_dst));
        uint256 size;
        uint256 result;

        assembly {
            result := delegatecall(sub(gas, 10000), _dst, add(_calldata, 0x20), mload(_calldata), 0, 0)
            size := returndatasize
        }

        require(size >= _minReturnSize);

        assembly {
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)

        // revert instead of invalid() bc if the underlying call failed with invalid() it already wasted gas.
        // if the call returned error data, forward it
            switch result case 0 { revert(ptr, size) }
            default { return(ptr, size) }
        }
    }

    function isContract(address _target) internal view returns (bool) {
        if (_target == address(0)) {
            return false;
        }

        uint256 size;
        assembly { size := extcodesize(_target) }
        return size > 0;
    }
}