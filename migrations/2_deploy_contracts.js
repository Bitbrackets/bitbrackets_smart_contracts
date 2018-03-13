const ContestPool = artifacts.require("./ContestPool.sol");
const BitUtil = artifacts.require("./utils/BitUtil.sol");

module.exports = function(deployer, network, accounts) {
    const owner = accounts[0];
    const manager = accounts[1];
    deployer.deploy(BitUtil);
    deployer.deploy(ContestPool, owner, manager, "", 0,0,0,10, 10000);
};