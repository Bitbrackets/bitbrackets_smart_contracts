const AddressArray = artifacts.require("./AddressArray.sol");
const ContestPool = artifacts.require("./ContestPool.sol");
const ContestPoolMock = artifacts.require("./ContestPoolMock.sol");
const ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");


module.exports = function(deployer, network, accounts) {
    const owner = accounts[0];
    const manager = accounts[1];

    deployer.deploy(AddressArray);
    
    if(network !== 'live') {
        deployer.link(AddressArray, ContestPool);
        deployer.deploy(ContestPool, owner, manager, "", 0,0,0,10, 10000, 10, 10);
    }

    deployer.link(AddressArray, ContestPoolFactory);
    deployer.deploy(ContestPoolFactory);

    if(network !== 'live') {
        deployer.link(AddressArray, ContestPoolMock);
        deployer.deploy(ContestPoolMock, owner, manager);
    }
};