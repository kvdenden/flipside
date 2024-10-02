// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Script, console } from "forge-std/Script.sol";
import { Market } from "../src/Market.sol";

contract Deploy is Script {
  Market public market;

  function setUp() public { }

  function run() public {
    uint256 privateKey = vm.envUint("PRIVATE_KEY");

    address usdc = vm.envAddress("USDC");
    address resolver = vm.envAddress("RESOLVER_CONTRACT_ADDRESS");

    string memory description = vm.prompt("Enter market description");

    vm.startBroadcast(privateKey);

    Market.MarketParams memory params = Market.MarketParams("Flipside", "FLIP", description, usdc, resolver);

    market = new Market(params);
    console.log("Market deployed at:", address(market));

    vm.stopBroadcast();
  }
}
