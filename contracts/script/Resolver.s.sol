// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Script, console } from "forge-std/Script.sol";
import { Resolver } from "../src/Resolver.sol";

contract Deploy is Script {
  Resolver public resolver;

  function setUp() public { }

  function run() public {
    uint256 privateKey = vm.envUint("PRIVATE_KEY");

    address oo = vm.envAddress("UMA_OOV3");

    address currency = vm.envAddress("BOND_CURRENCY");
    uint256 amount = vm.envUint("BOND_AMOUNT");

    vm.startBroadcast(privateKey);

    resolver = new Resolver(oo, currency, amount);
    console.log("Resolver deployed at:", address(resolver));

    vm.stopBroadcast();
  }
}
