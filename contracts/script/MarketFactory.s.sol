// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Script, console } from "forge-std/Script.sol";
import { MarketFactory } from "../src/MarketFactory.sol";

contract Deploy is Script {
  MarketFactory public marketFactory;

  function setUp() public { }

  function run() public {
    uint256 privateKey = vm.envUint("PRIVATE_KEY");

    address resolver = vm.envAddress("RESOLVER_CONTRACT_ADDRESS");
    address poolManager = vm.envAddress("POOL_MANAGER_CONTRACT_ADDRESS");

    vm.startBroadcast(privateKey);

    marketFactory = new MarketFactory(resolver, poolManager);
    console.log("MarketFactory deployed at:", address(marketFactory));

    vm.stopBroadcast();
  }
}
