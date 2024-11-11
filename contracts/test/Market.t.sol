// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Test, console } from "forge-std/Test.sol";

import { TickMath } from "@uniswap/v3-core/contracts/libraries/TickMath.sol";
import { IUniswapV3Factory } from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import { INonfungiblePositionManager } from "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";

import { MockERC20 } from "./mocks/MockERC20.sol";
import { MockResolver } from "./mocks/MockResolver.sol";

import { RewardManager } from "../src/RewardManager.sol";
import { PoolManager } from "../src/PoolManager.sol";

import { Outcome } from "../src/Outcome.sol";
import { Market } from "../src/Market.sol";

contract MarketTest is Test {
  IUniswapV3Factory factory;
  INonfungiblePositionManager positionManager;

  MockERC20 collateralToken;

  address treasury;
  MockResolver resolver;
  RewardManager rewardManager;
  Market market;

  function setUp() public {
    factory = IUniswapV3Factory(vm.envAddress("UNISWAP_V3FACTORY"));
    positionManager = INonfungiblePositionManager(vm.envAddress("UNISWAP_V3POSITION_MANAGER"));

    collateralToken = new MockERC20();

    treasury = vm.addr(0x1111);
    resolver = new MockResolver();
    rewardManager = new RewardManager(treasury, 7500);

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

  function test_redeem() public {
    collateralToken.mint(address(this), 100 * 1e6);
    collateralToken.approve(address(market), 100 * 1e6);
    market.mint(address(this), 100 * 1e18);

    market.longToken().approve(address(market), 100 * 1e18);
    market.shortToken().approve(address(market), 100 * 1e18);

    market.redeem(address(this), 100 * 1e18);

    assertEq(collateralToken.balanceOf(address(this)), 99 * 1e6); // 99%
    assertEq(market.longToken().balanceOf(address(this)), 0);
    assertEq(market.shortToken().balanceOf(address(this)), 0);
  }

  function test_settle() public {
    collateralToken.mint(address(this), 100 * 1e6);
    collateralToken.approve(address(market), 100 * 1e6);
    market.mint(address(this), 100 * 1e18);

    market.resolve(Outcome.Yes);

    market.longToken().approve(address(market), 100 * 1e18);
    market.shortToken().approve(address(market), 100 * 1e18);
    market.settle(address(this), 100 * 1e18, 100 * 1e18);
    assertEq(collateralToken.balanceOf(address(this)), 99 * 1e6); // 99%
    assertEq(market.longToken().balanceOf(address(this)), 0);
    assertEq(market.shortToken().balanceOf(address(this)), 0);
  }

  function test_settleYes() public {
    collateralToken.mint(address(this), 100 * 1e6);
    collateralToken.approve(address(market), 100 * 1e6);
    market.mint(address(this), 100 * 1e18);

    market.resolve(Outcome.Yes);

    market.shortToken().approve(address(market), 100 * 1e18);
    market.settle(address(this), 0, 100 * 1e18);
    assertEq(collateralToken.balanceOf(address(this)), 0);

    market.longToken().approve(address(market), 100 * 1e18);
    market.settle(address(this), 100 * 1e18, 0);
    assertEq(collateralToken.balanceOf(address(this)), 99 * 1e6); // 99%
  }

  function test_settleNo() public {
    collateralToken.mint(address(this), 100 * 1e6);
    collateralToken.approve(address(market), 100 * 1e6);
    market.mint(address(this), 100 * 1e18);

    market.resolve(Outcome.No);

    market.longToken().approve(address(market), 100 * 1e18);
    market.settle(address(this), 100 * 1e18, 0);
    assertEq(collateralToken.balanceOf(address(this)), 0);

    market.shortToken().approve(address(market), 100 * 1e18);
    market.settle(address(this), 0, 100 * 1e18);
    assertEq(collateralToken.balanceOf(address(this)), 99 * 1e6); // 99%
  }

  function test_settleInvalid() public {
    collateralToken.mint(address(this), 100 * 1e6);
    collateralToken.approve(address(market), 100 * 1e6);
    market.mint(address(this), 100 * 1e18);

    market.resolve(Outcome.No);

    market.longToken().approve(address(market), 100 * 1e18);
    market.shortToken().approve(address(market), 100 * 1e18);
    market.settle(address(this), 100 * 1e18, 100 * 1e18);
    assertEq(collateralToken.balanceOf(address(this)), 99 * 1e6); // 99%
  }
}
