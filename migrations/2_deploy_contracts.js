const config = require("../truffle");
const AddressArray = artifacts.require("./AddressArray.sol");
const ContestPool = artifacts.require("./ContestPool.sol");
const BbVault = artifacts.require("./BbVault.sol");
const BbVaultMock = artifacts.require("./BbVaultMock.sol");
const AddressArrayClient = artifacts.require("./AddressArrayClient.sol");
const ContestPoolMock = artifacts.require("./ContestPoolMock.sol");
const BbStorage = artifacts.require("./BbStorage.sol");
const ContestPoolFactory = artifacts.require("./ContestPoolFactory.sol");
const ResultsLookup = artifacts.require("./ResultsLookup.sol");
const jsonfile = require('jsonfile');
const contractsJson = './build/contracts.json';

const contracts = {};
const networksForMocks = ["test"];

module.exports = function(deployer, network, accounts) {

    if(accounts.length < 3) {
        throw new Error(`The deployment needs at least 3 accounts. Actual accounts ${accounts.length}.`);
    }

    const owner = accounts[0];
    const manager = accounts[1];
    const ceo = accounts[2];

    const deployMocks = networksForMocks.indexOf(network) > -1;

    console.log('\n\n\n==================================================');
    console.log(`Starting deploy contracts in '${network}' network.`);
    console.log(`Deploying mock contracts? ${deployMocks}`);
    console.log('Owner: ' + owner);
    console.log('Manager: ' + manager);
    console.log('CEO: ' + ceo);
    console.log('==================================================\n\n\n');

    return deployer.deploy(BbStorage).then(async () => {
        try {
            await deployer.deploy(BbVault, BbStorage.address, [owner, manager, ceo], 2);
			contracts.vault = BbVault.address;

            await deployer.deploy(AddressArray);
    
            if(deployMocks) {
                deployer.link(AddressArray, ContestPool);
                deployer.deploy(ContestPool, owner, "", manager, "", 0,0,0,10, 10000, 10, 10);

                deployer.link(AddressArray, AddressArrayClient);
                deployer.deploy(AddressArrayClient);

                deployer.deploy(BbVaultMock, BbStorage.address, [owner, manager, ceo], 2);
            }
    
            await deployer.link(AddressArray, ContestPoolFactory);
            await deployer.deploy(ContestPoolFactory, BbStorage.address);
   
            contracts.contestPoolFactory = ContestPoolFactory.address;
            
            if(deployMocks) {
                deployer.link(AddressArray, ContestPoolMock);
                deployer.deploy(ContestPoolMock, owner, manager);
            }
    
            await deployer.deploy(ResultsLookup, BbStorage.address);
            contracts.resultsLookup = ResultsLookup.address;

            const storageInstance = await BbStorage.deployed();
            contracts.storage = BbStorage.address;
            
            //ContestPoolFactory
            //register address
            await storageInstance.setAddress(
                config.web3.utils.soliditySha3('contract.address', ContestPoolFactory.address),
                ContestPoolFactory.address
            );
            await storageInstance.setAddress(
                config.web3.utils.soliditySha3('contract.address', BbVault.address),
                BbVault.address
            );

            //register by name    
            await storageInstance.setAddress(
                config.web3.utils.soliditySha3('contract.name', 'contestPoolFactory'),
                ContestPoolFactory.address
            );
            await storageInstance.setAddress(
                config.web3.utils.soliditySha3('contract.name', 'bbVault'),
                BbVault.address
            );

            if(deployMocks) {
                await storageInstance.setAddress(
                    config.web3.utils.soliditySha3('contract.name', 'bbVaultMock'),
                    BbVaultMock.address
                );
                await storageInstance.setAddress(
                    config.web3.utils.soliditySha3('contract.address', BbVaultMock.address),
                    BbVaultMock.address
                );
            }

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

            /*** Permissions *********/

            //register owner by name    
            await storageInstance.setAddress(
                config.web3.utils.soliditySha3('contract.name', 'owner'),
                owner
            );                     

            // Disable direct access to storage now
            await storageInstance.setBool(
                config.web3.utils.soliditySha3('contract.storage.initialised'),
                true
            );

            // Log it
            console.log('\x1b[33m%s\x1b[0m:', 'Set Storage Address');
            console.log(BbStorage.address); 
            console.log('\x1b[33m%s\x1b[0m:', 'Set ContestPoolFactory Address');
            console.log(ContestPoolFactory.address);
            console.log('\x1b[33m%s\x1b[0m:', 'Set ResultsLookup Address');
            console.log(ResultsLookup.address);
            console.log('\x1b[33m%s\x1b[0m:', 'Set BbVault Address');
            console.log(BbVault.address);            
            console.log('\x1b[32m%s\x1b[0m', 'Post - Storage Direct Access Removed');

            jsonfile.writeFile(contractsJson, contracts, {spaces: 2, EOL: '\r\n'}, function (err) {
                console.log(`JSON file created at '${contractsJson}'.`);
                console.error("Errors: " + err);
            });

        } catch (error) {
            console.error("Error on deploy: ", error);
        }
        return deployer;
    }); 

};