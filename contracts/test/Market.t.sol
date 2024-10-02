// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Test, console } from "forge-std/Test.sol";

import { TickMath } from "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import { IUniswapV3Factory } from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import { INonfungiblePositionManager } from "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

import { MockERC20 } from "./mocks/MockERC20.sol";

import { Resolver } from "../src/Resolver.sol";
import { PoolManager } from "../src/PoolManager.sol";

import { Market } from "../src/Market.sol";

contract MarketTest is Test {
  IUniswapV3Factory factory;
  INonfungiblePositionManager positionManager;

  MockERC20 collateralToken;

  Resolver resolver;
  Market market;

  function setUp() public {
    address usdc = vm.envAddress("USDC");
    address oo = vm.envAddress("UMA_OOV3");

    factory = IUniswapV3Factory(vm.envAddress("UNISWAP_V3FACTORY"));
    positionManager = INonfungiblePositionManager(vm.envAddress("UNISWAP_V3POSITION_MANAGER"));

    collateralToken = new MockERC20();
    resolver = new Resolver(oo, usdc);

    Market.MarketParams memory params =
      Market.MarketParams("Flipside", "FLIP", "What does the fox say?", address(collateralToken), address(resolver));
    market = new Market(params);
  }

  function test_mint() public {
    collateralToken.mint(address(this), 1000);
    collateralToken.approve(address(market), 1000);
    market.mint(address(this), 1000);
  }
}
