"use client";

import { useReadContract } from "wagmi";

import { marketAbi } from "@/web3/abi";

export default function usePrice(marketId?: `0x${string}`, amount: bigint = BigInt(1e18)) {
  return useReadContract({
    address: marketId,
    abi: marketAbi,
    functionName: "price",
    args: [amount],
  });
}
