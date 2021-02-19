// SPDX-License-Identifier: MIT
// Copyright (C) 2021 Autonomous Worlds Ltd

const WCHI = artifacts.require ("WCHI");

const truffleAssert = require ("truffle-assertions");

const zeroAddr = "0x0000000000000000000000000000000000000000";
const maxUint256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";

contract ("WCHI", accounts => {
  let wchi, htlcAddress, supply;
  beforeEach (async () => {
    wchi = await WCHI.new ({from: accounts[0]});
    htlcAddress = await wchi.htlcAddress ();
    supply = (await wchi.totalSupply ()).toNumber ();
  });

  /* ************************************************************************ */
  /* Basic token functionality.  */

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
    await truffleAssert.reverts (
        wchi.transfer (await wchi.htlcAddress (), 10, {from: accounts[1]}),
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

  /* ************************************************************************ */
  /* Token with allowance.  */

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

  /* ************************************************************************ */
  /* HTLC functionality.  */

  it ("should create HTLCs correctly", async () => {
    await wchi.transfer (accounts[1], 100, {from: accounts[0]});

    await wchi.htlcCreate (accounts[2], 10, 0, "0x01", {from: accounts[1]});
    await truffleAssert.reverts (
        wchi.htlcCreate (accounts[2], 91, 0, "0x00", {from: accounts[1]}),
        "insufficient balance");
    await truffleAssert.reverts (
        wchi.htlcCreate (accounts[2], 10, 0, "0x01", {from: accounts[1]}),
        "is already active");
    await wchi.htlcCreate (accounts[3], 20, 42, "0x02", {from: accounts[1]});

    const id1 = await wchi.htlcId (accounts[1], accounts[2], 10, 0, "0x01");
    const id2 = await wchi.htlcId (accounts[1], accounts[2], 10, 1, "0x01");
    assert.isTrue (await wchi.htlcActive (id1));
    assert.isFalse (await wchi.htlcActive (id2));

    assert.equal ((await wchi.balanceOf (accounts[1])).toNumber (), 70);
    assert.equal ((await wchi.balanceOf (accounts[2])).toNumber (), 0);
    assert.equal ((await wchi.balanceOf (accounts[3])).toNumber (), 0);
    assert.equal ((await wchi.balanceOf (htlcAddress)).toNumber (), 30);

    assert.equal (await wchi.totalSupply (), supply);
  });

  it ("should handle HTLC timeouts", async () => {
    await wchi.transfer (accounts[1], 100, {from: accounts[0]});

    const now = Math.floor (Date.now () / 1000);
    await wchi.htlcCreate (accounts[2], 10, now - 1000, "0x01",
                           {from: accounts[1]});
    await wchi.htlcCreate (accounts[2], 20, now + 1000, "0x01",
                           {from: accounts[1]});

    await truffleAssert.reverts (
        wchi.htlcTimeout (accounts[1], accounts[2], 10, now - 1, "0x01"),
        "is not active");
    await wchi.htlcTimeout (accounts[1], accounts[2], 10, now - 1000, "0x01");
    await truffleAssert.reverts (
        wchi.htlcTimeout (accounts[1], accounts[2], 10, now - 1000, "0x01"),
        "is not active");
    await truffleAssert.reverts (
        wchi.htlcTimeout (accounts[1], accounts[2], 10, now + 1000,  "0x01"),
        "not yet timed out");

    const id1 = await wchi.htlcId (accounts[1], accounts[2], 10,
                                   now - 1000, "0x01");
    const id2 = await wchi.htlcId (accounts[1], accounts[2], 20,
                                   now + 1000, "0x01");
    assert.isFalse (await wchi.htlcActive (id1));
    assert.isTrue (await wchi.htlcActive (id2));

    assert.equal ((await wchi.balanceOf (accounts[1])).toNumber (), 80);
    assert.equal ((await wchi.balanceOf (accounts[2])).toNumber (), 0);
    assert.equal ((await wchi.balanceOf (htlcAddress)).toNumber (), 20);

    assert.equal (await wchi.totalSupply (), supply);
  });

  it ("should handle HTLC redeems", async () => {
    await wchi.transfer (accounts[1], 100, {from: accounts[0]});

    const hash = await wchi.htlcHash ("0x01");
    await wchi.htlcCreate (accounts[2], 10, 0, hash, {from: accounts[1]});

    await truffleAssert.reverts (
        wchi.htlcRedeem (accounts[1], accounts[2], 10, 0, "0x02"),
        "is not active");
    wchi.htlcRedeem (accounts[1], accounts[2], 10, 0, "0x01");

    const id = await wchi.htlcId (accounts[1], accounts[2], 10,
                                  0, hash);
    assert.isFalse (await wchi.htlcActive (id));

    assert.equal ((await wchi.balanceOf (accounts[1])).toNumber (), 90);
    assert.equal ((await wchi.balanceOf (accounts[2])).toNumber (), 10);
    assert.equal ((await wchi.balanceOf (htlcAddress)).toNumber (), 0);

    assert.equal (await wchi.totalSupply (), supply);
  });

  /* ************************************************************************ */

});
