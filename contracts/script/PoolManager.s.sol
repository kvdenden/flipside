// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Script, console } from "forge-std/Script.sol";
import { PoolManager } from "../src/PoolManager.sol";

contract Deploy is Script {
  PoolManager public poolManager;

  function setUp() public { }

  function run() public {
    uint256 privateKey = vm.envUint("PRIVATE_KEY");

    address factory = vm.envAddress("UNISWAP_V3FACTORY");
    address positionManager = vm.envAddress("UNISWAP_V3POSITION_MANAGER");

    vm.startBroadcast(privateKey);

    poolManager = new PoolManager(factory, positionManager);
    console.log("PoolManager deployed at:", address(poolManager));

    vm.stopBroadcast();
  }
}
