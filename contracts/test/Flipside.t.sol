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
  address treasury;
  MockERC20 collateralToken;

  Flipside flipside;

  function setUp() public {
    address usdc = vm.envAddress("USDC");
    address oo = vm.envAddress("UMA_OOV3");
    address factory = vm.envAddress("UNISWAP_V3FACTORY");
    address positionManager = vm.envAddress("UNISWAP_V3POSITION_MANAGER");
    address swapRouter = vm.envAddress("UNISWAP_SWAPROUTER");

    treasury = vm.addr(0x42);
    collateralToken = new MockERC20();

    Resolver resolver = new Resolver(oo, usdc, 250 * 1e6);
    RewardManager rewardManager = new RewardManager(treasury, 5_000);
    PoolManager poolManager = new PoolManager(factory, positionManager);
    MarketFactory marketFactory = new MarketFactory(address(resolver), address(rewardManager), address(poolManager));

    flipside = new Flipside(address(marketFactory), swapRouter);
    collateralToken.approve(address(flipside), type(uint256).max);
  }

  function test_createMarket() public {
    uint256 initialLiquidity = 10 * 1e18;
    Market market = _createMarket(initialLiquidity);

    assertEq(market.totalVolume(), initialLiquidity);
    assertEq(collateralToken.balanceOf(address(market)), market.redemptionPrice(initialLiquidity));
  }

  function test_mintPair() public {
    uint256 initialLiquidity = 10 * 1e18;
    Market market = _createMarket(initialLiquidity);

    uint256 amount = 1e18;
    collateralToken.mint(address(this), market.price(amount));

    uint256 initialMarketCollateral = collateralToken.balanceOf(address(market));
    flipside.mintPair(market, address(this), amount);

    assertEq(market.totalVolume(), initialLiquidity + amount);
    assertEq(collateralToken.balanceOf(address(market)), initialMarketCollateral + market.redemptionPrice(amount));

    assertEq(market.longToken().balanceOf(address(this)), amount);
    assertEq(market.shortToken().balanceOf(address(this)), amount);
  }

  function test_mintOutcome() public {
    uint256 initialLiquidity = 10 * 1e18;
    Market market = _createMarket(initialLiquidity);

    uint256 amount = 1e18;
    collateralToken.mint(address(this), market.price(amount));

    uint256 initialMarketCollateral = collateralToken.balanceOf(address(market));
    flipside.mintOutcome(market, address(this), amount, 0, true);

    assertEq(market.totalVolume(), initialLiquidity + amount);
    assertEq(collateralToken.balanceOf(address(market)), initialMarketCollateral + market.redemptionPrice(amount));

    assertGt(market.longToken().balanceOf(address(this)), amount);
    assertEq(market.shortToken().balanceOf(address(this)), 0);
  }

  function test_redeemOutcome() public {
    uint256 initialLiquidity = 10 * 1e18;
    Market market = _createMarket(initialLiquidity);

    uint256 amount = 1e18;
    collateralToken.mint(address(this), market.price(amount));

    flipside.mintOutcome(market, address(this), amount, 0, true);

    uint256 longAmount = market.longToken().balanceOf(address(this));

    uint256 redeemAmount = 0.99 * 1e18; // TODO: estimate optimal amount to redeem

    market.longToken().approve(address(flipside), longAmount);

    uint256 initialMarketCollateral = collateralToken.balanceOf(address(market));
    flipside.redeemOutcome(market, address(this), redeemAmount, longAmount - redeemAmount, true);

    assertEq(collateralToken.balanceOf(address(market)), initialMarketCollateral - market.redemptionPrice(redeemAmount));
    assertEq(collateralToken.balanceOf(address(this)), market.redemptionPrice(redeemAmount));

    // remaining long tokens refunded
    assertGt(market.longToken().balanceOf(address(this)), 0);
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
