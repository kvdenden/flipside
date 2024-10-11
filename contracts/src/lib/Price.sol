// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

library Price {
  function calculate(uint256 amount, uint256 unitPrice) internal pure returns (uint256) {
    return Math.mulDiv(amount, unitPrice, 1e18);
  }
}
