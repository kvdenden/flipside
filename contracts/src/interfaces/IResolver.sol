// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { Outcome } from "../Outcome.sol";

interface IResolver {
  function currency() external view returns (IERC20);
  function bond() external view returns (uint256);

  function assertOutcome(address market, Outcome outcome_) external returns (bytes32 assertionId);

  function resolved(address market) external view returns (bool);
  function outcome(address market) external view returns (Outcome);
  function resolver(address market) external view returns (address);
}
