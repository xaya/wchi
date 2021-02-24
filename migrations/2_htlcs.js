const HTLCs = artifacts.require ("HTLCs");

module.exports = function (deployer)
  {
    deployer.deploy (HTLCs);
  };
