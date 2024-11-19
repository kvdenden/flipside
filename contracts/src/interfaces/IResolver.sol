// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Outcome } from "../Outcome.sol";

interface IResolver {
  function assertOutcome(address market, Outcome outcome_) external returns (bytes32 assertionId);

  function resolved(address market) external view returns (bool);
  function outcome(address market) external view returns (Outcome);
  function resolver(address market) external view returns (address);
}
