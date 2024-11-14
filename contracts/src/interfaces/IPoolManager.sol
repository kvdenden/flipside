// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IMarket } from "./IMarket.sol";

interface IPoolManager {
  function createPool(IMarket market, uint256 initialLiquidity) external returns (address pool);
  function getPool(IMarket market) external view returns (address pool);
}
