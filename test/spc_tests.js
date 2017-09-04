const SPCToken = artifacts.require("SPCToken");
const assertJump = require("zeppelin-solidity/test/helpers/assertJump.js");

contract('SPCToken', function(accounts) {
  beforeEach(async function () {
    this.token_price = 0.00125 * 10 ** 18;
    this.initial_supply = 20000000 * 10 ** 18;
    this.instance = await SPCToken.new(this.initial_supply, this.token_price);
  });

  it("20000000 SPC must be deposited in the owner's account", async function () {
    const balance = await this.instance.balanceOf(accounts[0]);
    const supply = await this.instance.totalSupply();
    assert.equal(balance.valueOf(), 20000000 * 10 ** 18, "First account (owner) balance must be 20000000");
    assert.equal(supply.valueOf(), 20000000 * 10 ** 18, "Supply must be 20000000");
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

  it("Unkonwn Spacers should be in invalid state", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    const state_of_spacer = await this.instance.stateOf(spacerHash);
    assert.equal(state_of_spacer.valueOf(), 0, "unknown spacers must be in invalid state");
  });

  it("Should be able to register a Spacer by the owner", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacer(spacerHash);
    const spacersCount = await this.instance.spacersCount();
    assert.equal(spacersCount.valueOf(), 1, "Spacers count must be increased when adding a Spacer");
    const state = await this.instance.stateOf(spacerHash);
    assert.equal(state.valueOf(), 1, "Recently added spacer must be in pending state");
  });

  it("Only the owner can register Spacers", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    try {
      await this.instance.addSpacer(spacerHash, {from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("Only the owner can finish the pre-sale", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    try {
      await this.instance.finishPreSale({from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("During pre-sale, SPC worth half the price", async function () {
    await this.instance.sendTransaction({value: this.token_price, from: accounts[1]});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 2 * 10 ** 18, "should receive SPC when sending ethers");
  });

  it("After the pre-sale, SPC worth the exact price", async function () {
    await this.instance.finishPreSale();
    await this.instance.sendTransaction({value: this.token_price, from: accounts[1]});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 1 * 10 ** 18, "should receive SPC when sending ethers");
  });

  it("Registered Spacers must get their free token", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacer(spacerHash);
    await this.instance.sendTransaction({value: 0, from: accounts[1], data:spacerHash});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 1 * 10 ** 18, "Spacers should receive a free SPC when buyng 0 ether");
    const state_of_spacer = await this.instance.stateOf(spacerHash);
    assert.equal(state_of_spacer.valueOf(), 2, "spacers who claimed the free token must be in claimed state");
  });

  it("Registered Spacers must NOT get their free token tiwce", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacer(spacerHash);
    await this.instance.sendTransaction({value: 0, from: accounts[1], data:spacerHash});
    await this.instance.sendTransaction({value: 0, from: accounts[1], data:spacerHash});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 1 * 10 ** 18, "Spacers should receive a free SPC when buyng 0 ether");
    const state_of_spacer = await this.instance.stateOf(spacerHash);
    assert.equal(state_of_spacer.valueOf(), 2, "spacers who claimed the free token must be in claimed state");
  });

  it("Registered Spacers must NOT get their free token after the pre-sale", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacer(spacerHash);
    await this.instance.finishPreSale();
    await this.instance.sendTransaction({value: 0, from: accounts[1], data:spacerHash});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 0, "Spacers must not receive a free SPC after the pre sale");
  });

  it("Spacers who already claimed the free token, cant be registered", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacer(spacerHash);
    await this.instance.sendTransaction({value: 0, from: accounts[1], data:spacerHash});
    await this.instance.addSpacer(spacerHash);
    const state_of_spacer = await this.instance.stateOf(spacerHash);
    assert.equal(state_of_spacer.valueOf(), 2, "spacers who claimed the free token must be in claimed state");
  });

  it("Must be tradeable", async function () {
    await this.instance.transfer(accounts[1], 1 * 10 ** 18);
    const balance_0 = await this.instance.balanceOf(accounts[0]);
    const balance_1 = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance_0.valueOf(), 19999999 * 10 ** 18, "SPC must be debited from origin account");
    assert.equal(balance_1.valueOf(), 1 * 10 ** 18, "SPC must be deposited in destination account");
  });

  it("Must get correct statistics", async function () {
    await this.instance.sendTransaction({value: this.token_price, from: accounts[1]});
    const amountRaised = await this.instance.amountRaised();
    const tokensSold = await this.instance.tokensSold();
    assert.equal(amountRaised.valueOf(), this.token_price, "1 ether must be rised");
    assert.equal(tokensSold.valueOf(), 2 * 10 ** 18, "1 SPC must be sold");
  });

  // TODO:
  // should be paused / un paused
  // only the owner can pause / un pause
  

});
