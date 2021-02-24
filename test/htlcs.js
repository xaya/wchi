// SPDX-License-Identifier: MIT
// Copyright (C) 2021 Autonomous Worlds Ltd

const WCHI = artifacts.require ("WCHI");
const HTLCs = artifacts.require ("HTLCs");

const truffleAssert = require ("truffle-assertions");

contract ("HTLCs", accounts => {
  let wchi, htlcs;
  beforeEach (async () => {
    wchi = await WCHI.new ({from: accounts[0]});
    htlcs = await HTLCs.new ();

    await wchi.transfer (accounts[1], 100, {from: accounts[0]});
    await wchi.approve (htlcs.address, 50, {from: accounts[1]});
  });

  it ("should create HTLCs correctly", async () => {
    await htlcs.create (wchi.address, accounts[2], 10, 0, "0x01",
                        {from: accounts[1]});
    await truffleAssert.reverts (
        htlcs.create (wchi.address, accounts[2], 41, 0, "0x00",
                      {from: accounts[1]}),
        "allowance exceeded");
    await wchi.transfer (accounts[4], 60, {from: accounts[1]});
    await truffleAssert.reverts (
        htlcs.create (wchi.address, accounts[2], 40, 0, "0x00",
                      {from: accounts[1]}),
        "insufficient balance");
    await truffleAssert.reverts (
        htlcs.create (wchi.address, accounts[2], 10, 0, "0x01",
                      {from: accounts[1]}),
        "is already active");
    await htlcs.create (wchi.address, accounts[3], 20, 42, "0x02",
                        {from: accounts[1]});

    const id1 = await htlcs.getId (wchi.address, accounts[1], accounts[2], 10,
                                   0, "0x01");
    const id2 = await htlcs.getId (wchi.address, accounts[1], accounts[2], 10,
                                   1, "0x01");
    assert.isTrue (await htlcs.active (id1));
    assert.isFalse (await htlcs.active (id2));

    assert.equal ((await wchi.balanceOf (accounts[1])).toNumber (), 10);
    assert.equal ((await wchi.balanceOf (accounts[2])).toNumber (), 0);
    assert.equal ((await wchi.balanceOf (accounts[3])).toNumber (), 0);
    assert.equal ((await wchi.balanceOf (accounts[4])).toNumber (), 60);
    assert.equal ((await wchi.balanceOf (htlcs.address)).toNumber (), 30);
  });

  it ("should handle timeouts", async () => {
    const now = Math.floor (Date.now () / 1000);
    await htlcs.create (wchi.address, accounts[2], 10, now - 1000, "0x01",
                        {from: accounts[1]});
    await htlcs.create (wchi.address, accounts[2], 20, now + 1000, "0x01",
                        {from: accounts[1]});

    await truffleAssert.reverts (
        htlcs.timeout (wchi.address, accounts[1], accounts[2], 10,
                       now - 1, "0x01"),
        "is not active");
    await htlcs.timeout (wchi.address, accounts[1], accounts[2], 10,
                         now - 1000, "0x01");
    await truffleAssert.reverts (
        htlcs.timeout (wchi.address, accounts[1], accounts[2], 10,
                       now - 1000, "0x01"),
        "is not active");
    await truffleAssert.reverts (
        htlcs.timeout (wchi.address, accounts[1], accounts[2], 10,
                       now + 1000,  "0x01"),
        "not yet timed out");

    const id1 = await htlcs.getId (wchi.address, accounts[1], accounts[2], 10,
                                   now - 1000, "0x01");
    const id2 = await htlcs.getId (wchi.address, accounts[1], accounts[2], 20,
                                   now + 1000, "0x01");
    assert.isFalse (await htlcs.active (id1));
    assert.isTrue (await htlcs.active (id2));

    assert.equal ((await wchi.balanceOf (accounts[1])).toNumber (), 80);
    assert.equal ((await wchi.balanceOf (accounts[2])).toNumber (), 0);
    assert.equal ((await wchi.balanceOf (htlcs.address)).toNumber (), 20);
  });

  it ("should handle redeems", async () => {
    const hash = await htlcs.hashData ("0x01");
    await htlcs.create (wchi.address, accounts[2], 10, 0, hash,
                        {from: accounts[1]});

    await truffleAssert.reverts (
        htlcs.redeem (wchi.address, accounts[1], accounts[2], 10, 0, "0x02"),
        "is not active");
    htlcs.redeem (wchi.address, accounts[1], accounts[2], 10, 0, "0x01");

    const id = await htlcs.getId (wchi.address, accounts[1], accounts[2], 10,
                                  0, hash);
    assert.isFalse (await htlcs.active (id));

    assert.equal ((await wchi.balanceOf (accounts[1])).toNumber (), 90);
    assert.equal ((await wchi.balanceOf (accounts[2])).toNumber (), 10);
    assert.equal ((await wchi.balanceOf (htlcs.address)).toNumber (), 0);
  });

});
