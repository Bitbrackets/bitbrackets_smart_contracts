require('dotenv').config();
const Web3 = require("web3");
const web3 = new Web3();
const HDWalletProvider = require("truffle-hdwallet-provider");
const Wallet = require('ethereumjs-wallet');

const infuraKey = new Buffer(process.env["INFURA_KEY"], "hex");

// You can get the current gasLimit by running
// truffle deploy --network rinkeby
// truffle(rinkeby)> web3.eth.getBlock("pending", (error, result) =>
//   console.log(result.gasLimit))

module.exports = {
  web3: Web3,
  networks : {
    geth: {
      host: "localhost",
      port: 8045,
      network_id: "*",
      gas: 4600000
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*"

    },
    infuraRinkeby: {
      provider: function() {
        const rinkebyPrivateKey = new Buffer(process.env["RINKEBY_PRIVATE_KEY"], "hex");
        const rinkebyWallet = Wallet.fromPrivateKey(rinkebyPrivateKey);
        return new HDWalletProvider(rinkebyWallet, `https://rinkeby.infura.io/${infuraKey}`);
      },
      gas: 4600000,
      gasPrice: web3.utils.toWei("20", "gwei"),
      network_id: "5",
    },
    infuraKovan: {
      provider: function() {
        const kovanPrivateKey = new Buffer(process.env["KOVAN_PRIVATE_KEY"], "hex");
        const kovanWallet = Wallet.fromPrivateKey(kovanPrivateKey);
        return new HDWalletProvider(kovanWallet, `https://kovan.infura.io/${infuraKey}`);
      },
      gas: 4600000,
      gasPrice: web3.utils.toWei("20", "gwei"),
      network_id: "4",
    },
    infuraRopsten: {
      provider: function() {
        const ropstenPrivateKey = new Buffer(process.env["ROPSTEN_PRIVATE_KEY"], "hex");
        const ropstenWallet = Wallet.fromPrivateKey(ropstenPrivateKey);
        return new HDWalletProvider(ropstenWallet, `https://ropsten.infura.io/${infuraKey}`);
      },
      gas: 4600000,
      gasPrice: web3.utils.toWei("20", "gwei"),
      network_id: "3",
    },
    infuraMainnet: {
      provider: function () {
        const mainNetPrivateKey = new Buffer(process.env["MAINNET_PRIVATE_KEY"], "hex");
        const mainNetWallet = Wallet.fromPrivateKey(mainNetPrivateKey);
        return new HDWalletProvider(mainNetWallet, `https://mainnet.infura.io/${infuraKey}`);
      },
      gas: 4600000,
      gasPrice: web3.utils.toWei("20", "gwei"),
      network_id: "1",
    },
    infuraNet: {
      provider: function () {
        const infuraNetPrivateKey = new Buffer(process.env["INFURANET_PRIVATE_KEY"], "hex");
        const infuraNetWallet = Wallet.fromPrivateKey(infuraNetPrivateKey);
        return new HDWalletProvider(infuraNetWallet, `https://infuranet.infura.io/${infuraKey}`);
      },
      gas: 4600000,
      gasPrice: web3.utils.toWei("20", "gwei"),
      network_id: "2",
    }
  }
};
