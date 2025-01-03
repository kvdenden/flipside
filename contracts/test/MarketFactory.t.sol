// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Test, console } from "forge-std/Test.sol";

import { MockERC20 } from "./mocks/MockERC20.sol";

import { Resolver } from "../src/Resolver.sol";
import { RewardManager } from "../src/RewardManager.sol";
import { PoolManager } from "../src/PoolManager.sol";

import { MarketFactory } from "../src/MarketFactory.sol";

contract MarketFactoryTest is Test {
  MockERC20 collateralToken;

  Resolver resolver;
  RewardManager rewardManager;
  PoolManager poolManager;
  MarketFactory marketFactory;

  function setUp() public {
    address usdc = vm.envAddress("USDC");
    address oo = vm.envAddress("UMA_OOV3");
    address factory = vm.envAddress("UNISWAP_V3FACTORY");
    address positionManager = vm.envAddress("UNISWAP_V3POSITION_MANAGER");

    collateralToken = new MockERC20();

    resolver = new Resolver(oo, usdc, 250 * 1e6);
    rewardManager = new RewardManager(address(this), 5_000);
    poolManager = new PoolManager(factory, positionManager);
    marketFactory = new MarketFactory(address(resolver), address(rewardManager), address(poolManager));
  }

  function test_createMarket() public {
    uint256 initialLiquidity = 10 * 1e18;

    collateralToken.mint(address(this), initialLiquidity);
    collateralToken.approve(address(marketFactory), initialLiquidity);

    MarketFactory.Params memory params = MarketFactory.Params(
      address(this),
      "Flipside",
      "FLIP",
      "What does the fox say?",
      "",
      block.timestamp + 1 days,
      address(collateralToken),
      1e18,
      initialLiquidity
    );
    marketFactory.createMarket(params);
  }
}
