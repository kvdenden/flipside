// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { Market } from "./Market.sol";
import { PoolManager } from "./PoolManager.sol";

contract MarketFactory {
  address private immutable _resolver;
  PoolManager private immutable _poolManager;

  event MarketCreated(
    address indexed market, address indexed creator, address indexed collateralToken, uint256 initialLiquidity
  );

  constructor(address resolver_, address poolManager_) {
    _resolver = resolver_;

    _poolManager = PoolManager(poolManager_);
  }

  function createMarket(
    string memory pairName,
    string memory pairSymbol,
    string memory description,
    address collateralToken,
    uint256 initialLiquidity
  ) external returns (address) {
    Market.MarketParams memory params =
      Market.MarketParams(pairName, pairSymbol, description, collateralToken, _resolver);
    Market market = new Market(params);

    market.collateralToken().transferFrom(msg.sender, address(this), initialLiquidity);
    market.collateralToken().approve(address(_poolManager), initialLiquidity);

    _poolManager.createPool(market, initialLiquidity);

    emit MarketCreated(address(market), msg.sender, collateralToken, initialLiquidity);

    return address(market);
  }
}
