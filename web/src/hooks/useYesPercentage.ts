import { useMemo } from "react";

import useMarket from "./useMarket";
import usePool from "./usePool";

export default function useYesPercentage(marketId: `0x${string}`) {
  const { data: market } = useMarket(marketId);
  const { data: pool, ...poolQuery } = usePool(marketId);

  const yesPercentage = useMemo(() => {
    if (!market || !pool) return;

    const longPrice = market.longToken === pool.token0.address ? pool.token0Price : pool.token1Price;

    return parseInt(longPrice.divide(longPrice.add(1)).multiply(100).toFixed(0));
  }, [market, pool]);

  return {
    ...poolQuery,
    data: yesPercentage,
  };
}
