import { useMemo } from "react";
import { parseAbi, zeroAddress } from "viem";
import { useSimulateContract } from "wagmi";
import { FeeAmount } from "@uniswap/v3-sdk";

import useMarket, { Outcome } from "./useMarket";

const IQuoterV2ABI = parseAbi([
  "function quoteExactInput(bytes path, uint256 amountIn) external returns (uint256 amountOut, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)",
  "function quoteExactInputSingle((address tokenIn, address tokenOut, uint256 amountIn, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountOut, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
  "function quoteExactOutput(bytes path, uint256 amountOut) external returns (uint256 amountIn, uint160[] sqrtPriceX96AfterList, uint32[] initializedTicksCrossedList, uint256 gasEstimate)",
  "function quoteExactOutputSingle((address tokenIn, address tokenOut, uint256 amount, uint24 fee, uint160 sqrtPriceLimitX96) params) external returns (uint256 amountIn, uint160 sqrtPriceX96After, uint32 initializedTicksCrossed, uint256 gasEstimate)",
]);

export default function useQuote(
  marketId?: `0x${string}`,
  outcome: Outcome = Outcome.YES,
  amount: bigint = BigInt(1e18)
) {
  const { data: market } = useMarket(marketId);

  const tokenIn = market ? (outcome === Outcome.YES ? market.shortToken : market.longToken) : zeroAddress;
  const tokenOut = market ? (outcome === Outcome.YES ? market.longToken : market.shortToken) : zeroAddress;

  const quote = useSimulateContract({
    address: process.env.NEXT_PUBLIC_UNISWAP_QUOTERV2,
    abi: IQuoterV2ABI,
    functionName: "quoteExactInputSingle",
    args: [{ tokenIn, tokenOut, fee: FeeAmount.HIGH, amountIn: amount, sqrtPriceLimitX96: BigInt(0) }],
    account: process.env.NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS,
    query: {
      enabled: !!market,
    },
  });

  const amountOut = useMemo(() => {
    if (!quote.data) return;

    return BigInt(quote.data.result[0]);
  }, [quote.data]);

  return { ...quote, data: amountOut };
}
