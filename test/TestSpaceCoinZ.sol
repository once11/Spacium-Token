pragma solidity ^0.4.11;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/SpaceCoinZ.sol";

contract TestSpaceCoinZ {

  function testInitialBalance() {
    SpaceCoinZ coin = new SpaceCoinZ();
    uint expected = 0;
    Assert.equal(coin.balanceOf(tx.origin), expected, "Owner should have 0 SpaceCoinZ initially");
  }

}
