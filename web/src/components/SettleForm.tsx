"use client";

import useMarket from "@/hooks/useMarket";
import useTokenBalance from "@/hooks/useTokenBalance";
import OutcomeLabel from "./OutcomeLabel";
import { Button } from "@nextui-org/react";
import TokenAmount from "./TokenAmount";
import { CircleAlert } from "lucide-react";

export default function SettleForm({ marketId }: { marketId: `0x${string}` }) {
  const { data: market } = useMarket(marketId);
  const { data: longAmount } = useTokenBalance(market?.longToken);
  const { data: shortAmount } = useTokenBalance(market?.shortToken);

  if (!market) return null;

  if (!market.resolved)
    return (
      <p className="flex items-center gap-2 font-semibold text-lg">
        <CircleAlert />
        Market not resolved yet
      </p>
    );

  const outcome = market.outcome!;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="flex items-center gap-2 font-semibold text-lg mb-2">
          Market resolved to <OutcomeLabel outcome={outcome} className="uppercase" />
        </p>
        <p className="text-sm text-gray-400">Redeem your tokens based on the market resolution</p>
      </div>
      <div className="space-y-2">
        <div className="text-gray-400">Your outcome tokens</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <TokenAmount
              amount={longAmount ?? BigInt(0)}
              address={market.longToken}
              options={{ symbol: "YES", precision: 2 }}
            />
          </div>
          <div>
            <TokenAmount
              amount={shortAmount ?? BigInt(0)}
              address={market.shortToken}
              options={{ symbol: "NO", precision: 2 }}
            />
          </div>
        </div>
      </div>
      {/* <div className="flex justify-between">
        <div className="text-gray-400">You receive</div>
        <div>
          <TokenAmount amount={BigInt(100 * 1e6)} address={market.collateralToken} options={{ precision: 2 }} />
        </div>
      </div> */}
      <Button type="submit" color="success" fullWidth>
        Redeem
      </Button>
    </div>
  );
}
