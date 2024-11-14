// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IMarket } from "./IMarket.sol";

interface IRewardManager {
  function collect(IMarket market, uint256 amount) external;
  function claim(IMarket market) external;
}
