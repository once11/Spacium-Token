pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/StandardToken.sol";
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import "zeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title SPCGToken
 *
 * @dev ERC20 token
 */
contract SPCGToken is StandardToken, Ownable {
  using SafeMath for uint256;

  /* Token Data */
  string public name = "Spacium Genesis Token";
  string public symbol = "SPCG";
  uint256 public decimals = 18;
  uint256 public INITIAL_SUPPLY = 10000000 * 10 ** 18;

  /* Sale Data*/
  uint256 public amountRaised;
  uint256 public price;
  uint256 public tokensSold;
  uint256 public spacersCount;

  /* Spacers database */
  /*0 = invalid, 1 = pending, 2 = claimed*/
  mapping(bytes32 => uint) public spacers;

  function SPCGToken(uint256 _price) {
    price = _price;
    // inital supply of tokens
    totalSupply = INITIAL_SUPPLY;
    // the benificiary is the one who deploy the contract
    owner = msg.sender;
    // all tokens belongs to the benificiary
    balances[owner] = totalSupply;
  }

  // got ethers
  function () payable{
      uint256 amount = msg.value;
      // raise money
      amountRaised = amountRaised.add(amount);
      // reward our bakers with SPCGs
      uint256 reward = amount.mul(1 ether).div(price);
      bytes32 key = convertToKey(msg.data);
      if(spacers[key] == 1){
        // add extra bonus
        reward = reward.add(1 ether);
        // don't add extra bonus any more
        spacers[key] = 2;
      }
      // increment token counter
      tokensSold = tokensSold.add(reward);
      // do the transfer
      balances[msg.sender] = balances[msg.sender].add(reward);
      balances[owner] = balances[owner].sub(reward);
      Transfer(owner, msg.sender, reward);
      /*super.transferFrom(owner, msg.sender, reward);*/
  }

  function stateOf(bytes data) onlyOwner constant returns (uint){
    return spacers[convertToKey(data)];
  }

  function convertToKey(bytes data) constant returns (bytes32){
    return sha3(data);
  }

  function addSpacer(bytes data) external onlyOwner {
    spacers[convertToKey(data)] = 1;
    spacersCount++;
  }

}
