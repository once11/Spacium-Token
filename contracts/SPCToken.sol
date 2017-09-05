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
  uint256 public presaleCap;
  uint256 public price;
  uint256 public tokensSold;
  uint256 public bakersCount;
  uint256 public spacersCount;
  bool public preSaleActive;

  /* Bakers are people who bought tokens during the pre sale */
  /* 0 = invalid, 1 = pending, 2 = claimed, 3 = normal user */
  mapping(bytes32 => uint) public bakers;

  function SPCToken(uint256 _initialSupply, uint256 _presaleCap, uint256 _price) {
    // token price
    price = _price;
    // inital supply of tokens
    totalSupply = _initialSupply;
    // presale cap
    presaleCap = _presaleCap;
    // the benificiary is the one who deploy the contract
    owner = msg.sender;
    // all tokens belongs to the benificiary
    balances[owner] = totalSupply;
    // start the presale
    preSaleActive = true;
  }

  modifier isKnownHash {
    uint state = stateOf(msg.data);
    require(state > 0);
    _;
  }

  modifier isValidPurchase {
    uint state = stateOf(msg.data);
    // the amount is greater than the minimum purchase
    // or is a spacer claiming the free tokens
    require(msg.value >= 0.1 ether || (preSaleActive && msg.value == 0 && state == 1));
    _;
  }

  // got ethers
  function () whenNotPaused isValidPurchase isKnownHash payable{
      uint256 amount = msg.value;
      // reward our bakers with SPCGs
      uint256 reward = amount.mul(1 ether).div(price);

      // pre sale apply bonus
      if(preSaleActive){
        // 2x during presale!
        reward = reward.mul(2);
        // Spaceout.VR users free tokens
        uint state = stateOf(msg.data);
        if(state == 1){
          // add extra bonus
          reward = reward.add(10 ether);
          // don't add extra bonus any more
          bakers[convertToKey(msg.data)] = 2;
        }
      }

      // raise money
      amountRaised = amountRaised.add(amount);
      // increment token counter
      tokensSold = tokensSold.add(reward);
      // do the transfer
      balances[msg.sender] = balances[msg.sender].add(reward);
      balances[owner] = balances[owner].sub(reward);
      Transfer(owner, msg.sender, reward);

      // auto finish the presale when cap is reached
      if(preSaleActive && tokensSold >= presaleCap){
        preSaleActive = false;
      }
  }

  function stateOf(bytes data) constant returns (uint){
    return bakers[convertToKey(data)];
  }

  function convertToKey(bytes data) constant returns (bytes32){
    return sha3(data);
  }

  function addSpacerBaker(bytes data) onlyOwner {
    bytes32 key = convertToKey(data);
    if(bakers[key] == 0){
      bakers[key] = 1;
      spacersCount++;
      bakersCount++;
    }
  }

  function addBaker(bytes data) onlyOwner {
    bytes32 key = convertToKey(data);
    if(bakers[key] == 0){
      bakers[key] = 3;
      bakersCount++;
    }
  }

  function activatePreSale() onlyOwner{
    preSaleActive = true;
  }

  function finishPreSale() onlyOwner{
    preSaleActive = false;
  }

}
