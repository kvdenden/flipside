// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Market } from "../Market.sol";

interface IRewardManager {
  function collect(Market market, uint256 amount) external;
  function claim(Market market) external;
}
