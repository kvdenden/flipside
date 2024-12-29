/* eslint-disable @typescript-eslint/no-unused-vars */

import { useQuery } from "@tanstack/react-query";

import { formatUnits, parseAbi } from "viem";
import { readContract, simulateContract } from "@wagmi/core";

import { Token } from "@uniswap/sdk-core";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";

import { config, chain } from "@/web3/config";

import Outcome from "@/util/outcome";
import useMarket from "./useMarket";

const IQuoterV2ABI = parseAbi([
  "function quoteExactInput(bytes path, uint256 amountIn) external returns (uint256 amountOut, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)",
  "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
  "function quoteExactOutput(bytes path, uint256 amountOut) external returns (uint256 amountIn, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)",
  "function quoteExactOutputSingle((address tokenIn, address tokenOut, uint256 amountOut, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountIn, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
]);

const IUniswapV3PoolABI = parseAbi([
  "function slot0() external view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)",
  "function liquidity() external view returns (uint128)",
]);

const abs = (num: bigint) => (num < BigInt(0) ? -num : num);

const Q96 = BigInt("79228162514264337593543950336"); // 2^96
const Q192 = Q96 * Q96;

const getPoolAddress = (tokenIn: `0x${string}`, tokenOut: `0x${string}`, fee: FeeAmount = FeeAmount.HIGH) =>
  Pool.getAddress(
    new Token(chain.id, tokenIn, 18),
    new Token(chain.id, tokenOut, 18),
    fee,
    undefined,
    process.env.NEXT_PUBLIC_UNISWAP_V3FACTORY
  ) as `0x${string}`;

const getSqrtPriceX96 = async (pool: `0x${string}`) => {
  const [sqrtPriceX96] = await readContract(config, {
    address: pool,
    abi: IUniswapV3PoolABI,
    functionName: "slot0",
  });

  return sqrtPriceX96;
};

const quoteExactInput = async (
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  amountIn: bigint,
  fee: FeeAmount = FeeAmount.HIGH,
  sqrtPriceLimitX96: bigint = BigInt(0)
) => {
  const quote = await simulateContract(config, {
    address: process.env.NEXT_PUBLIC_UNISWAP_QUOTERV2,
    abi: IQuoterV2ABI,
    functionName: "quoteExactInputSingle",
    args: [{ tokenIn, tokenOut, amountIn, fee, sqrtPriceLimitX96 }],
  });

  const [amountOut, sqrtPriceX96After] = quote.result;

  return { amountOut, sqrtPriceX96After };
};

const quoteExactOutput = async (
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  amountOut: bigint,
  fee: FeeAmount = FeeAmount.HIGH,
  sqrtPriceLimitX96: bigint = BigInt(0)
) => {
  const quote = await simulateContract(config, {
    address: process.env.NEXT_PUBLIC_UNISWAP_QUOTERV2,
    abi: IQuoterV2ABI,
    functionName: "quoteExactOutputSingle",
    args: [{ tokenIn, tokenOut, amountOut, fee, sqrtPriceLimitX96 }],
  });

  const [amountIn, sqrtPriceX96After] = quote.result;

  return { amountIn, sqrtPriceX96After };
};

const binarySearch = async (
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  amount: bigint,
  tolerance: bigint = BigInt(1)
) => {
  let low = BigInt(0);
  let high = amount;

  let iterations = 0;

  // let prevAmountOut = BigInt(0);

  while (high - low > tolerance) {
    const amountIn = (low + high) / BigInt(2);
    const { amountOut } = await quoteExactInput(tokenIn, tokenOut, amountIn);

    console.log("Amount in:", amountIn.toString());
    console.log("Amount out:", amountOut.toString());

    // if (abs(amountOut - prevAmountOut) < tolerance) break;

    if (amountOut < amount - amountIn) {
      low = amountIn + BigInt(1);
    } else {
      high = amountIn;
    }

    // prevAmountOut = amountOut;
    iterations++;
  }

  console.log("Iterations:", iterations);

  return (low + high) / BigInt(2);
};

// Estimates the amount of tokenOut needed to balance tokenIn and tokenOut amounts after a swap
const estimateAmountOutForBalance = (amount: bigint, sqrtPriceX96: bigint, invertPrice: boolean = false) => {
  if (invertPrice) {
    sqrtPriceX96 = Q192 / sqrtPriceX96;
  }

  const sqrtPriceX96Squared = sqrtPriceX96 * sqrtPriceX96;

  return (amount * sqrtPriceX96Squared) / (Q192 + sqrtPriceX96Squared);
};

