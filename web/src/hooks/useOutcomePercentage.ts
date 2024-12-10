import { useMemo } from "react";

import Outcome from "@/util/outcome";
import useMarket from "./useMarket";
import usePool from "./usePool";

export default function useOutcomePercentage(marketId: `0x${string}`, outcome: Outcome = Outcome.Yes) {
  const { data: market } = useMarket(marketId);
  const { data: pool, ...poolQuery } = usePool(marketId);

  const percentage = useMemo(() => {
    if (!market || !pool) return;

    const token = outcome === Outcome.Yes ? market.longToken : market.shortToken;
    const tokenPrice = token === pool.token0.address ? pool.token0Price : pool.token1Price;

    return parseInt(tokenPrice.divide(tokenPrice.add(1)).multiply(100).toFixed(0));
  }, [market, pool, outcome]);

  return {
    ...poolQuery,
    data: percentage,
  };
}
