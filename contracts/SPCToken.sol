pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/StandardToken.sol";
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import "zeppelin-solidity/contracts/math/SafeMath.sol";

/**
 * @title SPCToken
 *
 * @dev ERC20 token
 */
contract SPCToken is StandardToken, Pausable {
  using SafeMath for uint256;

  /* Token Data */
  string public name = "Spacium";
  string public symbol = "SPC";
  uint256 public decimals = 18;

  /* Sale Data*/
  uint256 public amountRaised;
  uint256 public price;
  uint256 public tokensSold;
  uint256 public spacersCount;
  bool public preSaleActive;

  /* Spacers database */
  /*0 = invalid, 1 = pending, 2 = claimed*/
  mapping(bytes32 => uint) public spacers;

  function SPCToken(uint256 _initialSupply, uint256 _price) {
    // token price
    price = _price;
    // inital supply of tokens
    totalSupply = _initialSupply;
    // the benificiary is the one who deploy the contract
    owner = msg.sender;
    // all tokens belongs to the benificiary
    balances[owner] = totalSupply;
    // start the presale
    preSaleActive = true;
  }

  // got ethers
  function () whenNotPaused payable{
      uint256 amount = msg.value;
      // raise money
      amountRaised = amountRaised.add(amount);
      // reward our bakers with SPCGs
      uint256 reward = amount.mul(1 ether).div(price);

      // apply discounts
      if(preSaleActive){
        // 2x during presale!
        reward = reward.mul(2);
        // Spaceout.VR users free token
        bytes32 key = convertToKey(msg.data);
        if(spacers[key] == 1){
          // add extra bonus
          reward = reward.add(1 ether);
          // don't add extra bonus any more
          spacers[key] = 2;
        }else{
          // only spacers can buy with 0 eth
          if(msg.value < 0.1 ether){
            return;
          }
        }
      }else{
        // after presale minimum is always 0.1 ETH
        if(msg.value < 0.1 ether){
          return;
        }
      }

      // increment token counter
      tokensSold = tokensSold.add(reward);
      // do the transfer
      balances[msg.sender] = balances[msg.sender].add(reward);
      balances[owner] = balances[owner].sub(reward);
      Transfer(owner, msg.sender, reward);
  }

  function stateOf(bytes data) constant returns (uint){
    return spacers[convertToKey(data)];
  }

  function convertToKey(bytes data) constant returns (bytes32){
    return sha3(data);
  }

  function addSpacer(bytes data) onlyOwner {
    bytes32 key = convertToKey(data);
    if(spacers[key] == 0){
      spacers[key] = 1;
      spacersCount++;
    }
  }

  function finishPreSale() onlyOwner{
    preSaleActive = false;
  }

}
