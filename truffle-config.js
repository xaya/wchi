var HDWalletProvider = require ("@truffle/hdwallet-provider");

module.exports = {
  compilers: {
    solc: {
      version: "^0.7.6",
      settings: {
        optimizer: {
          enabled: true,
          runs: 20000
        }
      }
    }
  },
  networks: {
    ropsten: {
      provider: function ()
        {
          return new HDWalletProvider ({
            privateKeys: [process.env.PRIVKEY],
            providerOrUrl: "https://ropsten.infura.io/v3/" + process.env.API_KEY
          });
        },
      network_id: 3,
      gas: 4000000
    },
    goerli: {
      provider: function ()
        {
          return new HDWalletProvider ({
            privateKeys: [process.env.PRIVKEY],
            providerOrUrl: "https://goerli.infura.io/v3/" + process.env.API_KEY
          });
        },
      network_id: 5,
      gas: 4000000,
      gasPrice: web3.utils.toWei ('1', 'gwei')
    },
    live: {
      provider: function ()
        {
          return new HDWalletProvider ({
            privateKeys: [process.env.PRIVKEY],
            providerOrUrl: "https://mainnet.infura.io/v3/" + process.env.API_KEY
          });
        },
      network_id: 1,
      gas: 1000000
    }
  },
  plugins: ["solidity-coverage"]
};
