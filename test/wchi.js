// SPDX-License-Identifier: MIT
// Copyright (C) 2021 Autonomous Worlds Ltd

const WCHI = artifacts.require ("WCHI");

const truffleAssert = require ("truffle-assertions");

const zeroAddr = "0x0000000000000000000000000000000000000000";
const maxUint256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

contract ("WCHI", accounts => {
  let wchi, supply;
  beforeEach (async () => {
    wchi = await WCHI.new ({from: accounts[0]});
    supply = (await wchi.totalSupply ()).toNumber ();
  });

  it ("should assign initial balance", async () => {
    const bal0 = (await wchi.balanceOf (accounts[0])).toNumber ();
    const bal1 = (await wchi.balanceOf (accounts[1])).toNumber ();
    assert.isAbove (supply, 0);
    assert.equal (bal0, supply);
    assert.equal (bal1, 0);
  });

  it ("should transfer tokens", async () => {
    await wchi.transfer (accounts[1], 100, {from: accounts[0]});

    await wchi.transfer (accounts[2], 10, {from: accounts[1]});
    await wchi.transfer (accounts[3], 20, {from: accounts[1]});
    await wchi.transfer (accounts[4], 70, {from: accounts[1]});

    assert.equal ((await wchi.balanceOf (accounts[1])).toNumber (), 0);
    assert.equal ((await wchi.balanceOf (accounts[2])).toNumber (), 10);
    assert.equal ((await wchi.balanceOf (accounts[3])).toNumber (), 20);
    assert.equal ((await wchi.balanceOf (accounts[4])).toNumber (), 70);
  });

  it ("should not transfer tokens", async () => {
    await wchi.transfer (accounts[1], 100, {from: accounts[0]});

    await truffleAssert.reverts (
        wchi.transfer (accounts[2], 101, {from: accounts[1]}),
        "insufficient balance");
    await truffleAssert.reverts (
        wchi.transfer (zeroAddr, 10, {from: accounts[1]}),
        "zero address");
    await truffleAssert.reverts (
        wchi.transfer (wchi.address, 10, {from: accounts[1]}),
        "contract address");

    assert.equal ((await wchi.balanceOf (accounts[1])).toNumber (), 100);
    assert.equal ((await wchi.balanceOf (accounts[2])).toNumber (), 0);
  });

  it ("should burn tokens", async () => {
    await wchi.transfer (accounts[1], 100, {from: accounts[0]});

    await wchi.burn (10, {from: accounts[1]});
    await truffleAssert.reverts (wchi.burn (91, {from: accounts[1]}),
                                 "insufficient balance");

    assert.equal ((await wchi.balanceOf (accounts[1])).toNumber (), 90);
    assert.equal ((await wchi.balanceOf (zeroAddr)).toNumber (), 0);

    const newSupply = (await wchi.totalSupply ()).toNumber ();
    assert.equal (newSupply, supply - 10);
  });

  it ("should allow transferFrom with message sender", async () => {
    await wchi.transfer (accounts[1], 100, {from: accounts[0]});
    await wchi.transferFrom (accounts[1], accounts[2], 10, {from: accounts[1]});
    assert.equal ((await wchi.balanceOf (accounts[1])).toNumber (), 90);
    assert.equal ((await wchi.balanceOf (accounts[2])).toNumber (), 10);
  });

  it ("should handle allowances", async () => {
    await wchi.transfer (accounts[1], 100, {from: accounts[0]});
    assert.equal ((await wchi.allowance (accounts[1], accounts[2])).toNumber (),
                  0);

    await wchi.approve (accounts[2], 20, {from: accounts[1]});
    await wchi.approve (accounts[2], 10, {from: accounts[1]});
    assert.equal ((await wchi.allowance (accounts[1], accounts[2])).toNumber (),
                  10);
    await truffleAssert.reverts (
        wchi.transferFrom (accounts[1], accounts[3], 11, {from: accounts[2]}),
        "allowance exceeded");
    await wchi.transferFrom (accounts[1], accounts[3], 7, {from: accounts[2]});
    assert.equal ((await wchi.allowance (accounts[1], accounts[2])).toNumber (),
                  3);

    await wchi.approve (accounts[2], maxUint256, {from: accounts[1]});
    await truffleAssert.reverts (
        wchi.transferFrom (accounts[1], accounts[4], 100, {from: accounts[2]}),
        "insufficient balance");
    await wchi.transferFrom (accounts[1], accounts[4], 90, {from: accounts[2]});
    assert.equal ((await wchi.allowance (accounts[1], accounts[2])).toString (),
                  maxUint256);

    assert.equal ((await wchi.balanceOf (accounts[1])).toNumber (), 3);
    assert.equal ((await wchi.balanceOf (accounts[2])).toNumber (), 0);
    assert.equal ((await wchi.balanceOf (accounts[3])).toNumber (), 7);
    assert.equal ((await wchi.balanceOf (accounts[4])).toNumber (), 90);
  });

});
