// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Outcome } from "../Outcome.sol";

interface IResolver {
  function initializeQuery(string memory description_) external returns (bytes32 queryId);
  function assertOutcome(bytes32 queryId, Outcome outcome_) external returns (bytes32 assertionId);

  function resolved(bytes32 queryId) external view returns (bool);
  function outcome(bytes32 queryId) external view returns (Outcome);
  function description(bytes32 queryId) external view returns (string memory);
}
