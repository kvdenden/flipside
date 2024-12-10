"use client";

import { useCallback } from "react";
import Link from "next/link";
import { Button, Card, CardBody, Skeleton } from "@nextui-org/react";
import { Clock } from "lucide-react";

import useMarket from "@/hooks/useMarket";

import Outcome from "@/util/outcome";
import OutcomeLabel from "./OutcomeLabel";
import useOutcomePercentage from "@/hooks/useOutcomePercentage";
import { openMintModal } from "@/util/modals";

type MarketCardProps = {
  marketId: `0x${string}`;
};

function MintActions({ marketId, onMint = () => {} }: { marketId: `0x${string}`; onMint?: () => void }) {
  return (
    <div className="flex gap-2">
      <Button
        color="success"
        className="flex-1"
        onPress={() => openMintModal({ marketId, outcome: Outcome.Yes, amount: 1, onMint })}
      >
        Buy Yes
      </Button>
      <Button
        color="danger"
        className="flex-1"
        onPress={() => openMintModal({ marketId, outcome: Outcome.No, amount: 1, onMint })}
      >
        Buy No
      </Button>
    </div>
  );
}

export default function MarketCard({ marketId }: MarketCardProps) {
  const { data: market } = useMarket(marketId);
  const { data: yesPercentage, refetch } = useOutcomePercentage(marketId);

  const onMint = useCallback(() => {
    refetch();
  }, [refetch]);

  if (!market) return null;

  return (
    <>
      <Card>
        <CardBody className="p-4">
          <div className="flex space-x-4 mb-4">
            <div className="flex-grow">
              <h3 className="font-semibold">
                <Link href={`/markets/${marketId}`}>{market.title}</Link>
              </h3>
            </div>
            <div className="text-center">
              <Skeleton isLoaded={!!yesPercentage}>
                <p className="text-xl font-semibold">{yesPercentage}%</p>
                <p className="text-gray-400 text-sm">chance</p>
              </Skeleton>
            </div>
          </div>
          <div className="mb-4">
            {market.resolved ? (
              <p className="flex items-center gap-2 font-semibold text-xl">
                Outcome: <OutcomeLabel outcome={market.outcome!} className="uppercase" />
              </p>
            ) : (
              <MintActions marketId={marketId} onMint={onMint} />
            )}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Clock size={16} className="mr-2" />
            {market.expirationDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
          {/* <div>
            <Button onPress={openResolutionDialog}>Resolve</Button>
          </div> */}
        </CardBody>
      </Card>
    </>
  );
}
