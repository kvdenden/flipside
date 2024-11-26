"use client";

import { useMemo } from "react";
import { useReadContracts } from "wagmi";

import { resolverAbi } from "@/web3/abi";

const RESOLVER_ADDRESS = process.env.NEXT_PUBLIC_RESOLVER_CONTRACT_ADDRESS;

export type Bond = {
  currency: `0x${string}`;
  amount: bigint;
};

export default function useBond() {
  const result = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: RESOLVER_ADDRESS,
        abi: resolverAbi,
        functionName: "currency",
      },
      {
        address: RESOLVER_ADDRESS,
        abi: resolverAbi,
        functionName: "bond",
      },
    ],
  });

  const bond = useMemo(() => {
    if (!result.data) return;

    const [currency, amount] = result.data;

    return {
      currency,
      amount,
    };
  }, [result.data]);

  return { ...result, data: bond };
}
