// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { IRewardManager } from "./interfaces/IRewardManager.sol";
import { IMarket } from "./interfaces/IMarket.sol";
import { Outcome } from "./Outcome.sol";

contract RewardManager is IRewardManager {
  using SafeERC20 for IERC20;
  using Math for uint256;

  event Collect(address indexed market, uint256 amount);
  event Claim(address indexed market, uint256 amount);

  address private immutable _TREASURY;
  uint256 private immutable _CREATOR_REWARD; // in basis points

  mapping(IMarket => uint256) private _rewards;

  constructor(address treasury, uint256 creatorReward) {
    _TREASURY = treasury;
    _CREATOR_REWARD = creatorReward;
  }

  function collect(IMarket market, uint256 amount) external override {
    require(msg.sender == address(market), "Invalid caller");

    IERC20 collateralToken = market.collateralToken();

    uint256 creatorReward = amount.mulDiv(_CREATOR_REWARD, 1e4);
    uint256 protocolReward = amount - creatorReward;

    _rewards[market] += creatorReward;

    collateralToken.safeTransferFrom(msg.sender, address(this), amount);
    collateralToken.safeTransfer(_TREASURY, protocolReward);

    emit Collect(address(market), amount);
  }

  function claim(IMarket market) external override {
    require(market.resolved(), "Market not resolved");

    IERC20 collateralToken = market.collateralToken();

    uint256 reward = _rewards[market];

    _rewards[market] = 0;

    if (market.outcome() != Outcome.Invalid) {
      collateralToken.safeTransfer(market.creator(), reward);
    } else {
      collateralToken.safeTransfer(_TREASURY, reward);
    }

    emit Claim(address(market), reward);
  }
}
