const ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(ContestPoolFactory);
};