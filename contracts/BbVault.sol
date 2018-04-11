pragma solidity 0.4.21;

import "./BbBase.sol";
import "./interface/BbVaultInterface.sol";
import "./SafeMath.sol";


/**
 * This contract is the BbVaultInterface's implementation for BitBrackets.
 * This contract stores the ethers transferred from other BitBrackets' contracts for safe keeping.
 * It also implements a multiple signatures logic for transfering ether to other accounts based on votes from the owners.
 *
 * @author Guillermo Salazar
 */
contract BbVault is BbBase, BbVaultInterface {

    /**** Libs *****************/    
    using SafeMath for uint;

    /*** Events ****************/

    event LogDeposit (
        address indexed contractAddress,
        address indexed from,
        uint256 value
    );

    event LogRequestTransaction (
        address indexed contractAddress,
        address indexed requestedBy,
        address indexed toAccount,
        uint256 amount
    );

    event LogVoteRequestTransaction (
        address indexed contractAddress,
        address indexed votedBy,
        bytes   name,
        uint256 currentVotes
    );

    event LogWithdrawal (
        address indexed contractAddress,
        address indexed toAccount,
        uint256 indexed value,
        bytes name
    );


    /*** Modifiers *************/

    /// @dev Only allow access from the owner of that account
    modifier onlyAccountOwner() {
        // Check it's the account owner or the top level owner
        require(bbStorage.getBool(keccak256("vault.account.owner", msg.sender)) == true || 
              roleHas("owner", msg.sender) == true);
        _;
    } 

    modifier requestTransactionIsPresent(bytes _name, bool _exist) {
      require(_name.length > 0);
      require(bbStorage.getBool(keccak256("vault.request.transactions.", _name, ".exist")) == _exist);
      _;
    }

    modifier requestTransactionIsDone(bytes _name, bool _done) {
      require(_name.length > 0);
      require(bbStorage.getBool(keccak256("vault.request.transactions.", _name, ".done")) == _done);
      _;
    }

    /*** Constructor ***********/    
    function BbVault(address _bbStorageAddress) BbBase(_bbStorageAddress) public {
        // Set the version
        version = 1;
    }

    /**** Methods ***********/

    function () payable public {
      emit LogDeposit(address(this), msg.sender, msg.value);
    }

    function deposit() payable external {
        require(msg.value > 0);

        emit LogDeposit(address(this), msg.sender, msg.value);
    }

    function getRequestTransaction(bytes _name) internal view requestTransactionIsPresent(_name, true) returns (
      bool _exist,
      uint _amount,
      address _toAccount,
      uint _votes,
      bool done
    ) {
      return (
        bbStorage.getBool(keccak256("vault.request.transactions.", _name, ".exist")),
        bbStorage.getUint(keccak256("vault.request.transactions.", _name, ".amount")),
        bbStorage.getAddress(keccak256("vault.request.transactions.", _name, ".toAccount")),
        bbStorage.getUint(keccak256("vault.request.transactions.", _name, ".votes")),
        bbStorage.getBool(keccak256("vault.request.transactions.", _name, ".done"))
      );
    }

    function createRequestTransaction(bytes _name, uint _amount, address _toAccount) external onlyAccountOwner requestTransactionIsPresent(_name, false){
        require(_amount > 0);
        require(_toAccount != 0x0);

        bbStorage.setBool(keccak256("vault.request.transactions.", _name, ".exist"), true);
        bbStorage.setUint(keccak256("vault.request.transactions.", _name, ".votes"), 0);
        bbStorage.setBytes(keccak256("vault.request.transactions.", _name, ".name"), _name);
        bbStorage.setUint(keccak256("vault.request.transactions.", _name, ".amount"), _amount);
        bbStorage.setAddress(keccak256("vault.request.transactions.", _name, ".toAccount"), _toAccount);

        emit LogRequestTransaction(address(this), msg.sender, _toAccount, _amount); 
    }

    function getVotesRequestTransaction(bytes _name) public view returns (uint _votes) {
      return bbStorage.getUint(keccak256("vault.request.transactions.", _name, ".votes"));
    }

    function isDoneRequestTransaction(bytes _name) external view onlyAccountOwner returns (bool _done){
      return bbStorage.getBool(keccak256("vault.request.transactions.", _name, ".done"));
    }

    function existRequestTransaction(bytes _name) external view onlyAccountOwner returns (bool _exist){
      return bbStorage.getBool(keccak256("vault.request.transactions.", _name, ".exist"));
    }

    function voteRequestTransaction(bytes _name) external
    onlyAccountOwner
    requestTransactionIsPresent(_name, true)
    requestTransactionIsDone(_name, false) {
      require(bbStorage.getBool(keccak256("vault.request.transactions.", _name, ".votes.", msg.sender)) == false);

      uint votes = bbStorage.getUint(keccak256("vault.request.transactions.", _name, ".votes"));
      uint newVotes = votes.add(1);
      bbStorage.setUint(keccak256("vault.request.transactions.", _name, ".votes"), newVotes);
      bbStorage.setBool(keccak256("vault.request.transactions.", _name, ".votes.", msg.sender), true);
      emit LogVoteRequestTransaction(address(this), msg.sender, _name, newVotes);
    }

    function withdraw(bytes _name) external 
      onlyAccountOwner
      requestTransactionIsPresent(_name, true)
      requestTransactionIsDone(_name, false) {
      var (
        ,
        _amount,
        _toAccount,
        _votes,
      ) = getRequestTransaction(_name);

      uint requiredVotes = bbStorage.getUint(keccak256("vault.request.transactions.", _name, ".votes"));
      require(_votes >= requiredVotes);
      require(address(this).balance >= _amount);
      bbStorage.setBool(keccak256("vault.request.transactions.", _name, ".done"), true);

      _toAccount.transfer(_amount);

      emit LogWithdrawal(address(this), _toAccount, _amount, _name);
    }
}