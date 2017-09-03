const SPCGToken = artifacts.require("SPCGToken");
const assertJump = require("zeppelin-solidity/test/helpers/assertJump.js");

contract('SPCGToken', function(accounts) {
  beforeEach(async function () {
    this.token_price = 0.0001593422352528760 * 10 ** 18;
    this.instance = await SPCGToken.new(this.token_price);
  });

  it("should put 10000000 SPCG to supply and in the first account", async function () {

    const balance = await this.instance.balanceOf(accounts[0]);
    const supply = await this.instance.totalSupply();

    assert.equal(balance.valueOf(), 10000000 * 10 ** 18, "First account (owner) balance must be 10000000");
    assert.equal(supply.valueOf(), 10000000 * 10 ** 18, "Supply must be 10000000");
  });

  it("unkonwn spacers should be in invalid state", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    const state_of_spacer = await this.instance.stateOf(spacerHash);
    assert.equal(state_of_spacer.valueOf(), 0, "unknown spacers must be in invalid state");
  });

  it("known spacers should be in the pending state", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacer(spacerHash);
    const state = await this.instance.stateOf(spacerHash);
    assert.equal(state.valueOf(), 1, "Recently added spacer must be in pending state");
  });

  it("should be able to add a Spacer by the owner", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacer(spacerHash);
    const spacersCount = await this.instance.spacersCount();
    assert.equal(spacersCount.valueOf(), 1, "Spacers count must be increased when adding a Spacer");
    const state = await this.instance.stateOf(spacerHash);
    assert.equal(state.valueOf(), 1, "Recently added spacer must be in pending state");
  });

  it("should not be able to add a Spacer by not the owner", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    try {
      await this.instance.addSpacer(spacerHash, {from: accounts[1]});
    } catch (error) {
      return assertJump(error);
    }
    assert.fail('should have thrown before');
  });

  it("should get SPCG by ethers", async function () {
    await this.instance.sendTransaction({value: this.token_price, from: accounts[1]});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 1 * 10 ** 18, "should receive SPCG when sending ethers");
  });

  it("Spacers should get their free SPCG", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacer(spacerHash);
    await this.instance.sendTransaction({value: 0, from: accounts[1], data:spacerHash});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 1 * 10 ** 18, "Spacers should receive a free SPCG when buyng 0 ether");
    const state_of_spacer = await this.instance.stateOf(spacerHash);
    assert.equal(state_of_spacer.valueOf(), 2, "spacers who claimed the free token must be in claimed state");
  });

  it("Spacers should not get their free SPCG twice", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacer(spacerHash);
    await this.instance.sendTransaction({value: 0, from: accounts[1], data:spacerHash});
    await this.instance.sendTransaction({value: 0, from: accounts[1], data:spacerHash});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 1 * 10 ** 18, "Spacers should receive a free SPCG when buyng 0 ether");
    const state_of_spacer = await this.instance.stateOf(spacerHash);
    assert.equal(state_of_spacer.valueOf(), 2, "spacers who claimed the free token must be in claimed state");
  });

  it("Spacers should get their free SPCG when buying with eth", async function () {
    const spacerHash = '0x2c788263cedb7547eab69c7d70fdb9a8b8b1d2229ff3215b31f41685cbfdb8c8f3aa27ddd64538c49129d08bba6eddca2e722b78c14d4e525c05b1edfa05ec68';
    await this.instance.addSpacer(spacerHash);
    await this.instance.sendTransaction({value: 0.0001593422352528760 * 10 ** 18, from: accounts[1], data:spacerHash});
    const balance = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance.valueOf(), 2 * 10 ** 18, "Spacers should receive a free SPCG when buyng 0 ether");
    const state_of_spacer = await this.instance.stateOf(spacerHash);
    assert.equal(state_of_spacer.valueOf(), 2, "spacers who claimed the free token must be in claimed state");
  });

  it("SPCG should be tradeable", async function () {
    await this.instance.transfer(accounts[1], 1 * 10 ** 18);
    const balance_0 = await this.instance.balanceOf(accounts[0]);
    const balance_1 = await this.instance.balanceOf(accounts[1]);
    assert.equal(balance_0.valueOf(), 9999999 * 10 ** 18, "SPCG must be debited from origin account");
    assert.equal(balance_1.valueOf(), 1 * 10 ** 18, "SPCG must be deposited in destination account");
  });

  it("Statistics works", async function () {
    await this.instance.sendTransaction({value: this.token_price, from: accounts[1]});
    const amountRaised = await this.instance.amountRaised();
    const tokensSold = await this.instance.tokensSold();
    assert.equal(amountRaised.valueOf(), this.token_price, "1 ether must be rised");
    assert.equal(tokensSold.valueOf(), 1 * 10 ** 18, "1 SPCG must be sold");
  });

});
