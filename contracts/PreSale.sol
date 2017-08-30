pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./SPCGToken.sol";

contract PreSale {
  using SafeMath for uint;

    address public beneficiary;
    uint public amountRaised; uint public price;
    SPCGToken public tokenReward;

    Funder[] public funders;
    event FundTransfer(address backer, uint amount);

    /* data structure to hold information about campaign contributors */
    struct Funder {
        address addr;
        uint amount;
    }

    /*  at initialization, setup the owner */
    function PreSale(address _beneficiary, uint _price, SPCGToken _reward) {
        beneficiary = _beneficiary;
        price = _price;
        tokenReward = SPCGToken(_reward);
    }

    /* The function without name is the default function that is called whenever anyone sends funds to a contract */
    function () payable{
        uint amount = msg.value;
        funders[funders.length++] = Funder({addr: msg.sender, amount: amount});
        amountRaised += amount;
        /*tokenReward.transfer(msg.sender, amount / price);*/
        tokenReward.transferFrom(beneficiary, msg.sender, amount / price);
        FundTransfer(msg.sender, amount);
    }

}
