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
  uint256 public decimals = 2;
  uint256 public INITIAL_SUPPLY = 10000000;

  function SPCGToken() {
    totalSupply = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }

}
