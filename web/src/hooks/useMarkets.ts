"use client";

import { useQuery } from "@tanstack/react-query";

const fetchMarkets = async (): Promise<`0x${string}`[]> => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/markets`);
  if (response.ok) {
    const markets = await response.json();

    return markets.map((market: any) => market.id);
  }

  return [];
};

export default function useMarkets() {
  return useQuery({ queryKey: ["markets"], queryFn: () => fetchMarkets() });
}
