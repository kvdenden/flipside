// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { IV3SwapRouter } from "./interfaces/uniswap/IV3SwapRouter.sol";

import { Price } from "./lib/Price.sol";

import { IMarket } from "./interfaces/IMarket.sol";

import { Market } from "./Market.sol";
import { MarketFactory } from "./MarketFactory.sol";

contract Flipside {
  using SafeERC20 for IERC20;

  MarketFactory public marketFactory;
  IV3SwapRouter public swapRouter;

  constructor(address marketFactory_, address swapRouter_) {
    marketFactory = MarketFactory(marketFactory_);
    swapRouter = IV3SwapRouter(swapRouter_);
  }

  function createMarket(MarketFactory.Params memory params) external returns (Market) {
    IERC20 collateralToken = IERC20(params.collateralToken);
    uint256 collateralAmount = Price.calculate(params.initialLiquidity, params.unitPrice);

    collateralToken.safeTransferFrom(msg.sender, address(this), collateralAmount);
    collateralToken.safeIncreaseAllowance(address(marketFactory), collateralAmount);

    return marketFactory.createMarket(params);
  }

  function mintPair(IMarket market, address to, uint256 amount) external {
    _mint(market, to, amount);
  }

  function mintOutcome(IMarket market, address to, uint256 amount, uint256 amountOutMin, bool outcome) external {
    _mint(market, address(this), amount);
    IERC20 longToken = market.longToken();
    IERC20 shortToken = market.shortToken();

    (IERC20 tokenIn, IERC20 tokenOut) = outcome ? (shortToken, longToken) : (longToken, shortToken);
    uint256 amountOut = _swapExactIn(tokenIn, tokenOut, amount, amountOutMin);
    uint256 totalAmount = amount + amountOut;

    tokenOut.safeTransfer(to, totalAmount);
  }

  function redeemOutcome(IMarket market, address to, uint256 amount, uint256 amountInMax, bool outcome) external {
    IERC20 longToken = market.longToken();
    IERC20 shortToken = market.shortToken();

    (IERC20 tokenIn, IERC20 tokenOut) = outcome ? (longToken, shortToken) : (shortToken, longToken);

    tokenIn.safeTransferFrom(msg.sender, address(this), amount + amountInMax);
    uint256 amountIn = _swapExactOut(tokenIn, tokenOut, amountInMax, amount);

    market.redeem(to, amount);

    if (amountIn < amountInMax) {
      tokenIn.safeTransfer(msg.sender, amountInMax - amountIn);
    }
  }

  function _mint(IMarket market, address to, uint256 amount) internal {
    IERC20 collateralToken = market.collateralToken();
    uint256 collateralAmount = Price.calculate(amount, market.unitPrice());
    collateralToken.safeTransferFrom(msg.sender, address(this), collateralAmount);
    collateralToken.safeIncreaseAllowance(address(market), collateralAmount);
    market.mint(to, amount);
  }

  function _swapExactIn(IERC20 tokenIn, IERC20 tokenOut, uint256 amountIn, uint256 amountOutMin)
    internal
    returns (uint256 amountOut)
  {
    tokenIn.safeIncreaseAllowance(address(swapRouter), amountIn);

    IV3SwapRouter.ExactInputSingleParams memory params = IV3SwapRouter.ExactInputSingleParams({
      tokenIn: address(tokenIn),
      tokenOut: address(tokenOut),
      fee: 10_000,
      recipient: address(this),
      amountIn: amountIn,
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0
    });

    amountOut = swapRouter.exactInputSingle(params);
  }

  function _swapExactOut(IERC20 tokenIn, IERC20 tokenOut, uint256 amountInMax, uint256 amountOut)
    internal
    returns (uint256 amountIn)
  {
    tokenIn.safeIncreaseAllowance(address(swapRouter), amountInMax);

    IV3SwapRouter.ExactOutputSingleParams memory params = IV3SwapRouter.ExactOutputSingleParams({
      tokenIn: address(tokenIn),
      tokenOut: address(tokenOut),
      fee: 10_000,
      recipient: address(this),
      amountInMaximum: amountInMax,
      amountOut: amountOut,
      sqrtPriceLimitX96: 0
    });

    amountIn = swapRouter.exactOutputSingle(params);
  }
}
