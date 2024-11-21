// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { IResolver } from "../../src/interfaces/IResolver.sol";
import { Outcome } from "../../src/Outcome.sol";

contract MockResolver is IResolver {
  struct Query {
    bool resolved;
    Outcome outcome;
    address resolver;
  }

  mapping(address => Query) public queries;

  function currency() external pure override returns (IERC20) {
    return IERC20(address(0));
  }

  function bond() external pure override returns (uint256) {
    return 0;
  }

  function assertOutcome(address market, Outcome outcome_) external override returns (bytes32 assertionId) {
    assertionId = keccak256(abi.encode(block.number, address(market), outcome_));

    Query storage query = queries[market];
    query.resolved = true;
    query.outcome = outcome_;
  }

  function resolved(address market) external view returns (bool) {
    return queries[market].resolved;
  }

  function outcome(address market) external view returns (Outcome) {
    return queries[market].outcome;
  }

  function resolver(address market) public view override returns (address) {
    return queries[market].resolver;
  }
}
