"use client";

import { useReadContracts } from "wagmi";
import { erc20Abi } from "viem";
import { useMemo } from "react";

export type Token = {
  address: `0x${string}`;
  decimals: number;
  name: string;
  symbol: string;
  totalSupply: bigint;
};

export default function useToken(address?: `0x${string}`) {
  const result = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address,
        abi: erc20Abi,
        functionName: "decimals",
      },
      {
        address,
        abi: erc20Abi,
        functionName: "name",
      },
      {
        address,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        address,
        abi: erc20Abi,
        functionName: "totalSupply",
      },
    ],
    query: {
      enabled: !!address,
    },
  });

  const token: Token | undefined = useMemo(() => {
    if (!address || !result.data) return;

    const [decimals, name, symbol, totalSupply] = result.data;

    return {
      address,
      decimals,
      name,
      symbol,
      totalSupply,
    };
  }, [address, result.data]);

  return { ...result, data: token };
}
