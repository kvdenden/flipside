import { useQuery } from "@tanstack/react-query";

import { getPoolAddress, getSqrtPriceX96, quoteExactInput, quoteExactOutput, Q192 } from "@/util/uniswap";
import Outcome from "@/util/outcome";
import useMarket from "./useMarket";

// Estimates the amount of tokenOut needed to balance tokenIn and tokenOut amounts after a swap
const estimateAmountOutForBalance = (amount: bigint, sqrtPriceX96: bigint, invertPrice: boolean = false) => {
  if (invertPrice) {
    sqrtPriceX96 = Q192 / sqrtPriceX96;
  }

  const sqrtPriceX96Squared = sqrtPriceX96 * sqrtPriceX96;

  return (amount * sqrtPriceX96Squared) / (Q192 + sqrtPriceX96Squared);
};

const calculateOptimalRedeemAmount = async (
  tokenIn: `0x${string}`,
  tokenOut: `0x${string}`,
  totalAmount: bigint,
  tolerance: bigint = BigInt(1),
  maxIterations: number = 100
) => {
  const poolAddress = getPoolAddress(tokenIn, tokenOut);
  const invertPrice = tokenOut.toLowerCase() < tokenIn.toLowerCase();

  // get current price (sqrtPriceX96)
  const sqrtPriceX96 = await getSqrtPriceX96(poolAddress);

  const { amountOut: maxAmountOut } = await quoteExactInput(tokenIn, tokenOut, totalAmount);
  if (maxAmountOut === BigInt(0)) return BigInt(0); // no liquidity

  let lowerBound = BigInt(0);
  let upperBound = maxAmountOut;

  // estimate amountOut
  let amountOut = estimateAmountOutForBalance(totalAmount, sqrtPriceX96, invertPrice);
  if (amountOut > upperBound) amountOut = upperBound;

  let iterations = 0;
  while (upperBound - lowerBound > tolerance && iterations < maxIterations) {
    // simulate exact output swap
    const { amountIn, sqrtPriceX96After } = await quoteExactOutput(tokenIn, tokenOut, amountOut);

    const delta = totalAmount - (amountIn + amountOut);

    if (delta < 0) {
      upperBound = amountOut;
    } else {
      lowerBound = amountOut;
      if (delta <= tolerance) break;
    }

    let step = estimateAmountOutForBalance(delta, sqrtPriceX96After, invertPrice);
    if (step === BigInt(0)) step = delta < 0 ? BigInt(-1) : BigInt(1);

    let nextAmountOut = amountOut + step;
    if (nextAmountOut <= lowerBound) nextAmountOut = lowerBound + BigInt(1);
    if (nextAmountOut >= upperBound) nextAmountOut = upperBound - BigInt(1);

    amountOut = nextAmountOut;

    iterations++;
  }

  return lowerBound;
};

export default function useRedeemAmount(
  marketId?: `0x${string}`,
  outcome: Outcome = Outcome.Yes,
  amount: bigint = BigInt(1e18),
  tolerance: bigint = BigInt(1)
) {
  const { data: market } = useMarket(marketId);

  return useQuery({
    queryKey: ["redeemAmount", marketId, outcome, amount.toString()],
    queryFn: () => {
      if (!market) return;

      const [tokenIn, tokenOut] =
        outcome === Outcome.Yes ? [market.longToken, market.shortToken] : [market.shortToken, market.longToken];

      return calculateOptimalRedeemAmount(tokenIn, tokenOut, amount, tolerance);
    },
    enabled: !!market,
  });
}
