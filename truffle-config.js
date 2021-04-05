var HDWalletProvider = require ("@truffle/hdwallet-provider");

const Web3 = require ("web3");
const web3 = new Web3 ();

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
    },
    mumbai: {
      provider: function ()
        {
          return new HDWalletProvider ({
            privateKeys: [process.env.PRIVKEY],
            providerOrUrl: "https://rpc-mumbai.matic.today/"
          });
        },
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      gasPrice: web3.utils.toWei ('1', 'gwei')
    },
    matic: {
      provider: function ()
        {
          return new HDWalletProvider ({
            privateKeys: [process.env.PRIVKEY],
            providerOrUrl: "https://rpc-mainnet.matic.network/"
          });
        },
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      gasPrice: web3.utils.toWei ('1', 'gwei')
    },
    xdai: {
      provider: function ()
        {
          return new HDWalletProvider ({
            privateKeys: [process.env.PRIVKEY],
            providerOrUrl: "https://rpc.xdaichain.com/"
          });
        },
      network_id: 100,
      gas: 8000000,
      gasPrice: web3.utils.toWei ('1', 'gwei')
    }
  },
  plugins: ["solidity-coverage"]
};
