const ContestPool = artifacts.require("./ContestPool.sol");

module.exports = function(deployer, network, accounts) {
    const owner = accounts[1];
    deployer.deploy(ContestPool, owner, "", 0,0,0);
};