const calculateOptimalRedeemAmount = async (
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  totalAmount: bigint,
  tolerance: bigint = BigInt(1)
) => {
  const poolAddress = getPoolAddress(tokenIn, tokenOut);
  const invertPrice = tokenOut.toLowerCase() < tokenIn.toLowerCase();

  // get current price (sqrtPriceX96)
  const sqrtPriceX96 = await getSqrtPriceX96(poolAddress);

  // estimate amountOut
  let amountOut = estimateAmountOutForBalance(totalAmount, sqrtPriceX96, invertPrice);

  console.log("sqrtPriceX96:", sqrtPriceX96.toString());
  console.log("Amount out estimate:", amountOut.toString());

  let iterations = 0;
  while (iterations < 100) {
    // simulate exact output swap
    const { amountIn, sqrtPriceX96After } = await quoteExactOutput(tokenIn, tokenOut, amountOut);

    const delta = amountIn + amountOut - totalAmount;

    console.log("Amount in:", amountIn.toString());
    console.log("Amount out:", amountOut.toString());
    console.log("Delta:", delta.toString());

    if (delta <= tolerance) break; // solution is within tolerance

    // adjust amountOut
    amountOut -= estimateAmountOutForBalance(delta, sqrtPriceX96After, invertPrice);

    iterations++;
  }

  console.log("Iterations:", iterations);

  // return the amount of token pairs to redeem
  return totalAmount - amountOut;
};

const calculateOptimalRedeemAmountV2 = async (
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  totalAmount: bigint,
  tolerance: bigint = BigInt(1)
) => {
  const poolAddress = getPoolAddress(tokenIn, tokenOut);
  const invertPrice = tokenOut.toLowerCase() < tokenIn.toLowerCase();

  // get current price (sqrtPriceX96)
  const sqrtPriceX96 = await getSqrtPriceX96(poolAddress);

  // estimate amountOut
  let amountOut = estimateAmountOutForBalance(totalAmount, sqrtPriceX96, invertPrice);

  console.log("sqrtPriceX96:", sqrtPriceX96.toString());
  console.log("Amount out estimate:", formatUnits(amountOut, 18));

  let iterations = 0;
  while (iterations < 100) {
    // simulate exact output swap
    const { amountIn, sqrtPriceX96After } = await quoteExactOutput(tokenIn, tokenOut, amountOut);

    const delta = amountIn + amountOut - totalAmount;

    console.log("Amount in:", formatUnits(amountIn, 18));
    console.log("Amount out:", formatUnits(amountOut, 18));
    console.log("Delta:", formatUnits(delta, 18));

    if (abs(delta) <= tolerance) break; // solution is within tolerance

    const estimate = estimateAmountOutForBalance(delta, sqrtPriceX96After, invertPrice);
    // const estimate = (delta * amountIn) / amountOut;
    console.log("Estimated overshoot:", formatUnits(estimate, 18));

    // adjust amountOut
    amountOut -= estimateAmountOutForBalance(delta, sqrtPriceX96After, invertPrice);

    iterations++;
  }

  console.log("Iterations:", iterations);

  // return the amount of token pairs to redeem
  return totalAmount - amountOut;
};

// sectant method
const calculateOptimalRedeemAmountV3 = async (
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  totalAmount: bigint,
  tolerance: bigint = BigInt(1)
) => {
  const { amountOut: maxAmountOut } = await quoteExactInput(tokenIn, tokenOut, totalAmount);

  let min = BigInt(0);
  let fMin = totalAmount;

  let max = maxAmountOut;
  let fMax = -max;

  let iterations = 0;
  while (iterations < 100) {
    if (fMin <= tolerance) break;

    // secant step
    const amountOut = max - (fMax * (max - min)) / (fMax - fMin);

    // simulate exact output swap
    const { amountIn } = await quoteExactOutput(tokenIn, tokenOut, amountOut);

    const delta = totalAmount - (amountIn + amountOut);

    console.log("Amount in:", formatUnits(amountIn, 18));
    console.log("Amount out:", formatUnits(amountOut, 18));
    console.log("Delta:", formatUnits(delta, 18));

    if (delta >= 0) {
      min = amountOut;
      fMin = delta;
    } else {
      max = amountOut;
      fMax = delta;
    }

    iterations++;
  }

  console.log("Iterations:", iterations);

  return min;
};

