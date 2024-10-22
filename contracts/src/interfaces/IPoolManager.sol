// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Market } from "../Market.sol";

interface IPoolManager {
  function createPool(Market market, uint256 initialLiquidity) external returns (address pool);
  function getPool(Market market) external view returns (address pool);
}
