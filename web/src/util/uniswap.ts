import { parseAbi } from "viem";
import { readContract, simulateContract } from "@wagmi/core";

import { Token } from "@uniswap/sdk-core";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";

import { config, chain } from "@/web3/config";

export const IQuoterV2ABI = parseAbi([
  "function quoteExactInput(bytes path, uint256 amountIn) external returns (uint256 amountOut, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)",
  "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
  "function quoteExactOutput(bytes path, uint256 amountOut) external returns (uint256 amountIn, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)",
  "function quoteExactOutputSingle((address tokenIn, address tokenOut, uint256 amountOut, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountIn, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
]);

export const IUniswapV3PoolABI = parseAbi([
  "function slot0() external view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)",
  "function liquidity() external view returns (uint128)",
]);

export const Q96 = BigInt("79228162514264337593543950336"); // 2^96
export const Q192 = Q96 * Q96;

export const getPoolAddress = (tokenIn: `0x${string}`, tokenOut: `0x${string}`, fee: FeeAmount = FeeAmount.HIGH) =>
  Pool.getAddress(
    new Token(chain.id, tokenIn, 18),
    new Token(chain.id, tokenOut, 18),
    fee,
    undefined,
    process.env.NEXT_PUBLIC_UNISWAP_V3FACTORY
  ) as `0x${string}`;

export const getSqrtPriceX96 = async (pool: `0x${string}`) => {
  const [sqrtPriceX96] = await readContract(config, {
    address: pool,
    abi: IUniswapV3PoolABI,
    functionName: "slot0",
  });

  return sqrtPriceX96;
};

export const quoteExactInput = async (
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

export const quoteExactOutput = async (
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