const calculateOptimalRedeemAmountV4 = async (
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  totalAmount: bigint,
  tolerance: bigint = BigInt(1)
) => {
  const poolAddress = getPoolAddress(tokenIn, tokenOut);
  const invertPrice = tokenOut.toLowerCase() < tokenIn.toLowerCase();

  // get current price (sqrtPriceX96)
  const sqrtPriceX96 = await getSqrtPriceX96(poolAddress);

  // estimate amountOut
  let amountOut = estimateAmountOutForBalance(totalAmount, sqrtPriceX96, invertPrice);

  const { amountOut: maxAmountOut } = await quoteExactInput(tokenIn, tokenOut, totalAmount);

  if (amountOut > maxAmountOut) {
    console.log("Initial estimate exceeds maximum amount out");
    amountOut = maxAmountOut;
  }

  let iterations = 0;
  while (iterations < 100) {
    // simulate exact output swap
    const { amountIn, sqrtPriceX96After } = await quoteExactOutput(tokenIn, tokenOut, amountOut);

    const delta = totalAmount - (amountIn + amountOut);

    console.log("Amount in:", formatUnits(amountIn, 18));
    console.log("Amount out:", formatUnits(amountOut, 18));
    console.log("Delta:", formatUnits(delta, 18));

    if (delta >= 0 && delta <= tolerance) break; // solution is within tolerance

    const step = estimateAmountOutForBalance(delta, sqrtPriceX96After, invertPrice);
    console.log("Step:", formatUnits(step, 18));
    amountOut += step;

    iterations++;
  }

  console.log("Iterations:", iterations);

  // return the amount of token pairs to redeem
  return amountOut;
};

const calculateOptimalRedeemAmountV5 = async (
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  totalAmount: bigint,
  tolerance: bigint = BigInt(1),
  maxIterations: number = 100
) => {
  const poolAddress = getPoolAddress(tokenIn, tokenOut);
  const invertPrice = tokenOut.toLowerCase() < tokenIn.toLowerCase();

  // get current price (sqrtPriceX96)
  const sqrtPriceX96 = await getSqrtPriceX96(poolAddress);

  const { amountOut: maxAmountOut } = await quoteExactInput(tokenIn, tokenOut, totalAmount);
  if (maxAmountOut === BigInt(0)) return BigInt(0); // no liquidity

  let lowerBound = BigInt(0);
  let upperBound = maxAmountOut;

  // estimate amountOut
  let amountOut = estimateAmountOutForBalance(totalAmount, sqrtPriceX96, invertPrice);
  if (amountOut > upperBound) amountOut = upperBound;

  let iterations = 0;
  while (upperBound - lowerBound > tolerance && iterations < maxIterations) {
    // simulate exact output swap
    const { amountIn, sqrtPriceX96After } = await quoteExactOutput(tokenIn, tokenOut, amountOut);

    const delta = totalAmount - (amountIn + amountOut);

    console.log("Amount in:", formatUnits(amountIn, 18));
    console.log("Amount out:", formatUnits(amountOut, 18));
    console.log("Delta:", formatUnits(delta, 18));

    if (delta < 0) {
      upperBound = amountOut;
    } else {
      lowerBound = amountOut;
      if (delta <= tolerance) break;
    }

    let step = estimateAmountOutForBalance(delta, sqrtPriceX96After, invertPrice);
    if (step === BigInt(0)) step = delta < 0 ? BigInt(-1) : BigInt(1);

    let nextAmountOut = amountOut + step;
    if (nextAmountOut <= lowerBound) nextAmountOut = lowerBound + BigInt(1);
    if (nextAmountOut >= upperBound) nextAmountOut = upperBound - BigInt(1);

    amountOut = nextAmountOut;

    iterations++;
  }

  console.log("Iterations:", iterations);

  return lowerBound;
};

export default function useRedeemAmount(
  marketId?: `0x${string}`,
  outcome: Outcome = Outcome.Yes,
  amount: bigint = BigInt(1e18),
  tolerance: bigint = BigInt(1)
) {
  const { data: market } = useMarket(marketId);

  return useQuery({
    queryKey: ["redeemAmount", marketId, outcome, amount.toString()],
    queryFn: () => {
      if (!market) return;

      const [tokenIn, tokenOut] =
        outcome === Outcome.Yes ? [market.longToken, market.shortToken] : [market.shortToken, market.longToken];

      return calculateOptimalRedeemAmountV5(tokenIn, tokenOut, amount, tolerance);
    },
    enabled: !!market,
  });
}
