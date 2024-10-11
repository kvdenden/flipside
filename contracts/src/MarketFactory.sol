// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { Market } from "./Market.sol";
import { PoolManager } from "./PoolManager.sol";

contract MarketFactory {
  struct Params {
    address creator;
    string pairName;
    string pairSymbol;
    string title;
    string description;
    address collateralToken;
    uint256 unitPrice;
    uint256 initialLiquidity;
  }

  address private immutable _resolver;
  PoolManager private immutable _poolManager;

  event MarketCreated(
    address indexed market,
    address indexed creator,
    address indexed collateralToken,
    address pool,
    uint256 initialLiquidity
  );

  constructor(address resolver_, address poolManager_) {
    _resolver = resolver_;

    _poolManager = PoolManager(poolManager_);
  }

  function createMarket(Params memory params) external returns (Market) {
    Market.MarketParams memory marketParams = Market.MarketParams(
      params.pairName,
      params.pairSymbol,
      params.title,
      params.description,
      params.collateralToken,
      params.unitPrice,
      _resolver
    );
    Market market = new Market(marketParams);

    uint256 collateralAmount = market.price(params.initialLiquidity);
    market.collateralToken().transferFrom(msg.sender, address(this), collateralAmount);
    market.collateralToken().approve(address(_poolManager), collateralAmount);

    address pool = _poolManager.createPool(market, params.initialLiquidity);

    emit MarketCreated(address(market), params.creator, params.collateralToken, pool, params.initialLiquidity);

    return market;
  }
}
