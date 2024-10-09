// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Test, console } from "forge-std/Test.sol";

import { MockERC20 } from "./mocks/MockERC20.sol";

import { Resolver } from "../src/Resolver.sol";
import { PoolManager } from "../src/PoolManager.sol";

import { Market } from "../src/Market.sol";

contract MarketTest is Test {
  MockERC20 collateralToken;

  PoolManager poolManager;

  Market market;

  function setUp() public {
    address usdc = vm.envAddress("USDC");
    address oo = vm.envAddress("UMA_OOV3");
    address factory = vm.envAddress("UNISWAP_V3FACTORY");
    address positionManager = vm.envAddress("UNISWAP_V3POSITION_MANAGER");

    collateralToken = new MockERC20();

    Resolver resolver = new Resolver(oo, usdc);
    Market.MarketParams memory params =
      Market.MarketParams("Flipside", "FLIP", "What does the fox say?", "", address(collateralToken), address(resolver));
    market = new Market(params);

    poolManager = new PoolManager(factory, positionManager);
  }

  function test_createPool() public {
    collateralToken.mint(address(this), 1000);
    collateralToken.approve(address(poolManager), 1000);

    address pool = poolManager.createPool(market, 1000);

    assertNotEq(
      poolManager.factory().getPool(address(market.longToken()), address(market.shortToken()), poolManager.FEE()),
      address(0)
    );

    assertEq(market.longToken().balanceOf(pool), 1000);
    assertEq(market.shortToken().balanceOf(pool), 1000);
  }
}
