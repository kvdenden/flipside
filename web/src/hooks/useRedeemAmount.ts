import { useQuery } from "@tanstack/react-query";

import { parseAbi } from "viem";
import { simulateContract } from "@wagmi/core";

import { FeeAmount } from "@uniswap/v3-sdk";

import { config } from "@/web3/config";

import Outcome from "@/util/outcome";
import useMarket from "./useMarket";

const IQuoterV2ABI = parseAbi([
  "function quoteExactInput(bytes path, uint256 amountIn) external returns (uint256 amountOut, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)",
  "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
  "function quoteExactOutput(bytes path, uint256 amountOut) external returns (uint256 amountIn, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)",
  "function quoteExactOutputSingle((address tokenIn, address tokenOut, uint256 amount, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountIn, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
]);

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

  return quote.result[0];
};

const binarySearch = async (tokenIn: `0x${string}`, tokenOut: `0x${string}`, amount: bigint) => {
  let low = BigInt(0);
  let high = amount;

  while (low < high) {
    const amountIn = (low + high) / BigInt(2);
    const amountOut = await quoteExactInput(tokenIn, tokenOut, amountIn);

    if (amountOut < amount - amountIn) {
      low = amountIn + BigInt(1);
    } else {
      high = amountIn;
    }
  }

  return low;
};

export default function useRedeemAmount(
  marketId?: `0x${string}`,
  outcome: Outcome = Outcome.Yes,
  amount: bigint = BigInt(1e18)
) {
  const { data: market } = useMarket(marketId);

  return useQuery({
    queryKey: ["redeemAmount", marketId, outcome, amount.toString()],
    queryFn: () => {
      if (!market) return;

      const [tokenIn, tokenOut] =
        outcome === Outcome.Yes ? [market.longToken, market.shortToken] : [market.shortToken, market.longToken];

      return binarySearch(tokenIn, tokenOut, amount);
    },
    enabled: !!market,
  });
}
