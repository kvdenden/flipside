// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {TickMath} from "@uniswap/v3-core/contracts/libraries/TickMath.sol";

import {INonfungiblePositionManager} from "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

import {Market} from "./Market.sol";

contract PoolManager {
    uint24 public constant FEE = 10_000;

    IUniswapV3Factory public immutable factory;
    INonfungiblePositionManager public immutable positionManager;

    mapping(Market => uint256 tokenId) private _liquidity;

    constructor(address factory_, address positionManager_) {
        factory = IUniswapV3Factory(factory_);
        positionManager = INonfungiblePositionManager(positionManager_);
    }

    function createPool(Market market, uint256 initialLiquidity) external returns (address pool) {
        (address tokenA, address tokenB) = _tokens(market);

        pool = factory.createPool(tokenA, tokenB, FEE);
        _liquidity[market] = _mintLiquidity(market, initialLiquidity);
    }

    function getPool(Market market) external view returns (address pool) {
        (address tokenA, address tokenB) = _tokens(market);

        pool = factory.getPool(tokenA, tokenB, FEE);
    }

    function _mintLiquidity(Market market, uint256 amount) internal returns (uint256 tokenId) {
        market.collateralToken().transferFrom(msg.sender, address(this), amount);
        market.collateralToken().approve(address(market), amount);

        market.mint(address(this), amount);

        market.longToken().approve(address(positionManager), amount);
        market.shortToken().approve(address(positionManager), amount);

        INonfungiblePositionManager.MintParams memory params = INonfungiblePositionManager.MintParams({
            token0: address(market.longToken()),
            token1: address(market.shortToken()),
            fee: FEE,
            tickLower: TickMath.MIN_TICK,
            tickUpper: TickMath.MAX_TICK,
            amount0Desired: amount,
            amount1Desired: amount,
            amount0Min: 0,
            amount1Min: 0,
            recipient: address(this),
            deadline: block.timestamp
        });

        (tokenId,,,) = positionManager.mint(params);
    }

    function _tokens(Market market) internal view returns (address tokenA, address tokenB) {
        tokenA = address(market.longToken());
        tokenB = address(market.shortToken());
    }
}
