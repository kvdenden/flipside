"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, ButtonGroup, Slider } from "@nextui-org/react";

import { openMintModal } from "@/util/modals";
import Outcome from "@/util/outcome";
import TokenAmount from "@/components/TokenAmount";

import useMarket from "@/hooks/useMarket";
import useOutcomePercentage from "@/hooks/useOutcomePercentage";
import useQuote from "@/hooks/useQuote";

export default function MintForm({ marketId }: { marketId: `0x${string}` }) {
  const [outcome, setOutcome] = useState(Outcome.Yes);
  const [amount, setAmount] = useState(1);

  const { data: market } = useMarket(marketId);

  const { data: yesPercentage } = useOutcomePercentage(marketId, Outcome.Yes);
  const { data: noPercentage } = useOutcomePercentage(marketId, Outcome.No);

  const amountIn = BigInt(amount * 1e18);
  const { data: amountOut } = useQuote(marketId, outcome, amountIn);

  const [totalAmount, setTotalAmount] = useState(BigInt(0));
  useEffect(() => {
    if (!amountIn) setTotalAmount(amountIn);
    else if (amountOut) setTotalAmount(amountIn + amountOut);
  }, [amountIn, amountOut]);

  const price = useMemo(() => (market?.unitPrice ?? BigInt(0)) * BigInt(amount), [market, amount]);

  if (!market) return null;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block font-semibold mb-2">Outcome</label>
        <ButtonGroup fullWidth>
          <Button
            color={outcome === Outcome.Yes ? "success" : "default"}
            onPress={() => setOutcome(Outcome.Yes)}
            className="font-semibold"
          >
            Yes {yesPercentage}%
          </Button>
          <Button
            color={outcome === Outcome.No ? "danger" : "default"}
            onPress={() => setOutcome(Outcome.No)}
            className="font-semibold"
          >
            No {noPercentage}%
          </Button>
        </ButtonGroup>
      </div>
      <div>
        <label className="block font-semibold mb-2">Amount</label>
        <Slider
          aria-label="Value"
          value={amount}
          minValue={1}
          maxValue={100}
          onChange={(value) => setAmount(value as number)}
        />
        {/* <ButtonGroup fullWidth>
          <Button isIconOnly onPress={() => setAmount((x) => Math.max(1, x - 1))}>
            <Minus />
          </Button>
          <Input
            radius="none"
            type="number"
            min={1}
            max={100}
            value={amount.toString()}
            onChange={(e) => {
              const parsedAmount = parseInt(e.target.value);
              if (!isNaN(parsedAmount)) {
                const clampedAmount = Math.min(Math.max(parsedAmount, 1), 100);
                setAmount(clampedAmount);
              }
            }}
            classNames={{ input: "text-center hide-spinners" }}
          />
          <Button isIconOnly onPress={() => setAmount((x) => Math.min(100, x + 1))}>
            <Plus />
          </Button>
        </ButtonGroup> */}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-gray-400">You pay</div>
          <div>
            <TokenAmount amount={price} address={market.collateralToken} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-gray-400">You receive (estimated)</div>
          <div>
            <TokenAmount
              amount={totalAmount}
              address={outcome === Outcome.Yes ? market.longToken : market.shortToken}
              options={{ symbol: outcome === Outcome.Yes ? "YES" : "NO", precision: 2 }}
            />
          </div>
        </div>
      </div>
      <Button type="submit" color="primary" fullWidth onPress={() => openMintModal({ marketId, outcome, amount })}>
        Buy
      </Button>
    </div>
  );
}
