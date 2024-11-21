// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Test, console } from "forge-std/Test.sol";

import { MockERC20 } from "./mocks/MockERC20.sol";

import { Resolver } from "../src/Resolver.sol";
import { RewardManager } from "../src/RewardManager.sol";
import { PoolManager } from "../src/PoolManager.sol";

import { Market } from "../src/Market.sol";

contract PoolManagerTest is Test {
  MockERC20 collateralToken;

  PoolManager poolManager;

  Market market;

  function setUp() public {
    address usdc = vm.envAddress("USDC");
    address oo = vm.envAddress("UMA_OOV3");
    address factory = vm.envAddress("UNISWAP_V3FACTORY");
    address positionManager = vm.envAddress("UNISWAP_V3POSITION_MANAGER");

    collateralToken = new MockERC20();

    Resolver resolver = new Resolver(oo, usdc, 250 * 1e6);
    RewardManager rewardManager = new RewardManager(address(this), 5_000);
    Market.MarketParams memory params = Market.MarketParams(
      address(this),
      "Flipside",
      "FLIP",
      "What does the fox say?",
      "",
      block.timestamp + 1 days,
      address(collateralToken),
      1e6,
      address(resolver),
      address(rewardManager)
    );
    market = new Market(params);

    poolManager = new PoolManager(factory, positionManager);
  }

  function test_createPool() public {
    uint256 initialLiquidity = 10 * 1e18;
    uint256 collateralAmount = market.price(initialLiquidity);

    collateralToken.mint(address(this), collateralAmount);
    collateralToken.approve(address(poolManager), collateralAmount);

    address pool = poolManager.createPool(market, initialLiquidity);

    assertNotEq(
      poolManager.factory().getPool(address(market.longToken()), address(market.shortToken()), poolManager.FEE()),
      address(0)
    );

    assertEq(market.longToken().balanceOf(pool), initialLiquidity);
    assertEq(market.shortToken().balanceOf(pool), initialLiquidity);
  }
}
