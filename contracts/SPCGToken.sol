pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/StandardToken.sol";

/**
 * @title SPCGToken
 *
 * @dev ERC20 token
 */
contract SPCGToken is StandardToken {

  string public name = "SPCG Token";
  string public symbol = "SPCG";
  uint256 public decimals = 18;

  function SPCGToken() {
  }

}
