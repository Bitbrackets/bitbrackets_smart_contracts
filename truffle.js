module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks : {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 4500000
    },
    ganache: {
      host: "localhost",
      port: 7545,
      network_id: "*",
      gas: 4500000
    }
  }
};
