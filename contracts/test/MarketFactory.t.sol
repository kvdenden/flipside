// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Test, console } from "forge-std/Test.sol";

import { MockERC20 } from "./mocks/MockERC20.sol";

import { Resolver } from "../src/Resolver.sol";
import { PoolManager } from "../src/PoolManager.sol";

import { MarketFactory } from "../src/MarketFactory.sol";

contract MarketFactoryTest is Test {
  MockERC20 collateralToken;

  Resolver resolver;
  PoolManager poolManager;
  MarketFactory marketFactory;

  function setUp() public {
    address usdc = vm.envAddress("USDC");
    address oo = vm.envAddress("UMA_OOV3");
    address factory = vm.envAddress("UNISWAP_V3FACTORY");
    address positionManager = vm.envAddress("UNISWAP_V3POSITION_MANAGER");

    collateralToken = new MockERC20();

    resolver = new Resolver(oo, usdc);
    poolManager = new PoolManager(factory, positionManager);
    marketFactory = new MarketFactory(address(resolver), address(poolManager));
  }

  function test_createMarket() public {
    collateralToken.mint(address(this), 1000);
    collateralToken.approve(address(marketFactory), 1000);

    MarketFactory.Params memory params = MarketFactory.Params(
      address(this), "Flipside", "FLIP", "What does the fox say?", "", address(collateralToken), 1000
    );
    marketFactory.createMarket(params);
  }
}
