const ContestPool = artifacts.require("./ContestPool.sol");

module.exports = function(deployer, network, accounts) {
    const owner = accounts[0];
    const manager = accounts[1];
    deployer.deploy(ContestPool, owner, manager, "", 0,0,0,10);
};