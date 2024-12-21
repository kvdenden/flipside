"use client";

import { useReadContract } from "wagmi";

import { marketAbi } from "@/web3/abi";
import useMarket from "./useMarket";
import Outcome from "@/util/outcome";
import useRedemptionPrice from "./useRedemptionPrice";

export default function useSettlementPrice(
  marketId?: `0x${string}`,
  longAmount: bigint = BigInt(1e18),
  shortAmount: bigint = BigInt(1e18)
) {
  const { data: market } = useMarket(marketId);

  const outcome = market?.outcome ?? Outcome.Invalid;

  const { data: settlementAmount = BigInt(0) } = useReadContract({
    address: marketId,
    abi: marketAbi,
    functionName: "settlementAmount",

    args: [outcome, longAmount, shortAmount],
    query: {
      enabled: market && market.resolved,
    },
  });

  return useRedemptionPrice(marketId, settlementAmount);
}
