// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";

import {Market} from "./Market.sol";

contract PoolManager {
    uint24 public constant FEE = 10_000;

    IUniswapV3Factory public immutable factory;

    constructor(address factory_) {
        factory = IUniswapV3Factory(factory_);
    }

    function createPool(Market market) external returns (address pool) {
        (address tokenA, address tokenB) = _tokens(market);

        pool = factory.createPool(tokenA, tokenB, FEE);
    }

    function getPool(Market market) external view returns (address pool) {
        (address tokenA, address tokenB) = _tokens(market);

        pool = factory.getPool(tokenA, tokenB, FEE);
    }

    function _tokens(Market market) internal view returns (address tokenA, address tokenB) {
        tokenA = address(market.longToken());
        tokenB = address(market.shortToken());
    }
}
