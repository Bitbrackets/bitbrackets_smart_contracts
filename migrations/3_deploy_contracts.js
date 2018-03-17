const ResultsLookup = artifacts.require("./ResultsLookup.sol");

module.exports = function(deployer, network, accounts) {
    deployer.deploy(ResultsLookup);
};