// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Test, console } from "forge-std/Test.sol";

import { MockERC20 } from "./mocks/MockERC20.sol";

import { Market } from "../src/Market.sol";

import { Resolver } from "../src/Resolver.sol";
import { PoolManager } from "../src/PoolManager.sol";
import { MarketFactory } from "../src/MarketFactory.sol";

import { Flipside } from "../src/Flipside.sol";

contract FlipsideTest is Test {
  MockERC20 collateralToken;

  Flipside flipside;

  function setUp() public {
    address usdc = vm.envAddress("USDC");
    address oo = vm.envAddress("UMA_OOV3");
    address factory = vm.envAddress("UNISWAP_V3FACTORY");
    address positionManager = vm.envAddress("UNISWAP_V3POSITION_MANAGER");
    address swapRouter = vm.envAddress("UNISWAP_SWAPROUTER");

    collateralToken = new MockERC20();

    Resolver resolver = new Resolver(oo, usdc);
    PoolManager poolManager = new PoolManager(factory, positionManager);
    MarketFactory marketFactory = new MarketFactory(address(resolver), address(poolManager));

    flipside = new Flipside(address(marketFactory), swapRouter);
    collateralToken.approve(address(flipside), type(uint256).max);
  }

  function test_createMarket() public {
    uint256 initialLiquidity = 10 ** 6;
    Market market = _createMarket(initialLiquidity);

    assertEq(market.totalVolume(), initialLiquidity);
    assertEq(collateralToken.balanceOf(address(market)), initialLiquidity);
  }

  function test_mintPair() public {
    uint256 initialLiquidity = 10_000_000;
    Market market = _createMarket(initialLiquidity);

    uint256 amount = 1_000_000;
    collateralToken.mint(address(this), amount);

    flipside.mintPair(market, address(this), amount);

    assertEq(market.totalVolume(), initialLiquidity + amount);
    assertEq(collateralToken.balanceOf(address(market)), initialLiquidity + amount);

    assertEq(market.longToken().balanceOf(address(this)), amount);
    assertEq(market.shortToken().balanceOf(address(this)), amount);
  }

  function test_mintOutcome() public {
    uint256 initialLiquidity = 10_000_000;
    Market market = _createMarket(initialLiquidity);

    uint256 amount = 1_000_000;
    collateralToken.mint(address(this), amount);

    flipside.mintOutcome(market, address(this), amount, 0, true);
  }

  function _createMarket(uint256 initialLiquidity) internal returns (Market) {
    collateralToken.mint(address(this), initialLiquidity);

    MarketFactory.Params memory params = MarketFactory.Params(
      address(this), "Flipside", "FLIP", "What does the fox say?", "", address(collateralToken), initialLiquidity
    );
    return flipside.createMarket(params);
  }
}
