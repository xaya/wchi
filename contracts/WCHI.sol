// SPDX-License-Identifier: MIT
// Copyright (C) 2021 Autonomous Worlds Ltd

pragma solidity ^0.7.6;

import "./IWCHI.sol";

/**
 * @dev Wrapped CHI (WCHI) token.  This contract is not upgradable and not
 * owned, but it grants an initial supply to the contract creator.  The Xaya
 * team will hold these tokens, and give them out for CHI locked on the
 * Xaya network.  When WCHI tokens are returned, those CHI will be released
 * again.
 */
contract WCHI is IWCHI
{

  string public constant name = "Wrapped CHI";
  string public constant symbol = "WCHI";
  uint8 public constant decimals = 8;

  /**
   * @dev Initial supply of tokens minted.  This is a bit larger than the
   * real total supply of CHI.
   */
  uint256 internal constant initialSupply = 78 * 10**6 * 10**decimals;

  /**
   * @dev Total supply of tokens.  This includes tokens that are in the
   * Xaya team's reserve, i.e. do not correspond to real CHI locked
   * in the treasury.
   */
  uint256 public override totalSupply;

  /** @dev Balances of tokens per address.  */
  mapping (address => uint256) public override balanceOf;

  /**
   * @dev Allowances for accounts (second) to spend from the balance
   * of an owner (first).
   */
  mapping (address => mapping (address => uint256)) public override allowance;

  /**
   * @dev Data stored about an active HTLC.
   */
  struct HTLC
  {
    /* Token value of the HTLC.  */
    uint256 value;

    /* Who gets refunded in case of timeout.  */
    address from;
    /* Who can claim the funds with the preimage.  */
    address to;

    /* Block timestamp when the HTLC times out.  */
    uint timeout;
    /* Hash preimage for a claim.  */
    bytes20 hash;
  }

  /** @dev Active (not yet finished) HTLCs keyed with their ID.  */
  mapping (uint => HTLC) public htlcById;

  /**
   * @dev Total number of HTLCs created to far, including finished ones.
   * This is used to generate consecutive IDs.
   */
  uint public htlcCount;

  /**
   * @dev In the constructor, we grant the contract creator the initial balance.
   * This is the only place where any address has special rights compared
   * to all others.
   */
  constructor ()
  {
    totalSupply = initialSupply;
    balanceOf[msg.sender] = initialSupply;
    emit Transfer (address (0), msg.sender, initialSupply);
  }

  /**
   * @dev Sets the allowance afforded to the given spender by
   * the message sender.
   */
  function approve (address spender, uint256 value)
      external override returns (bool)
  {
    allowance[msg.sender][spender] = value;
    emit Approval (msg.sender, spender, value);
    return true;
  }

  /**
   * @dev Moves a given amount of tokens from the message sender's
   * account to the recipient.  If to is the zero address, then those
   * tokens are burnt and reduce the total supply.
   */
  function transfer (address to, uint256 value) external override returns (bool)
  {
    return uncheckedTransfer (msg.sender, to, value);
  }

  /**
   * @dev Moves a given amount of tokens from the sender account to the
   * recipient.  If from is not the message sender, then it needs to have
   * sufficient allowance.
   */
  function transferFrom (address from, address to, uint256 value)
      external override returns (bool)
  {
    if (from != msg.sender)
      {
        /* Check for the allowance and reduce it.  */
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type (uint256).max)
          {
            require (allowed >= value, "WCHI: allowance exceeded");
            uint256 newAllowed = allowed - value;
            allowance[from][msg.sender] = newAllowed;
            emit Approval (from, msg.sender, newAllowed);
          }
      }

    return uncheckedTransfer (from, to, value);
  }

  /**
   * @dev Internal transfer implementation.  This is used to implement transfer
   * and transferFrom, and does not check that the sender is actually
   * allowed to spend the tokens.
   */
  function uncheckedTransfer (address from, address to, uint256 value)
      internal returns (bool)
  {
    deductBalance (from, value);

    if (to == address (0))
      {
        /* Tokens are burnt.  */
        assert (totalSupply >= value);
        totalSupply -= value;
      }
    else
      {
        /* Tokens are transferred to the receiver.  */
        balanceOf[to] += value;
      }

    emit Transfer (from, to, value);
    return true;
  }

  /**
   * @dev Internal helper function to check the balance of the given user
   * and deduct the given amount.
   */
  function deductBalance (address from, uint256 value) internal
  {
    uint256 balance = balanceOf[from];
    require (balance >= value, "WCHI: insufficient balance");
    balanceOf[from] = balance - value;
  }

  /**
   * @dev Returns the hash used for HTLCs.  We use RIPEMD160, to be
   * compatible with HTLCs from BOLT 03 (Lightning).
   */
  function htlcHash (bytes memory data) public override pure returns (bytes20)
  {
    return ripemd160 (data);
  }

  /**
   * @dev Creates a new HTLC and returns its ID.
   */
  function htlcCreate (address to, uint256 value, uint timeout, bytes20 hash)
      external override returns (uint)
  {
    require (value > 0, "WCHI: HTLC value is zero");
    deductBalance (msg.sender, value);

    uint id = htlcCount;
    htlcCount = id + 1;

    htlcById[id] = HTLC (value, msg.sender, to, timeout, hash);
    emit HtlcCreated (id, msg.sender, to, value);

    return id;
  }

  /**
   * @dev Times out an HTLC.  This can be called by anyone who wants to
   * execute the transaction, and will pay back to the original sender
   * who locked the tokens.
   */
  function htlcTimeout (uint id) external override
  {
    HTLC memory entry = htlcById[id];

    require (entry.value > 0, "WCHI: HTLC does not exist");
    require (block.timestamp >= entry.timeout,
             "WCHI: HTLC is not yet timed out");

    delete htlcById[id];
    emit HtlcTimeout (id, entry.from, entry.value);

    /* Refund the amount back to the sender.  */
    balanceOf[entry.from] += entry.value;
  }

  /**
   * @dev Redeems an HTLC with its preimage to the receiver.  This can be
   * called by anyone willing to pay for execution, and will send the tokens
   * always to the HTLC's receiver.
   */
  function htlcRedeem (uint id, bytes memory preimage) external override
  {
    HTLC memory entry = htlcById[id];

    require (entry.value > 0, "WCHI: HTLC does not exist");
    require (htlcHash (preimage) == entry.hash, "WCHI: preimage mismatch");

    delete htlcById[id];
    emit HtlcRedeemed (id);

    /* Send the tokens to the receiver.  */
    balanceOf[entry.to] += entry.value;
    emit Transfer (entry.from, entry.to, entry.value);
  }

}
