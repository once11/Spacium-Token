const SPCToken = artifacts.require("SPCToken");
const assertJump = require("zeppelin-solidity/test/helpers/assertJump.js");

contract('SPCToken', function(accounts) {
  beforeEach(async function () {
    this.token_price = 0.00125 * 10 ** 18;
    this.initial_supply = 1000000000 * 10 ** 18;
    this.presale_cap = 20000000 * 10 ** 18;
    this.instance = await SPCToken.new(this.initial_supply, this.presale_cap, this.token_price);
  });

  it("1000000000 SPC must be deposited in the owner's account", async function () {
    const balance = await this.instance.balanceOf(accounts[0]);
    const supply = await this.instance.totalSupply();
    assert.equal(balance.valueOf(), 1000000000 * 10 ** 18, "First account (owner) balance must be 20000000");
    assert.equal(supply.valueOf(), 1000000000 * 10 ** 18, "Supply must be 1000000000");
  });

  it("Should start in pre-sale", async function () {
    const presale = await this.instance.preSaleActive();
    assert.equal(presale.valueOf(), true, "Presale must be active from start");
  });

  it("Should be able to finish the pre-sale", async function () {
    await this.instance.finishPreSale();
    const presale = await this.instance.preSaleActive();
    assert.equal(presale.valueOf(), false, "Presale must be active inactive");
  });

  it("Should be able to restart the pre-sale", async function () {
    await this.instance.activatePreSale();
    const presale = await this.instance.preSaleActive();
    assert.equal(presale.valueOf(), true, "Presale must be active activr");
  });

  it("Unkonwn Spacers should be in invalid state", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    const bakerState = await this.instance.stateOf(bakerHash);
    assert.equal(bakerState.valueOf(), 0, "unknown spacers must be in invalid state");
  });

  it("Should be able to register a Spacer by the owner", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacerBaker(bakerHash);
    const spacersCount = await this.instance.spacersCount();
    assert.equal(spacersCount.valueOf(), 1, "Spacers count must be increased when adding a Spacer");
    const state = await this.instance.stateOf(bakerHash);
    assert.equal(state.valueOf(), 1, "Recently added spacer must be in pending state");
  });

  it("Only the owner can register Spacers", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    try {
      await this.instance.addSpacerBaker(bakerHash, {from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Only the owner can register normal users", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    try {
      await this.instance.addBaker(bakerHash, {from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Only the owner can finish the pre-sale", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    try {
      await this.instance.finishPreSale({from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Only the owner can restart the pre-sale", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    try {
      await this.instance.activatePreSale({from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Registered users can buy during the presale", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addBaker(bakerHash);
    await this.instance.sendTransaction({value: 80 * this.token_price, from: accounts[1], data:bakerHash});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 160 * 10 ** 18, "Registered users cant buy during the pre-sale");
  });

  it("Unregistered users can't buy during the presale", async function () {
    try {
      await this.instance.sendTransaction({value: 80 * this.token_price, from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Unregistered users can't buy during the presale using a fake hash", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    try {
      await this.instance.sendTransaction({value: 80 * this.token_price, from: accounts[1], data:bakerHash});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Unregistered users can't buy during the sale", async function () {
    await this.instance.finishPreSale();
    try {
      await this.instance.sendTransaction({value: 80 * this.token_price, from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("During pre-sale, SPC worth half the price", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addBaker(bakerHash);
    await this.instance.sendTransaction({value: 80 * this.token_price, from: accounts[1], data:bakerHash});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 160 * 10 ** 18, "should receive SPC when sending ethers");
  });

  it("After the pre-sale, SPC worth the exact price", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addBaker(bakerHash);
    await this.instance.finishPreSale();
    await this.instance.sendTransaction({value: 80 * this.token_price, from: accounts[1], data:bakerHash});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 80 * 10 ** 18, "should receive SPC when sending ethers");
  });

  it("Registered Spacers must get their free token", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacerBaker(bakerHash);
    await this.instance.sendTransaction({value: 0, from: accounts[1], data:bakerHash});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 10 * 10 ** 18, "Spacers should receive a free SPC when buyng 0 ether");
    const bakerState = await this.instance.stateOf(bakerHash);
    assert.equal(bakerState.valueOf(), 2, "spacers who claimed the free token must be in claimed state");
  });

  it("Registered Spacers must NOT get their free token twice", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacerBaker(bakerHash);
    await this.instance.sendTransaction({value: 0, from: accounts[1], data:bakerHash});
    try{
      await this.instance.sendTransaction({value: 0, from: accounts[1], data:bakerHash});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Registered Spacers must NOT get their free token after the pre-sale", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacerBaker(bakerHash);
    await this.instance.finishPreSale();
    try{
      await this.instance.sendTransaction({value: 0, from: accounts[1], data:bakerHash});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Spacers who already claimed the free token, cant be registered again as spacers", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacerBaker(bakerHash);
    await this.instance.sendTransaction({value: 0, from: accounts[1], data:bakerHash});
    await this.instance.addSpacerBaker(bakerHash);
    const bakerState = await this.instance.stateOf(bakerHash);
    assert.equal(bakerState.valueOf(), 2, "spacers who claimed the free token must be in claimed state");
  });

  it("Registered users not-spacers must NOT get their free token", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addBaker(bakerHash);
    try{
      await this.instance.sendTransaction({value: 0, from: accounts[1], data:bakerHash});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });


  it("Minimum transaction for non spacers is 0.1 ETH", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addBaker(bakerHash);
    try{
      await this.instance.sendTransaction({value: 0.05 * 10 ** 18, from: accounts[1], data:bakerHash});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Minimum transaction for spacers is 0.1 ETH", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacerBaker(bakerHash);
    try{
      await this.instance.sendTransaction({value: 0.05 * 10 ** 18, from: accounts[1], data:bakerHash});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Minimum transaction after pre-sale for normal users is 0.1 ETH", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addBaker(bakerHash);
    await this.instance.finishPreSale();
    try{
      await this.instance.sendTransaction({value: 0.05 * 10 ** 18, from: accounts[1], data:bakerHash});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Minimum transaction after pre-sale for spacers is 0.1 ETH", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacerBaker(bakerHash);
    await this.instance.finishPreSale();
    try{
      await this.instance.sendTransaction({value: 0.05 * 10 ** 18, from: accounts[1], data:bakerHash});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Must be tradeable", async function () {
    await this.instance.transfer(accounts[1], 1 * 10 ** 18);
    const balance_0 = await this.instance.balanceOf(accounts[0]);
    const balance_1 = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance_0.valueOf(), 999999999 * 10 ** 18, "SPC must be debited from origin account");
    assert.equal(balance_1.valueOf(), 1 * 10 ** 18, "SPC must be deposited in destination account");
  });

  it("Pre Sale must end when cap is reached", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addBaker(bakerHash);
    await this.instance.sendTransaction({value: 20000000 * this.token_price, from: accounts[1], data:bakerHash});
    const presale = await this.instance.preSaleActive();
    assert.equal(presale.valueOf(), false, "Presale must be active inactive");
  });

  it("Must get correct statistics", async function () {
    const bakerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addBaker(bakerHash);
    await this.instance.sendTransaction({value: 80 * this.token_price, from: accounts[1], data:bakerHash});
    const amountRaised = await this.instance.amountRaised();
    const tokensSold = await this.instance.tokensSold();
    assert.equal(amountRaised.valueOf(), 80 * this.token_price, "1 ether must be rised");
    assert.equal(tokensSold.valueOf(), 160 * 10 ** 18, "1 SPC must be sold");
  });

});
