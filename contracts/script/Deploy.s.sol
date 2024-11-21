// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Script, console } from "forge-std/Script.sol";
import { Resolver } from "../src/Resolver.sol";
import { PoolManager } from "../src/PoolManager.sol";
import { RewardManager } from "../src/RewardManager.sol";
import { MarketFactory } from "../src/MarketFactory.sol";
import { Flipside } from "../src/Flipside.sol";

contract Deploy is Script {
  Resolver public resolver;
  PoolManager public poolManager;
  RewardManager public rewardManager;
  MarketFactory public marketFactory;
  Flipside public flipside;

  function setUp() public { }

  function run() public {
    address oo = vm.envAddress("UMA_OOV3");
    address usdc = vm.envAddress("USDC");

    address factory = vm.envAddress("UNISWAP_V3FACTORY");
    address positionManager = vm.envAddress("UNISWAP_V3POSITION_MANAGER");
    address swapRouter = vm.envAddress("UNISWAP_SWAPROUTER");

    address treasury = vm.envAddress("TREASURY_ADDRESS");

    vm.startBroadcast();

    resolver = new Resolver(oo, usdc, 250 * 1e6);
    console.log("Resolver deployed at:", address(resolver));

    poolManager = new PoolManager(factory, positionManager);
    console.log("PoolManager deployed at:", address(poolManager));

    rewardManager = new RewardManager(treasury, 5_000);
    console.log("RewardManager deployed at:", address(rewardManager));

    marketFactory = new MarketFactory(address(resolver), address(rewardManager), address(poolManager));
    console.log("MarketFactory deployed at:", address(marketFactory));

    flipside = new Flipside(address(marketFactory), swapRouter);
    console.log("Flipside deployed at:", address(flipside));

    vm.stopBroadcast();
  }
}
