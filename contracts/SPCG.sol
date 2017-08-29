pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/ERC20.sol";

/**
 * @title SPCGToken
 *
 * @dev ERC20 token
 */
contract SPCGToken is ERC20 {

  string public name = "SPCG Token";
  string public symbol = "SPCG";
  uint256 public decimals = 18;

  function SPCGToken() {
  }

}
