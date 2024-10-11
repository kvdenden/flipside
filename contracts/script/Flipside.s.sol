// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Script, console } from "forge-std/Script.sol";
import { Flipside } from "../src/Flipside.sol";

contract Deploy is Script {
  Flipside public flipside;

  function setUp() public { }

  function run() public {
    uint256 privateKey = vm.envUint("PRIVATE_KEY");

    address marketFactory = vm.envAddress("MARKET_FACTORY_CONTRACT_ADDRESS");
    address swapRouter = vm.envAddress("UNISWAP_SWAPROUTER");

    vm.startBroadcast(privateKey);

    flipside = new Flipside(marketFactory, swapRouter);

    console.log("Flipside deployed at:", address(flipside));

    vm.stopBroadcast();
  }
}
