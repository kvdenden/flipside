// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Test, console } from "forge-std/Test.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { OptimisticOracleV3Interface } from
  "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";

import { Resolver } from "../src/Resolver.sol";

import { IMarket } from "../src/interfaces/IMarket.sol";
import { Outcome } from "../src/Outcome.sol";

import { MockMarket } from "./mocks/MockMarket.sol";

contract ResolverTest is Test {
  OptimisticOracleV3Interface oo;

  IMarket market;
  Resolver resolver;

  function setUp() public {
    address usdc = vm.envAddress("USDC");

    oo = OptimisticOracleV3Interface(vm.envAddress("UMA_OOV3"));

    resolver = new Resolver(address(oo), usdc, 250 * 1e6);
    market = new MockMarket(address(resolver));

    deal(usdc, address(this), 1000 * 1e6);
  }

  function test_assertOutcome() public {
    IERC20 currency = resolver.currency();
    uint256 bond = resolver.bond();

    currency.approve(address(resolver), bond);

    uint256 balance = currency.balanceOf(address(this));
    console.log("Balance: %d", balance);

    bytes32 assertionId = resolver.assertOutcome(address(market), Outcome.Yes);

    assertEq(balance - bond, currency.balanceOf(address(this)));
    assertFalse(market.resolved());

    vm.warp(block.timestamp + 7200);
    oo.settleAssertion(assertionId);

    assertEq(balance, currency.balanceOf(address(this)));

    assertTrue(market.resolved());
    assertEq(uint256(market.outcome()), uint256(Outcome.Yes));
  }
}
