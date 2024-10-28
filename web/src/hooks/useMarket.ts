"use client";

import { useQuery } from "@tanstack/react-query";
import { getAddress, hexToBigInt } from "viem";

export enum Outcome {
  YES,
  NO,
  INVALID,
}

export type Pool = {
  id: `0x${string}`;
  initialLiquidity: bigint;
};

export type Market = {
  id: `0x${string}`;
  title: string;
  description: string;
  collateralToken: `0x${string}`;
  unitPrice: bigint;
  longToken: `0x${string}`;
  shortToken: `0x${string}`;
  pool: Pool;

  resolved: boolean;
  outcome?: Outcome;
};

const fetchMarket = async (marketId: `0x${string}`): Promise<Market | undefined> => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/markets/${marketId}`);
  if (response.ok) {
    const { Market: market, Pool: pool } = await response.json();

    return {
      id: market.id,
      title: market.title,
      description: market.description,
      collateralToken: getAddress(market.collateralToken),
      unitPrice: hexToBigInt(market.unitPrice),
      longToken: getAddress(market.longToken),
      shortToken: getAddress(market.shortToken),
      pool: {
        id: pool.id,
        initialLiquidity: hexToBigInt(pool.initialLiquidity),
      },

      resolved: market.resolved,
      outcome: market.outcome,
    };
  }

  return;
};

export default function useMarket(marketId?: `0x${string}`) {
  return useQuery({ queryKey: ["market", marketId], queryFn: () => marketId && fetchMarket(marketId) });
}
