// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { OptimisticOracleV3Interface } from
  "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";

import { IResolver } from "./interfaces/IResolver.sol";
import { Outcome } from "./Outcome.sol";
import { Outcomes } from "./lib/Outcomes.sol";

contract Resolver is IResolver {
  struct Query {
    bool resolved;
    Outcome outcome;
    string description;
  }

  struct Assertion {
    bytes32 queryId;
    Outcome outcome;
  }

  OptimisticOracleV3Interface private immutable _oo;
  IERC20 public currency;

  mapping(bytes32 => Query) public queries;
  mapping(bytes32 => Assertion) public assertions;

  event QueryInitialized(bytes32 indexed queryId);
  event QueryAsserted(bytes32 indexed queryId, Outcome outcome);
  event QueryResolved(bytes32 indexed queryId, Outcome outcome);

  constructor(address oo_, address currency_) {
    _oo = OptimisticOracleV3Interface(oo_);
    currency = IERC20(currency_);
  }

  function initializeQuery(string memory description_) external override returns (bytes32 queryId) {
    queryId = keccak256(abi.encode(block.number, description_)); // TODO: check if queryId is unique

    Query storage query = queries[queryId];
    query.description = description_;

    emit QueryInitialized(queryId);
  }

  function assertOutcome(bytes32 queryId, Outcome outcome_) external override returns (bytes32 assertionId) {
    require(!queries[queryId].resolved, "Market resolved");

    bytes memory claim = _claim(queryId, outcome_);
    address asserter = msg.sender;
    uint256 bond = _oo.getMinimumBond(address(currency));

    assertionId = _assertTruth(claim, asserter, bond);
    assertions[assertionId] = Assertion(queryId, outcome_);

    emit QueryAsserted(queryId, outcome_);
  }

  function assertionResolvedCallback(bytes32 assertionId, bool assertedTruthfully) external {
    require(msg.sender == address(_oo), "Not authorized");

    if (assertedTruthfully) {
      bytes32 queryId = assertions[assertionId].queryId;
      queries[queryId].resolved = true;
      queries[queryId].outcome = assertions[assertionId].outcome;

      emit QueryResolved(queryId, queries[queryId].outcome);
    }

    delete assertions[assertionId];
  }

  function assertionDisputedCallback(bytes32 assertionId) external { }

  function resolved(bytes32 queryId) public view override returns (bool) {
    return queries[queryId].resolved;
  }

  function outcome(bytes32 queryId) public view override returns (Outcome) {
    return queries[queryId].outcome;
  }

  function description(bytes32 queryId) public view override returns (string memory) {
    return queries[queryId].description;
  }

  function _assertTruth(bytes memory claim, address asserter, uint256 bond) private returns (bytes32 assertionId) {
    assertionId = _oo.assertTruth(
      claim, asserter, address(this), address(0), 7200, currency, bond, _oo.defaultIdentifier(), bytes32(0)
    );
  }

  function _claim(bytes32 queryId, Outcome outcome_) private view returns (bytes memory) {
    return abi.encodePacked(
      "Query description: ",
      queries[queryId].description,
      "\n",
      "Asserted outcome: ",
      Outcomes.toString(outcome_),
      "\n",
      "Assertion timestamp: ",
      Strings.toString(block.timestamp)
    );
  }
}
