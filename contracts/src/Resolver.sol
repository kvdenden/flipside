// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {OptimisticOracleV3Interface} from
    "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";

contract Resolver {
    enum Outcome {
        No,
        Yes,
        Invalid
    }

    OptimisticOracleV3Interface private immutable _oo;
    IERC20 public currency;

    struct Market {
        bool resolved;
        Outcome outcome;
        bytes description;
    }

    struct Assertion {
        bytes32 marketId;
        Outcome outcome;
    }

    mapping(bytes32 => Market) public markets;
    mapping(bytes32 => Assertion) public assertions;

    constructor(address oo_, address currency_) {
        _oo = OptimisticOracleV3Interface(oo_);
        currency = IERC20(currency_);
    }

    // initialize market
    function initializeMarket(bytes memory description) public returns (bytes32 marketId) {
        marketId = keccak256(abi.encode(block.number, description));

        Market storage market = markets[marketId];
        market.description = description;
    }

    // assert market outcome
    function assertOutcome(bytes32 marketId, Outcome outcome) public returns (bytes32 assertionId) {
        require(!markets[marketId].resolved, "Market resolved");

        bytes memory claim = _claim(marketId, outcome);
        address asserter = msg.sender;
        uint256 bond = _oo.getMinimumBond(address(currency));

        assertionId = _assertTruth(claim, asserter, bond);
        assertions[assertionId] = Assertion(marketId, outcome);
    }

    function assertionResolvedCallback(bytes32 assertionId, bool assertedTruthfully) external {
        require(msg.sender == address(_oo), "Not authorized");

        if (assertedTruthfully) {
            bytes32 marketId = assertions[assertionId].marketId;
            markets[marketId].resolved = true;
            markets[marketId].outcome = assertions[assertionId].outcome;
        }

        delete assertions[assertionId];
    }

    function assertionDisputedCallback(bytes32 assertionId) external {}

    function _assertTruth(bytes memory claim, address asserter, uint256 bond) private returns (bytes32 assertionId) {
        assertionId = _oo.assertTruth(
            claim, asserter, address(this), address(0), 7200, currency, bond, _oo.defaultIdentifier(), bytes32(0)
        );
    }

    function _claim(bytes32 marketId, Outcome outcome) private view returns (bytes memory) {
        return abi.encodePacked(
            "Assertion timestamp: ",
            Strings.toString(block.timestamp),
            "\n",
            "Market description: ",
            markets[marketId].description,
            "\n",
            "Market outcome: ",
            _toString(outcome)
        );
    }

    function _toString(Outcome outcome) private pure returns (string memory) {
        if (outcome == Outcome.No) return "No";
        else if (outcome == Outcome.Yes) return "Yes";
        else return "Invalid";
    }
}
