pragma solidity 0.4.21;

import "./ContestPoolUpgradable.sol";
import "./interface/BbStorageInterface.sol";
import "./interface/BbVaultInterface.sol";
import "./BbBase.sol";

/*
 * @title TODO Add comments.
 *
 * @author Douglas Molina <doug.molina@bitbrackets.io>
 * @author Guillermo Salazar <guillermo@bitbrackets.io>
 * @author Daniel Tutila <daniel@bitbrackets.io>
 */
contract ContestPoolFactory is BbBase {

     /*** events ***************/
    event ContestPoolDefinitionCreated (
        address indexed contractAddress,
        bytes32 indexed contestName,
        uint startTime,
        uint endTime,
        uint graceTime,
        uint maxAllowedBalance,
        uint fee,
        uint managerFeePercentage,
        uint ownerFeePercentage,
        uint published_at
    );
    
    event ContestPoolCreated (
        address indexed contractAddress,
        bytes32 indexed contestName,
        address indexed manager,
        address contestPoolAddress,
        bytes32 name
    );

    event ContestPoolDeleted (
        address indexed contractAddress,
        bytes32 indexed contestName,
        uint when
    );

    event ContestPoolDisabled (
        address indexed contractAddress,
        bytes32 indexed contestName,
        uint when
    );

    event ContestPoolEnabled (
        address indexed contractAddress,
        bytes32 indexed contestName,
        uint when
    );

    /**** Structs ***********/

    struct ContestPoolDefinition {
        bytes32 contestName;
        uint startTime;
        uint endTime;
        uint graceTime;
        uint maxBalance;
        uint fee;
        bool exists;
        uint ownerFee;
        uint managerFee;
        bool enabled;
    }

    /**** Properties ***********/

    mapping(bytes32 => ContestPoolDefinition) public definitions;

    /*** Modifiers ***************/

    modifier isEnabled(bytes32 _contestName) {
        require(definitions[_contestName].enabled);
        _;
    }

    modifier isDisabled(bytes32 _contestName) {
        require(!definitions[_contestName].enabled);
        _;
    }

    modifier isNew(bytes32 _contestName) {
        require(!definitions[_contestName].exists);
        _;
    }

    modifier exists(bytes32 _contestName) {
        require(definitions[_contestName].exists);
        _;
    }

    modifier isNotOwner(address _address) {
        require(getOwner() != _address);
        _;
    }

    modifier isActive(bytes32 _contestName) {
        require(getCurrentTimestamp() < definitions[_contestName].startTime);
        _;
    }

    /**** methods ***********/


    function ContestPoolFactory(address _storageAddress) public BbBase(_storageAddress) {
        // set version
        version = 1;
    }

    function createContestPoolDefinition(
        bytes32 _contestName, 
        uint _fee,
        uint _startTime, 
        uint _endTime, 
        uint _graceTime, 
        uint _maxBalance,
        uint _managerFee,
        uint _ownerFee) 
    onlyOwner isNew(_contestName) public 
    {
        require(_contestName != bytes32(0x0));
        require(_startTime != 0);
        require(_endTime != 0);
        require(_graceTime != 0);
        require(_maxBalance != 0);
        require(_startTime < _endTime);

        ContestPoolDefinition memory newDefinition = ContestPoolDefinition({
            contestName: _contestName,
            startTime: _startTime,
            endTime: _endTime,
            graceTime: _graceTime,
            maxBalance: _maxBalance,
            fee: _fee,
            exists: true,
            managerFee: _managerFee,
            ownerFee: _ownerFee,
            enabled: true
        });
        definitions[_contestName] = newDefinition;
        emit ContestPoolDefinitionCreated (
            address(this),
            _contestName, 
            _startTime, 
            _endTime, 
            _graceTime,
            _maxBalance,
            _fee,
            _managerFee,
            _ownerFee,
            getCurrentTimestamp()
        );
    }

    function createContestPoolInstance(ContestPoolDefinition _definition, bytes32 _name, address _manager, uint _amountPerPlayer) internal returns (address _newContestPoolAddress) {
        return new ContestPoolUpgradable(
            address(bbStorage),
            _name,
            _manager,
            _definition.contestName,
            _definition.startTime,
            _definition.endTime,
            _definition.graceTime,
            _definition.maxBalance,
            _amountPerPlayer,
            _definition.managerFee,
            _definition.ownerFee
        );
    }
        
    function createContestPool(bytes32 _name, bytes32 _contestName, uint _amountPerPlayer)
        public payable exists(_contestName) isNotOwner(msg.sender) isEnabled(_contestName) isActive(_contestName) returns (address _newContestPoolAddress) {
        require(_name != bytes32(0x0));
        require(_amountPerPlayer > 0);
        ContestPoolDefinition storage definition = definitions[_contestName];
        require(definition.fee == msg.value);
        require(definition.maxBalance > _amountPerPlayer);

        address manager = msg.sender;
        address newContestPoolAddress = createContestPoolInstance(definition, _name, manager, _amountPerPlayer);

        emit ContestPoolCreated(address(this), definition.contestName, manager, newContestPoolAddress, _name);
        return newContestPoolAddress;
    }

    function deleteContestPool(bytes32 _contestName) public onlySuperUser exists(_contestName) {
        delete definitions[_contestName];
        emit ContestPoolDeleted(address(this),_contestName, now);
    }

    function disableContestPool(bytes32 _contestName) public onlySuperUser exists(_contestName) isEnabled(_contestName)  {
        definitions[_contestName].enabled = false;
        emit ContestPoolDisabled(address(this),_contestName, now);
    }

    function enableContestPool(bytes32 _contestName) public onlySuperUser exists(_contestName) isDisabled(_contestName) {
        definitions[_contestName].enabled = true;
        emit ContestPoolEnabled(address(this),_contestName, now);
    }

    function getOwner() internal view returns (address _owner) {
        return bbStorage.getAddress(keccak256("contract.name", "owner"));
    }

    function getBbVaultAddress() internal view returns (address _owner) {
        return bbStorage.getAddress(keccak256("contract.name", "bbVault"));
    }

    function getBbVault() internal view returns (BbVaultInterface _vault) {
        return BbVaultInterface(getBbVaultAddress());
    }

    function withdrawFee() public onlySuperUser {
        address _this = address(this);
        require(_this.balance > 0);
        BbVaultInterface bbVault = getBbVault();
        bbVault.deposit.value(_this.balance)();
    }
    function getCurrentTimestamp() public view returns (uint256) {
        return now;
    }
}