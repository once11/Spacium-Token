var SPCToken = artifacts.require("./SPCToken.sol");

module.exports = function(deployer) {
  const price = web3.toWei(0.00125, "ether");
  const initialSupply = web3.toWei(1000000000, "ether");
  const presaleCap = web3.toWei(20000000, "ether");
  deployer.deploy(SPCToken, initialSupply, presaleCap, price);
};
