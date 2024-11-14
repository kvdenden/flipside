// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Outcome } from "../Outcome.sol";
import { IMarket } from "./IMarket.sol";

interface IResolver {
  function assertOutcome(IMarket market, Outcome outcome_) external returns (bytes32 assertionId);

  function resolved(IMarket market) external view returns (bool);
  function outcome(IMarket market) external view returns (Outcome);
  function resolver(IMarket market) external view returns (address);
}
