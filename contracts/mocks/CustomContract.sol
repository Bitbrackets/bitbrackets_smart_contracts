pragma solidity 0.4.21;

/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
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
