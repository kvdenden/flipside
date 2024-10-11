// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { IV3SwapRouter } from "./interfaces/uniswap/IV3SwapRouter.sol";

import { Price } from "./lib/Price.sol";

import { MarketFactory } from "./MarketFactory.sol";
import { Market } from "./Market.sol";

contract Flipside {
  MarketFactory public marketFactory;
  IV3SwapRouter public swapRouter;

  constructor(address marketFactory_, address swapRouter_) {
    marketFactory = MarketFactory(marketFactory_);
    swapRouter = IV3SwapRouter(swapRouter_);
  }

  function createMarket(MarketFactory.Params memory params) external returns (Market) {
    IERC20 collateralToken = IERC20(params.collateralToken);
    uint256 collateralAmount = Price.calculate(params.initialLiquidity, params.unitPrice);

    collateralToken.transferFrom(msg.sender, address(this), collateralAmount);
    collateralToken.approve(address(marketFactory), collateralAmount);

    return marketFactory.createMarket(params);
  }

  function mintPair(Market market, address to, uint256 amount) external {
    _mint(market, to, amount);
  }

  function mintOutcome(Market market, address to, uint256 amount, uint256 amountOutMin, bool outcome) external {
    _mint(market, address(this), amount);
    address longToken = address(market.longToken());
    address shortToken = address(market.shortToken());

    (address tokenIn, address tokenOut) = outcome ? (shortToken, longToken) : (longToken, shortToken);
    uint256 amountOut = _swap(tokenIn, tokenOut, amount, amountOutMin);

    IERC20(tokenOut).transfer(to, amount + amountOut);
  }

  function _mint(Market market, address to, uint256 amount) internal {
    IERC20 collateralToken = market.collateralToken();
    uint256 collateralAmount = market.price(amount);
    collateralToken.transferFrom(msg.sender, address(this), collateralAmount);
    collateralToken.approve(address(market), collateralAmount);
    market.mint(to, amount);
  }

  function _swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin)
    internal
    returns (uint256 amountOut)
  {
    IERC20(tokenIn).approve(address(swapRouter), amountIn);

    IV3SwapRouter.ExactInputSingleParams memory params = IV3SwapRouter.ExactInputSingleParams({
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      fee: 10_000,
      recipient: address(this),
      amountIn: amountIn,
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0
    });

    amountOut = swapRouter.exactInputSingle(params);
  }
}
