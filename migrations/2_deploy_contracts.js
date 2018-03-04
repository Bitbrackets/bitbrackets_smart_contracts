const ContestPool = artifacts.require("./ContestPool.sol");

module.exports = function(deployer) {
    deployer.deploy(ContestPool);
};