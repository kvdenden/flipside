// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { Price } from "./lib/Price.sol";

import { IMarket } from "./interfaces/IMarket.sol";
import { IResolver } from "./interfaces/IResolver.sol";
import { IRewardManager } from "./interfaces/IRewardManager.sol";

import { Outcome } from "./Outcome.sol";
import { OutcomeToken } from "./OutcomeToken.sol";

contract Market is IMarket {
  using Math for uint256;
  using Strings for uint256;

  using SafeERC20 for IERC20;

  struct MarketParams {
    address creator;
    string pairName;
    string pairSymbol;
    string title;
    string description;
    uint256 expirationDate;
    address collateralToken;
    uint256 unitPrice;
    address resolver;
    address rewardManager;
  }

  address public creator;

  string public title;
  string public description;
  uint256 public expirationDate;

  IERC20 public collateralToken;

  uint256 public unitPrice;

  OutcomeToken public longToken;
  OutcomeToken public shortToken;

  uint256 public totalVolume;

  IResolver private _resolver;

  IRewardManager private _rewardManager;

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

    creator = params.creator;
    title = params.title;
    description = params.description;
    expirationDate = params.expirationDate;
    collateralToken = IERC20(params.collateralToken);
    unitPrice = params.unitPrice;

    _resolver = IResolver(params.resolver);

    _rewardManager = IRewardManager(params.rewardManager);
  }

  function mint(address to, uint256 amount) external {
    require(amount % 1e18 == 0, "Invalid amount");

    uint256 collateralAmount = price(amount);
    collateralToken.safeTransferFrom(msg.sender, address(this), collateralAmount);

    uint256 reward = marketReward(amount);
    collateralToken.approve(address(_rewardManager), reward);
    _rewardManager.collect(this, reward);

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

    amount = settlementAmount(outcome(), longAmount, shortAmount);

    _payout(to, amount);

    emit Settled(msg.sender, to, amount);
  }

  function price(uint256 amount) public view returns (uint256) {
    return Price.calculate(amount, unitPrice);
  }

  function redemptionPrice(uint256 amount) public view returns (uint256) {
    return price(amount) - marketReward(amount);
  }

  function marketReward(uint256 amount) public view returns (uint256) {
    return price(amount).ceilDiv(100);
  }

  function resolver() public view override returns (address) {
    return address(_resolver);
  }

  function resolved() public view returns (bool) {
    return _resolver.resolved(address(this));
  }

  function outcome() public view whenResolved returns (Outcome) {
    return _resolver.outcome(address(this));
  }

  function settlementAmount(Outcome outcome_, uint256 longAmount, uint256 shortAmount) public pure returns (uint256) {
    if (outcome_ == Outcome.Yes) return longAmount;
    if (outcome_ == Outcome.No) return shortAmount;

    return (longAmount + shortAmount) / 2;
  }

  function _payout(address to, uint256 amount) private {
    uint256 payoutAmount = redemptionPrice(amount);

    collateralToken.safeTransfer(to, payoutAmount);
  }
}
