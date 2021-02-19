// SPDX-License-Identifier: MIT
// Copyright (C) 2021 Autonomous Worlds Ltd

pragma solidity ^0.7.6;

import "./IERC20.sol";

/**
 * @dev Interface for the wrapped CHI (WCHI) token.
 */
interface IWCHI is IERC20
{

  /**
   * @dev Burns the given number of tokens, reducing total supply.
   */
  function burn (uint256 value) external;

  /**
   * @dev Returns the hash used in HTLCs of the given data.
   */
  function htlcHash (bytes memory data) external pure returns (bytes20);

  /**
   * @dev Computes and returns the hash / ID of an HTLC corresponding
   * to the given data.
   */
  function htlcId (address from, address to, uint256 value,
                   uint timeout, bytes20 hash) external pure returns (bytes32);

  /**
   * @dev Creates a new HTLC:  value tokens are removed from the message
   * sender's balance and "locked" into the HTLC.  They can be reclaimed
   * by the message sender at the timeout block time, or redeemed for the
   * receiver if the preimage of hash is provided.
   */
  function htlcCreate (address to, uint256 value, uint timeout, bytes20 hash)
      external returns (bytes32);

  /**
   * @dev Refunds a HTLC that has timed out.  All data for the HTLC has to be
   * provided here again, and the contract will check that a HTLC with this
   * data exists (as well as that it is timed out).
   */
  function htlcTimeout (address from, address to, uint256 value,
                        uint timeout, bytes20 hash) external;

  /**
   * @dev Redeems a HTLC with the preimage to the receiver.  The data
   * for the HTLC has to be passed in (the hash is computed from the preimage).
   */
  function htlcRedeem (address from, address to, uint256 value,
                       uint timeout, bytes memory preimage) external;

  /** @dev Emitted when a new HTLC has been created.  */
  event HtlcCreated (bytes32 id, address from, address to, uint256 value,
                     uint timeout, bytes20 hash);

  /** @dev Emitted when a HTLC is timed out.  */
  event HtlcTimeout (bytes32 id, address from, address to, uint256 value,
                     uint timeout, bytes20 hash);

  /** @dev Emitted when a HTLC is redeemed.  */
  event HtlcRedeemed (bytes32 id, address from, address to, uint256 value,
                      uint timeout, bytes20 hash);

}
