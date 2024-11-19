// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Script, console } from "forge-std/Script.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import { Resolver } from "../src/Resolver.sol";
import { Outcome } from "../src/Outcome.sol";

import {Outcomes} from "../src/lib/Outcomes.sol";


contract AssertOutcome is Script {
  using Strings for string;
  using Outcomes for Outcome;

  function setUp() public { }

  function run() public {
    uint256 privateKey = vm.envUint("PRIVATE_KEY");

    address resolver = vm.envAddress("RESOLVER_CONTRACT_ADDRESS");

    address market = vm.promptAddress("Enter market address");
    Outcome outcome = _promptOutcome();
    console.log("Asserting outcome for market %s with outcome %s", market, outcome.toString());

    vm.startBroadcast(privateKey);
    
    Resolver(resolver).assertOutcome(market, outcome);
    
    vm.stopBroadcast();
  }

  function _promptOutcome() internal returns (Outcome) {
      string memory outcome = vm.prompt("Enter outcome (Y/N/?): ");
      
      if (outcome.equal("Y") || outcome.equal("y")) {
        return Outcome.Yes;
      }
      
      if (outcome.equal("N") || outcome.equal("n")) {
        return Outcome.No;
      }
      
      return Outcome.Invalid;
  }
}