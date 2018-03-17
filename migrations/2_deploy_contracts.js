const config = require("../truffle");
const AddressArray = artifacts.require("./AddressArray.sol");
const ContestPool = artifacts.require("./ContestPool.sol");
const ContestPoolMock = artifacts.require("./ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
const ResultsLookup = artifacts.require("./ResultsLookup.sol");
const ContestPool = artifacts.require("./ContestPool.sol");


module.exports = function(deployer, network, accounts) {

    const owner = accounts[0];
    const manager = accounts[1];



    return deployer.deploy(BbStorage).then(async () => {

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

        await deployer.deploy(ResultsLookup, BbStorage.address);
        // deployer.deploy(ContestPoolFactory);
        // const owner = accounts[0];
        // const manager = accounts[1];
        deployer.deploy(ContestPool, owner, manager, "", 0,0,0,10, 10000);
        

        try {
            const storageInstance = await BbStorage.deployed();
            console.log('\n');

            // Log it
            console.log('\x1b[33m%s\x1b[0m:', 'Set Storage Address');
            console.log(BbStorage.address);

            //ContestPoolFactory
            //register address
            await storageInstance.setAddress(
                config.web3.utils.soliditySha3('contract.address', ContestPoolFactory.address),
                ContestPoolFactory.address
            );
            //register by name    
            await storageInstance.setAddress(
                config.web3.utils.soliditySha3('contract.name', 'contestPoolFactory'),
                ContestPoolFactory.address
            );

             // Log it
             console.log('\x1b[33m%s\x1b[0m:', 'Set ContestPoolFactory Address');
             console.log(ContestPoolFactory.address);

            //ResultsLookup
            //register address
            await storageInstance.setAddress(
                config.web3.utils.soliditySha3('contract.address', ResultsLookup.address),
                ResultsLookup.address
            );
            //register by name    
            await storageInstance.setAddress(
                config.web3.utils.soliditySha3('contract.name', 'resultsLookup'),
                ResultsLookup.address
            );

            // Log it
            console.log('\x1b[33m%s\x1b[0m:', 'Set ResultsLookup Address');
            console.log(ResultsLookup.address);

            /*** Permissions *********/
                                  
            // Disable direct access to storage now
            await storageInstance.setBool(
                config.web3.utils.soliditySha3('contract.storage.initialised'),
                true
            );
            // Log it
            console.log('\x1b[32m%s\x1b[0m', 'Post - Storage Direct Access Removed');

        } catch (error) {
            console.error("Error on deploy: ", error);
        }

        return deployer;
    }); 

};