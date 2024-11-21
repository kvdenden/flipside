// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {IMarket} from "../../src/interfaces/IMarket.sol";
import {IResolver} from "../../src/interfaces/IResolver.sol";

import {Outcome} from "../../src/Outcome.sol";
import {OutcomeToken} from "../../src/OutcomeToken.sol";

contract MockMarket is IMarket {
  address public creator;
  string public title;
  string public description;
  uint256 public expirationDate;
  IERC20 public collateralToken;
  uint256 public unitPrice;
  OutcomeToken public longToken;
  OutcomeToken public shortToken;

  IResolver private _resolver;
  
  constructor(address resolver) {
    longToken = new OutcomeToken(address(this), "Long", "LONG");
    shortToken = new OutcomeToken(address(this), "Short", "SHORT");

    _resolver = IResolver(resolver);
  }

  function setCreator(address creator_) external {
    creator = creator_;
  }

  function setTitle(string memory title_) external {
    title = title_;
  }

  function setDescription(string memory description_) external {
    description = description_;
  }

  function setExpirationDate(uint256 expirationDate_) external {
    expirationDate = expirationDate_;
  }

  function setCollateralToken(address collateralToken_) external {
    collateralToken = IERC20(collateralToken_);
  }

  function setUnitPrice(uint256 unitPrice_) external {
    unitPrice = unitPrice_;
  }

  function resolved() external view override returns (bool) {
    return _resolver.resolved(address(this));
  }

  function outcome() external view override returns (Outcome) {
    return _resolver.outcome(address(this));
  }

  function mint(address to, uint256 amount) external override {}
  function redeem(address to, uint256 amount) external override {}
  function settle(address to, uint256 longAmount, uint256 shortAmount) external override returns (uint256) {}
}