"use client";

import { useEffect, useState } from "react";
import { Button, ButtonGroup } from "@nextui-org/react";

import Outcome from "@/util/outcome";
import { formatValue } from "@/util/numbers";

import useMarket from "@/hooks/useMarket";
import useTokenBalance from "@/hooks/useTokenBalance";
import TokenAmountInput from "./TokenAmountInput";
import useRedeemAmount from "@/hooks/useRedeemAmount";

export default function RedeemForm({ marketId }: { marketId: `0x${string}` }) {
  const [outcome, setOutcome] = useState(Outcome.Yes);
  const [amount, setAmount] = useState(BigInt(0));

  const { data: market } = useMarket(marketId);
  const { data: longAmount = BigInt(0) } = useTokenBalance(market?.longToken);
  const { data: shortAmount = BigInt(0) } = useTokenBalance(market?.shortToken);

  const { data: redeemAmount = BigInt(0) } = useRedeemAmount(marketId, outcome, amount);

  const maxAmount = outcome === Outcome.Yes ? longAmount : shortAmount;

  useEffect(() => {
    setAmount(BigInt(0));
  }, [outcome]);

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
            Yes
          </Button>
          <Button
            color={outcome === Outcome.No ? "danger" : "default"}
            onPress={() => setOutcome(Outcome.No)}
            className="font-semibold"
          >
            No
          </Button>
        </ButtonGroup>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block font-semibold">Amount</label>
          <div className="text-xs text-gray-400">
            <Button
              color="secondary"
              size="sm"
              variant="flat"
              radius="full"
              className="h-6"
              title={formatValue(maxAmount, 18, { precision: 18 })}
              onPress={() => setAmount(maxAmount)}
            >
              Available: {formatValue(maxAmount, 18)}
            </Button>
          </div>
        </div>
        <TokenAmountInput
          address={outcome === Outcome.Yes ? market.longToken : market.shortToken}
          value={amount}
          onValueChange={setAmount}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-gray-400">Redeem amount</div>
          <div>{formatValue(redeemAmount)}</div>
        </div>
      </div>
    </div>
  );
}
