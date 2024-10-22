// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

import { IUniswapV3Factory } from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import { IUniswapV3Pool } from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import { TickMath } from "@uniswap/v3-core/contracts/libraries/TickMath.sol";

import { INonfungiblePositionManager } from "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

import { IPoolManager } from "./interfaces/IPoolManager.sol";
import { Market } from "./Market.sol";

contract PoolManager is IPoolManager {
  uint24 public constant FEE = 10_000;

  IUniswapV3Factory public immutable factory;
  INonfungiblePositionManager public immutable positionManager;

  mapping(Market => uint256 tokenId) private _liquidity;

  constructor(address factory_, address positionManager_) {
    factory = IUniswapV3Factory(factory_);
    positionManager = INonfungiblePositionManager(positionManager_);
  }

  function createPool(Market market, uint256 initialLiquidity) external override returns (address pool) {
    (address token0, address token1) = _tokens(market);

    pool = positionManager.createAndInitializePoolIfNecessary(token0, token1, FEE, 2 ** 96);
    _liquidity[market] = _mintLiquidity(market, initialLiquidity);
  }

  function getPool(Market market) external view override returns (address pool) {
    pool = _pool(market);
  }

  function _mintLiquidity(Market market, uint256 amount) internal returns (uint256 tokenId) {
    uint256 collateralAmount = market.price(amount);

    market.collateralToken().transferFrom(msg.sender, address(this), collateralAmount);
    market.collateralToken().approve(address(market), collateralAmount);

    market.mint(address(this), amount);

    market.longToken().approve(address(positionManager), amount);
    market.shortToken().approve(address(positionManager), amount);

    (address token0, address token1) = _tokens(market);

    (int24 tickLower, int24 tickUpper) = _ticks(amount, factory.feeAmountTickSpacing(FEE));

    INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
      token0: token0,
      token1: token1,
      fee: FEE,
      tickLower: tickLower,
      tickUpper: tickUpper,
      amount0Desired: amount,
      amount1Desired: amount,
      amount0Min: 0,
      amount1Min: 0,
      recipient: address(this),
      deadline: block.timestamp
    });

    (tokenId,,,) = positionManager.mint(params);
  }

  function _pool(Market market) internal view returns (address pool) {
    (address tokenA, address tokenB) = _tokens(market);

    pool = factory.getPool(tokenA, tokenB, FEE);
  }

  function _tokens(Market market) internal view returns (address token0, address token1) {
    address longToken = address(market.longToken());
    address shortToken = address(market.shortToken());

    (token0, token1) = longToken < shortToken ? (longToken, shortToken) : (shortToken, longToken);
  }

  function _ticks(uint256 ratio, int24 tickSpacing) internal pure returns (int24 tickLower, int24 tickUpper) {
    uint160 sqrtPriceX96 = uint160(Math.sqrt(ratio) * 2 ** 96);

    int24 tick = TickMath.getTickAtSqrtRatio(sqrtPriceX96);

    tickUpper = tick % tickSpacing == 0 ? tick : tick + tickSpacing - tick % tickSpacing;
    tickLower = -tickUpper;
  }
}
