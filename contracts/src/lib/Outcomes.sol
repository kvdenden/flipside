// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Outcome} from "../Outcome.sol";

library Outcomes {
    function toString(Outcome outcome) internal pure returns (string memory) {
        if (outcome == Outcome.No) return "No";
        else if (outcome == Outcome.Yes) return "Yes";
        else return "Invalid";
    }
}
