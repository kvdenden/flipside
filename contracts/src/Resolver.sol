// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

import { OptimisticOracleV3Interface } from
  "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";

import { IResolver } from "./interfaces/IResolver.sol";
import { IMarket } from "./interfaces/IMarket.sol";
import { Outcome } from "./Outcome.sol";
import { Outcomes } from "./lib/Outcomes.sol";

contract Resolver is IResolver {
  struct Query {
    bool resolved;
    Outcome outcome;
    address resolver;
  }

  struct Assertion {
    address market;
    Outcome outcome;
    address asserter;
  }

  OptimisticOracleV3Interface private immutable _oo;
  uint256 private _bond;

  IERC20 public currency;

  mapping(address => Query) public queries;
  mapping(bytes32 => Assertion) public assertions;

  event MarketAsserted(address indexed market, Outcome outcome);
  event MarketResolved(address indexed market, Outcome outcome);

  constructor(address oo_, address currency_, uint256 bond_) {
    _oo = OptimisticOracleV3Interface(oo_);
    _bond = bond_;
    currency = IERC20(currency_);
  }

  function assertOutcome(address market, Outcome outcome_) external override returns (bytes32 assertionId) {
    require(!queries[market].resolved, "Market resolved");

    bytes memory claim = _claim(IMarket(market), outcome_);
    address asserter = msg.sender;
    uint256 bond_ = bond();

    currency.transferFrom(asserter, address(this), bond_);
    currency.approve(address(_oo), bond_);

    assertionId = _assertTruth(claim, asserter, bond_);
    assertions[assertionId] = Assertion(market, outcome_, asserter);

    emit MarketAsserted(market, outcome_);
  }

  function assertionResolvedCallback(bytes32 assertionId, bool assertedTruthfully) external {
    require(msg.sender == address(_oo), "Not authorized");

    if (assertedTruthfully) {
      Assertion memory assertion = assertions[assertionId];

      queries[assertion.market].resolved = true;
      queries[assertion.market].outcome = assertion.outcome;
      queries[assertion.market].resolver = assertion.asserter;

      emit MarketResolved(address(assertion.market), assertion.outcome);
    }

    delete assertions[assertionId];
  }

  function assertionDisputedCallback(bytes32 assertionId) external { }

  function bond() public view returns (uint256) {
    uint256 minimumBond = _oo.getMinimumBond(address(currency));

    return minimumBond > _bond ? minimumBond : _bond;
  }

  function resolved(address market) public view override returns (bool) {
    return queries[market].resolved;
  }

  function outcome(address market) public view override returns (Outcome) {
    return queries[market].outcome;
  }

  function resolver(address market) public view override returns (address) {
    return queries[market].resolver;
  }

  function _assertTruth(bytes memory claim, address asserter, uint256 bond_) private returns (bytes32 assertionId) {
    assertionId = _oo.assertTruth(
      claim, asserter, address(this), address(0), 7200, currency, bond_, _oo.defaultIdentifier(), bytes32(0)
    );
  }

  function _claim(IMarket market, Outcome outcome_) private view returns (bytes memory) {
    return abi.encodePacked(
      "Title: ",
      market.title(),
      "\n",
      "Description: ",
      market.description(),
      "\n",
      "Expiration: ",
      Strings.toString(market.expirationDate()),
      "\n",
      "\n",
      "Outcome: ",
      Outcomes.toString(outcome_),
      "\n",
      "Timestamp: ",
      Strings.toString(block.timestamp)
    );
  }
}
