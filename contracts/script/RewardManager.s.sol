// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Script, console } from "forge-std/Script.sol";
import { RewardManager } from "../src/RewardManager.sol";

contract Deploy is Script {
  RewardManager public rewardManager;

  function setUp() public { }

  function run() public {
    uint256 privateKey = vm.envUint("PRIVATE_KEY");

    address treasury = vm.envAddress("TREASURY_ADDRESS");

    vm.startBroadcast(privateKey);

    rewardManager = new RewardManager(treasury, 5_000);
    console.log("RewardManager deployed at:", address(rewardManager));

    vm.stopBroadcast();
  }
}
