// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Test, console } from "forge-std/Test.sol";

import { TickMath } from "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import { IUniswapV3Factory } from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import { INonfungiblePositionManager } from "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

import { MockERC20 } from "./mocks/MockERC20.sol";

import { Resolver } from "../src/Resolver.sol";
import { RewardManager } from "../src/RewardManager.sol";
import { PoolManager } from "../src/PoolManager.sol";

import { Market } from "../src/Market.sol";

contract MarketTest is Test {
  IUniswapV3Factory factory;
  INonfungiblePositionManager positionManager;

  MockERC20 collateralToken;

  address treasury;
  Resolver resolver;
  RewardManager rewardManager;
  Market market;

  function setUp() public {
    address usdc = vm.envAddress("USDC");
    address oo = vm.envAddress("UMA_OOV3");

    factory = IUniswapV3Factory(vm.envAddress("UNISWAP_V3FACTORY"));
    positionManager = INonfungiblePositionManager(vm.envAddress("UNISWAP_V3POSITION_MANAGER"));

    collateralToken = new MockERC20();

    treasury = vm.addr(0x1111);
    resolver = new Resolver(oo, usdc);
    rewardManager = new RewardManager(treasury, 7500);

    Market.MarketParams memory params = Market.MarketParams(
      address(this),
      "Flipside",
      "FLIP",
      "What does the fox say?",
      "",
      address(collateralToken),
      1e6,
      address(resolver),
      address(rewardManager)
    );
    market = new Market(params);
  }

  function test_mint() public {
    collateralToken.mint(address(this), 100 * 1e6);
    collateralToken.approve(address(market), 100 * 1e6);
    market.mint(address(this), 100 * 1e18);

    assertEq(market.totalVolume(), 100 * 1e18);
    assertEq(collateralToken.balanceOf(address(market)), 99 * 1e6); // 99%
    assertEq(collateralToken.balanceOf(treasury), 250000); // 0.25%
    assertEq(collateralToken.balanceOf(address(rewardManager)), 750000); // 0.75%

    assertEq(market.longToken().balanceOf(address(this)), 100 * 1e18);
    assertEq(market.shortToken().balanceOf(address(this)), 100 * 1e18);
  }
}
