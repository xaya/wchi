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
   * @dev Increases the allowance of a given spender by the given amount.
   */
  function increaseAllowance (address spender, uint256 addedValue)
      external returns (bool);

  /**
   * @dev Decreases the allowance of a given spender by the given amount.
   */
  function decreaseAllowance (address spender, uint256 removedValue)
      external returns (bool);

}
