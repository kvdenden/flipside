// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {OptimisticOracleV3Interface} from
    "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";

import {Outcome} from "./Outcome.sol";
import {Outcomes} from "./lib/Outcomes.sol";

contract Resolver {
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

    constructor(address oo_, address currency_) {
        _oo = OptimisticOracleV3Interface(oo_);
        currency = IERC20(currency_);
    }

    function resolved(bytes32 queryId) public view returns (bool) {
        return queries[queryId].resolved;
    }

    function outcome(bytes32 queryId) public view returns (Outcome) {
        return queries[queryId].outcome;
    }

    function initializeQuery(string memory description) public returns (bytes32 queryId) {
        queryId = keccak256(abi.encode(block.number, description)); // TODO: check if queryId is unique

        Query storage query = queries[queryId];
        query.description = description;
    }

    function assertOutcome(bytes32 queryId, Outcome outcome_) public returns (bytes32 assertionId) {
        require(!queries[queryId].resolved, "Market resolved");

        bytes memory claim = _claim(queryId, outcome_);
        address asserter = msg.sender;
        uint256 bond = _oo.getMinimumBond(address(currency));

        assertionId = _assertTruth(claim, asserter, bond);
        assertions[assertionId] = Assertion(queryId, outcome_);
    }

    function assertionResolvedCallback(bytes32 assertionId, bool assertedTruthfully) external {
        require(msg.sender == address(_oo), "Not authorized");

        if (assertedTruthfully) {
            bytes32 queryId = assertions[assertionId].queryId;
            queries[queryId].resolved = true;
            queries[queryId].outcome = assertions[assertionId].outcome;
        }

        delete assertions[assertionId];
    }

    function assertionDisputedCallback(bytes32 assertionId) external {}

    function _assertTruth(bytes memory claim, address asserter, uint256 bond) private returns (bytes32 assertionId) {
        assertionId = _oo.assertTruth(
            claim, asserter, address(this), address(0), 7200, currency, bond, _oo.defaultIdentifier(), bytes32(0)
        );
    }

    function _claim(bytes32 queryId, Outcome outcome_) private view returns (bytes memory) {
        return abi.encodePacked(
            "Assertion timestamp: ",
            Strings.toString(block.timestamp),
            "\n",
            "Query description: ",
            queries[queryId].description,
            "\n",
            "Outcome: ",
            Outcomes.toString(outcome_)
        );
    }
}
