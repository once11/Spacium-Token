var SPCGToken = artifacts.require("./SPCGToken.sol");

// var PreSale = artifacts.require("./PreSale.sol");

module.exports = function(deployer) {
  const price = web3.toWei(0.0001593422352528760, "ether");
  deployer.deploy(SPCGToken, price);
  // deployer.deploy(SPCGToken).then(function(){
  //   const beneficiary = web3.eth.accounts[0];
  //   const price = web3.toWei(0.0001593422352528760, "ether");
  //   const token = SPCGToken.address;
  //   deployer.deploy(PreSale, beneficiary, price, token).then(function(){});
  // });
};
