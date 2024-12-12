"use client";

import { Button, Card, CardBody, Tab, Tabs, Spinner } from "@nextui-org/react";
import { Clock } from "lucide-react";

import { openMintLiquidityModal, openResolutionModal } from "@/util/modals";
import Outcome from "@/util/outcome";
import MintForm from "@/components/MintForm";

import useMarket from "@/hooks/useMarket";
import useOutcomePercentage from "@/hooks/useOutcomePercentage";
import SettleForm from "@/components/SettleForm";

type MarketPageProps = {
  params: {
    marketId: `0x${string}`;
  };
};

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

          <section className="bg-gray-800 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-bold">Market Description</h2>
            <p className="text-sm text-gray-400">{market.description}</p>
            {!market.resolved && <Button onPress={() => openResolutionModal({ marketId })}>Propose resolution</Button>}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          {market.resolved ? (
            <Card>
              <CardBody>
                <SettleForm marketId={marketId} />
              </CardBody>
            </Card>
          ) : (
            <>
              <Card>
                <CardBody>
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
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
