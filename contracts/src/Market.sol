// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { Price } from "./lib/Price.sol";

import { Resolver } from "./Resolver.sol";
import { Outcome } from "./Outcome.sol";
import { OutcomeToken } from "./OutcomeToken.sol";

contract Market {
  struct MarketParams {
    string pairName;
    string pairSymbol;
    string title;
    string description;
    address collateralToken;
    uint256 unitPrice;
    address resolver;
  }

  string public title;
  string public description;

  IERC20 public collateralToken;

  uint256 public unitPrice;

  OutcomeToken public longToken;
  OutcomeToken public shortToken;

  uint256 public totalVolume;

  Resolver private _resolver;
  bytes32 private _resolutionId;

  event Minted(address indexed from, address indexed to, uint256 amount);
  event Redeemed(address indexed from, address indexed to, uint256 amount);
  event Settled(address indexed from, address indexed to, uint256 amount);

  modifier whenResolved() {
    require(resolved(), "Market not resolved");
    _;
  }

  constructor(MarketParams memory params) {
    longToken = new OutcomeToken(
      address(this), string.concat(params.pairName, " - Long"), string.concat(params.pairSymbol, "LONG")
    );
    shortToken = new OutcomeToken(
      address(this), string.concat(params.pairName, " - Short"), string.concat(params.pairSymbol, "SHORT")
    );

    title = params.title;
    description = params.description;
    collateralToken = IERC20(params.collateralToken);
    unitPrice = params.unitPrice;

    _resolver = Resolver(params.resolver);
  }

  function mint(address to, uint256 amount) external {
    require(amount % 1e18 == 0, "Invalid amount");

    uint256 collateralAmount = price(amount);
    collateralToken.transferFrom(msg.sender, address(this), collateralAmount);

    longToken.mint(to, amount);
    shortToken.mint(to, amount);
    totalVolume += amount;

    emit Minted(msg.sender, to, amount);
  }

  function redeem(address to, uint256 amount) external {
    longToken.burn(msg.sender, amount);
    shortToken.burn(msg.sender, amount);

    _payout(to, amount);

    emit Redeemed(msg.sender, to, amount);
  }

  function settle(address to, uint256 longAmount, uint256 shortAmount) external whenResolved returns (uint256 amount) {
    longToken.burn(msg.sender, longAmount);
    shortToken.burn(msg.sender, shortAmount);

    Outcome outcome_ = outcome();
    amount = _calculatePayoutAmount(outcome_, longAmount, shortAmount);

    _payout(to, amount);

    emit Settled(msg.sender, to, amount);
  }

  function startResolution() external {
    require(_resolutionId == 0, "Already started resolution");

    _resolutionId = _resolver.initializeQuery(description);
  }

  function price(uint256 amount) public view returns (uint256) {
    return Price.calculate(amount, unitPrice);
  }

  function resolved() public view returns (bool) {
    return _resolutionId != 0 && _resolver.resolved(_resolutionId);
  }

  function outcome() public view whenResolved returns (Outcome) {
    return _resolver.outcome(_resolutionId);
  }

  function _payout(address to, uint256 amount) private {
    collateralToken.transfer(to, price(amount));
  }

  function _calculatePayoutAmount(Outcome outcome_, uint256 longAmount, uint256 shortAmount)
    private
    pure
    returns (uint256)
  {
    if (outcome_ == Outcome.Yes) return longAmount;
    if (outcome_ == Outcome.No) return shortAmount;

    return (longAmount + shortAmount) / 2;
  }
}
