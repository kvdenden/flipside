import { useMemo } from "react";
import Outcome from "@/util/outcome";
import useQuote from "./useQuote";
import useMarket from "./useMarket";

export default function usePrice(
  marketId?: `0x${string}`,
  outcome: Outcome = Outcome.Yes,
  amountIn: bigint = BigInt(1e18)
) {
  const { data: market } = useMarket(marketId);

  const { data: amountOut, ...quote } = useQuote(marketId, outcome, amountIn);

  const price = useMemo(() => {
    if (!market || !amountOut) return;

    return (amountIn * market.unitPrice) / (amountIn + amountOut);
  }, [market, amountIn, amountOut]);

  return {
    ...quote,
    data: price,
  };
}
