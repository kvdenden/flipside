// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IResolver } from "../../src/interfaces/IResolver.sol";
import { IMarket } from "../../src/interfaces/IMarket.sol";
import { Outcome } from "../../src/Outcome.sol";

contract MockResolver is IResolver {
  struct Query {
    bool resolved;
    Outcome outcome;
    address resolver;
  }

  mapping(IMarket => Query) public queries;

  function assertOutcome(IMarket market, Outcome outcome_) external override returns (bytes32 assertionId) {
    assertionId = keccak256(abi.encode(block.number, address(market), outcome_));

    Query storage query = queries[market];
    query.resolved = true;
    query.outcome = outcome_;
  }

  function resolved(IMarket market) external view returns (bool) {
    return queries[market].resolved;
  }

  function outcome(IMarket market) external view returns (Outcome) {
    return queries[market].outcome;
  }

  function resolver(IMarket market) public view override returns (address) {
    return queries[market].resolver;
  }
}
