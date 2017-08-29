// var SpaceCoinZ = artifacts.require("./SpaceCoinZ.sol");
var SPCG = artifacts.require("./SPCG.sol");

module.exports = function(deployer) {
  deployer.deploy(SPCG).then(function(){
    const beneficiary = web3.eth.accounts[0];
    const price = web3.toWei(0.0001593422352528760, "ether");
    const token = SPCG.address;
    deployer.deploy(PreSale, beneficiary, price, token);
  });
};
