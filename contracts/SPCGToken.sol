pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title SPCGToken
 *
 * @dev ERC20 token
 */
contract SPCGToken is StandardToken {
  using SafeMath for uint256;

  /* Token Data */
  string public name = "Spacium Genesis Token";
  string public symbol = "SPCG";
  uint256 public decimals = 18;
  uint256 public INITIAL_SUPPLY = 10000000;

  /* Sale Data*/
  address public beneficiary;
  uint256 public amountRaised;
  uint256 public price;

  function SPCGToken(uint256 _price) {
    price = _price;
    // inital supply of tokens
    totalSupply = INITIAL_SUPPLY;
    // the benificiary is the one who deploy the contract
    beneficiary = msg.sender;
    // all tokens belongs to the benificiary
    balances[beneficiary] = totalSupply;
  }

  // got ethers
  function () payable{
      uint256 amount = msg.value;
      // raise money
      amountRaised = amountRaised.add(amount);
      // reward our bakers with SPCGs!
      uint256 reward = amount.div(price);
      balances[msg.sender] = balances[msg.sender].add(reward);
      balances[beneficiary] = balances[beneficiary].sub(reward);
      Transfer(beneficiary, msg.sender, reward);
  }


}
