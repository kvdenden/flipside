"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, ButtonGroup, Card, CardBody, Slider, Tab, Tabs, Spinner } from "@nextui-org/react";
import { Clock } from "lucide-react";

import { openMintLiquidityModal, openMintModal, openResolutionModal } from "@/util/modals";
import Outcome from "@/util/outcome";
import OutcomeLabel from "@/components/OutcomeLabel";
import TokenAmount from "@/components/TokenAmount";

import useMarket from "@/hooks/useMarket";
import useToken from "@/hooks/useToken";
import useOutcomePercentage from "@/hooks/useOutcomePercentage";
import useQuote from "@/hooks/useQuote";

type MarketPageProps = {
  params: {
    marketId: `0x${string}`;
  };
};

function MintForm({ marketId }: { marketId: `0x${string}` }) {
  const [outcome, setOutcome] = useState(Outcome.Yes);
  const [amount, setAmount] = useState(1);

  const { data: market } = useMarket(marketId);
  const { data: collateralToken } = useToken(market?.collateralToken);

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

  if (!market || !collateralToken) return null;

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
            <TokenAmount amount={price} address={collateralToken?.address} />
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

export default function MarketPage({ params: { marketId } }: MarketPageProps) {
  const { data: market } = useMarket(marketId);
  const { data: yesPercentage } = useOutcomePercentage(marketId, Outcome.Yes);

  if (!market)
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner color="default" />
      </div>
    );

  return (
    <div className="flex flex-col flex-1">
      <div className="py-6 px-4">
        <h1 className="text-2xl font-bold mb-2">{market.title}</h1>
        <div className="flex items-center text-sm text-gray-400">
          <Clock size={16} className="mr-2" />
          {market.expirationDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="bg-gray-800 rounded-lg p-6">
            <p className="text-4xl font-bold mb-4">{yesPercentage}% chance</p>
            {/* Placeholder for Graph */}
            <div className="h-64 bg-gray-700 rounded"></div>
          </section>

          <section className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Market Description</h2>
            <p className="text-sm text-gray-400 mb-4">{market.description}</p>
            {market.resolved ? (
              <p className="flex items-center gap-2 font-semibold text-xl">
                Outcome: <OutcomeLabel outcome={market.outcome!} className="uppercase" />
              </p>
            ) : (
              <Button onPress={() => openResolutionModal({ marketId })}>Propose resolution</Button>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardBody>
              {market.resolved ? (
                <p className="flex items-center gap-2 font-semibold text-xl">Settle (TODO)</p>
              ) : (
                <>
                  <Tabs fullWidth>
                    <Tab key="mint" title="Buy">
                      <div>
                        <MintForm marketId={marketId} />
                      </div>
                    </Tab>
                    <Tab key="redeem" title="Sell">
                      <div>
                        <p className="font-semibold mb-2">Outcome</p>
                      </div>
                    </Tab>
                  </Tabs>
                  <p className="text-sm text-gray-400 text-center mt-2">
                    By trading, you agree to the <span className="underline">Terms of Use</span>
                  </p>
                </>
              )}
            </CardBody>
          </Card>
          <div className="flex">
            <Button
              color="default"
              variant="ghost"
              className="flex-1"
              onPress={() => openMintLiquidityModal({ marketId })}
            >
              Provide Liquidity
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
