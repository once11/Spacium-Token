pragma solidity ^0.4.2;

/// Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20
/// @title Abstract token contract - Functions to be implemented by token contracts.
contract Token {
    // This is not an abstract function, because solc won't recognize generated getter functions for public variables as functions
    function totalSupply() constant returns (uint256 supply) {}
    function balanceOf(address owner) constant returns (uint256 balance);
    function transfer(address to, uint256 value) returns (bool success);
    function transferFrom(address from, address to, uint256 value) returns (bool success);
    function approve(address spender, uint256 value) returns (bool success);
    function allowance(address owner, address spender) constant returns (uint256 remaining);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/*contract SPCG is Token {
    function issueTokens(address _for, uint tokenCount) payable returns (bool);
    function changeEmissionContractAddress(address newAddress) returns (bool);
}*/

/*import "tokens/StandardToken.sol";*/

/// @title SPCG contract - Takes funds from users and issues SPC tokens.
/// @author Agustin Abreu - <aa@spaceoutvr.com>
contract SPCG is Token{

  function issueTokens(address _for, uint tokenCount) payable returns (bool);
  function changeEmissionContractAddress(address newAddress) returns (bool);

    /*
     * External contracts
     */
    SPCG public spcg = SPCG(0x0);

    /*
     * Crowdfunding parameters
     */
    uint constant public CROWDFUNDING_PERIOD = 1 days;
    // Goal threshold, 10000 ETH
    uint constant public CROWDSALE_TARGET = 10000 ether;

    /*
     *  Storage
     */
    address public founder;
    address public multisig;
    uint public startDate = 0;
    uint public icoBalance = 0;
    uint public baseTokenPrice = 1000 szabo; // 0.0001 ETH
    uint public discountedPrice = baseTokenPrice;
    bool public isICOActive = false;

    // participant address => value in Wei
    mapping (address => uint) public investments;

    /*
     *  Modifiers
     */
    modifier onlyFounder() {
        // Only founder is allowed to do this action.
        if (msg.sender != founder) {
            throw;
        }
        _;
    }

    modifier minInvestment() {
        // User has to send at least the ether value of one token.
        if (msg.value < baseTokenPrice * 100) {
            throw;
        }
        _;
    }

    modifier icoActive() {
        if (isICOActive == false) {
            throw;
        }
        _;
    }

    modifier applyBonus() {
        uint icoDuration = now - startDate;
        if (icoDuration >= 30 minutes) {
            discountedPrice = baseTokenPrice;
        }
        else if (icoDuration >= 20 minutes) {
            discountedPrice = (baseTokenPrice * 100) / 107;
        }
        else if (icoDuration >= 15 minutes) {
            discountedPrice = (baseTokenPrice * 100) / 120;
        }
        else if (icoDuration >= 10 minutes) {
            discountedPrice = (baseTokenPrice * 100) / 142;
        }
        else if (icoDuration >= 5 minutes) {
            discountedPrice = (baseTokenPrice * 100) / 150;
        }
        else {
            discountedPrice = (baseTokenPrice * 100) / 200;
        }
        _;
    }

    /// @dev Allows user to create tokens if token creation is still going
    /// and cap was not reached. Returns token count.
    function fund()
        public
        applyBonus
        icoActive
        minInvestment
        payable
        returns (uint)
    {
        // Token count is rounded down. Sent ETH should be multiples of baseTokenPrice.
        uint tokenCount = msg.value / discountedPrice;
        // Ether spent by user.
        uint investment = tokenCount * discountedPrice;
        // Send change back to user.
        if (msg.value > investment && !msg.sender.send(msg.value - investment)) {
            throw;
        }
        // Update fund's and user's balance and total supply of tokens.
        icoBalance += investment;
        investments[msg.sender] += investment;
        // Send funds to founders.
        if (!multisig.send(investment)) {
            // Could not send money
            throw;
        }
        if (!spcg.issueTokens(msg.sender, tokenCount)) {
            // Tokens could not be issued.
            throw;
        }
        return tokenCount;
    }

    /// @dev If ICO has successfully finished sends the money to multisig
    /// wallet.
    function finishCrowdsale()
        external
        onlyFounder
        returns (bool)
    {
        if (isICOActive == true) {
            isICOActive = false;
            // Founders receive 14% of all created tokens.
            /*uint founderBonus = ((icoBalance / baseTokenPrice) * 114) / 100;
            if (!spcg.issueTokens(multisig, founderBonus)) {
                // Tokens could not be issued.
                throw;
            }*/
        }
    }

    /// @dev Sets token value in Wei.
    /// @param valueInWei New value.
    function changeBaseTokenPrice(uint valueInWei)
        external
        onlyFounder
        returns (bool)
    {
        baseTokenPrice = valueInWei;
        return true;
    }

    /// @dev Function that activates ICO.
    function startICO()
        external
        onlyFounder
    {
        if (isICOActive == false && startDate == 0) {
          // Start ICO
          isICOActive = true;
          // Set start-date of token creation
          startDate = now;
        }
    }

    /// @dev Contract constructor function sets founder and multisig addresses.
    function SPCGICO(address _multisig) {
        // Set founder address
        founder = msg.sender;
        // Set multisig address
        multisig = _multisig;
    }

    /// @dev Fallback function. Calls fund() function to create tokens.
    function () payable {
        fund();
    }
}
