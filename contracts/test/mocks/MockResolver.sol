// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IResolver } from "../../src/interfaces/IResolver.sol";
import { Outcome } from "../../src/Outcome.sol";

contract MockResolver is IResolver {
  struct Query {
    bool resolved;
    Outcome outcome;
    string description;
  }

  mapping(bytes32 queryId => Query) public queries;

  function initializeQuery(string memory description_) external override returns (bytes32 queryId) {
    queryId = keccak256(abi.encode(block.number, description_));
    Query storage query = queries[queryId];
    query.description = description_;
  }

  function assertOutcome(bytes32 queryId, Outcome outcome_) external override returns (bytes32 assertionId) {
    assertionId = keccak256(abi.encode(block.number, queryId, outcome_));

    Query storage query = queries[queryId];
    query.resolved = true;
    query.outcome = outcome_;
  }

  function resolved(bytes32 queryId) external view returns (bool) {
    return queries[queryId].resolved;
  }

  function outcome(bytes32 queryId) external view returns (Outcome) {
    return queries[queryId].outcome;
  }

  function description(bytes32 queryId) external view returns (string memory) {
    return queries[queryId].description;
  }
}
