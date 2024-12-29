import { useMemo } from "react";
import { zeroAddress } from "viem";
import { useSimulateContract } from "wagmi";
import { FeeAmount } from "@uniswap/v3-sdk";

import { IQuoterV2ABI } from "@/util/uniswap";
import Outcome from "@/util/outcome";
import useMarket from "./useMarket";

export default function useQuote(
  marketId?: `0x${string}`,
  outcome: Outcome = Outcome.Yes,
  amountIn: bigint = BigInt(1e18)
) {
  const { data: market } = useMarket(marketId);

  const tokenIn = market ? (outcome === Outcome.Yes ? market.shortToken : market.longToken) : zeroAddress;
  const tokenOut = market ? (outcome === Outcome.Yes ? market.longToken : market.shortToken) : zeroAddress;

  const quote = useSimulateContract({
    address: process.env.NEXT_PUBLIC_UNISWAP_QUOTERV2,
    abi: IQuoterV2ABI,
    functionName: "quoteExactInputSingle",
    args: [{ tokenIn, tokenOut, fee: FeeAmount.HIGH, amountIn, sqrtPriceLimitX96: BigInt(0) }],
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
