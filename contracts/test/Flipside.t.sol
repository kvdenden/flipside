// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Test, console } from "forge-std/Test.sol";

import { MockERC20 } from "./mocks/MockERC20.sol";

import { Price } from "../src/lib/Price.sol";
import { Market } from "../src/Market.sol";

import { Resolver } from "../src/Resolver.sol";
import { RewardManager } from "../src/RewardManager.sol";
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
    RewardManager rewardManager = new RewardManager(address(this), 5_000);
    PoolManager poolManager = new PoolManager(factory, positionManager);
    MarketFactory marketFactory = new MarketFactory(address(resolver), address(rewardManager), address(poolManager));

    flipside = new Flipside(address(marketFactory), swapRouter);
    collateralToken.approve(address(flipside), type(uint256).max);
  }

  function test_createMarket() public {
    uint256 initialLiquidity = 10 * 1e18;
    Market market = _createMarket(initialLiquidity);

    assertEq(market.totalVolume(), initialLiquidity);
    assertEq(
      collateralToken.balanceOf(address(market)), market.price(initialLiquidity) - market.marketReward(initialLiquidity)
    );
  }

  function test_mintPair() public {
    uint256 initialLiquidity = 10 * 1e18;
    Market market = _createMarket(initialLiquidity);

    uint256 amount = 1e18;
    collateralToken.mint(address(this), market.price(amount));

    flipside.mintPair(market, address(this), amount);

    assertEq(market.totalVolume(), initialLiquidity + amount);
    assertEq(
      collateralToken.balanceOf(address(market)),
      market.price(initialLiquidity + amount) - market.marketReward(initialLiquidity + amount)
    );

    assertEq(market.longToken().balanceOf(address(this)), amount);
    assertEq(market.shortToken().balanceOf(address(this)), amount);
  }

  function test_mintOutcome() public {
    uint256 initialLiquidity = 10 * 1e18;
    Market market = _createMarket(initialLiquidity);

    uint256 amount = 1e18;
    collateralToken.mint(address(this), market.price(amount));

    flipside.mintOutcome(market, address(this), amount, 0, true);

    assertEq(market.totalVolume(), initialLiquidity + amount);
    assertEq(
      collateralToken.balanceOf(address(market)),
      market.price(initialLiquidity + amount) - market.marketReward(initialLiquidity + amount)
    );

    assertGt(market.longToken().balanceOf(address(this)), amount);
    assertEq(market.shortToken().balanceOf(address(this)), 0);
  }

  function _createMarket(uint256 initialLiquidity) internal returns (Market) {
    uint256 unitPrice = 1e6;

    collateralToken.mint(address(this), Price.calculate(initialLiquidity, unitPrice));

    MarketFactory.Params memory params = MarketFactory.Params(
      address(this),
      "Flipside",
      "FLIP",
      "What does the fox say?",
      "",
      block.timestamp + 1 days,
      address(collateralToken),
      unitPrice,
      initialLiquidity
    );
    return flipside.createMarket(params);
  }
}
