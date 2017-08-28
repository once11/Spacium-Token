// var SpaceCoinZ = artifacts.require("./SpaceCoinZ.sol");
var PreSale = artifacts.require("./PreSale.sol");

module.exports = function(deployer) {
  // deployer.deploy(SpaceCoinZ);
  deployer.deploy(PreSale);
};
