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
   * @dev Returns the hash used in HTLCs of the given data.
   */
  function htlcHash (bytes memory data) external pure returns (bytes20);

  /**
   * @dev Creates a new HTLC:  value tokens are removed from the message
   * sender's balance and "locked" into the HTLC.  They can be reclaimed
   * by the message sender at the timeout block time, or redeemed for the
   * receiver if the preimage of hash is provided.
   */
  function htlcCreate (address to, uint256 value, uint timeout, bytes20 hash)
      external returns (uint);

  /**
   * @dev Refunds a HTLC that has timed out.
   */
  function htlcTimeout (uint id) external;

  /**
   * @dev Redeems a HTLC with the preimage to the receiver.
   */
  function htlcRedeem (uint id, bytes memory preimage) external;

  /** @dev Emitted when a new HTLC has been created.  */
  event HtlcCreated (uint id, address from, address to, uint256 value);

  /** @dev Emitted when a HTLC is timed out.  */
  event HtlcTimeout (uint id, address from, uint256 value);

  /**
   * @dev Emitted when a HTLC is redeemed.  In this situation, also a normal
   * Transfer event is emitted.
   */
  event HtlcRedeemed (uint id);

}
