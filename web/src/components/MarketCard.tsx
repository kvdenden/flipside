"use client";

import { useCallback, useState } from "react";
import { Button, Card, CardBody, Progress, useDisclosure } from "@nextui-org/react";

import useMarket, { Outcome } from "@/hooks/useMarket";
import usePool from "@/hooks/usePool";

import MintModal from "./MintModal";

type MarketCardProps = {
  marketId: `0x${string}`;
};

export default function MarketCard({ marketId }: MarketCardProps) {
  const { data: market } = useMarket(marketId);
  const { data: pool, refetch: refetchPool } = usePool(marketId);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [outcome, setOutcome] = useState<Outcome>(Outcome.YES);

  const openMintDialog = (outcome: Outcome) => {
    setOutcome(outcome);
    onOpen();
  };

  const onMint = useCallback(() => {
    refetchPool();
  }, [refetchPool]);

  if (!market) return null;

  const longPrice = pool && (market.longToken == pool.token0.address ? pool.token0Price : pool.token1Price);
  const yesPercentage = longPrice && parseInt(longPrice.divide(longPrice.add(1)).multiply(100).toFixed(0));

  return (
    <>
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col mb-2">
            <h3 className="text-lg font-semibold mb-2">{market.title}</h3>
            <p className="text-sm text-gray-400">{market.description}</p>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm">Yes</span>
              <span className="text-sm">{yesPercentage}%</span>
            </div>
            <Progress color="primary" value={yesPercentage} className="my-2" aria-label="Yes percentage" />
          </div>
          <div className="flex gap-2 mb-4">
            <Button color="success" className="flex-1" onPress={() => openMintDialog(Outcome.YES)}>
              Yes
            </Button>
            <Button color="danger" className="flex-1" onPress={() => openMintDialog(Outcome.NO)}>
              No
            </Button>
          </div>
          {/* <div className="flex gap-2 mb-4">
          <ApprovalButton token={market.collateralToken} amount={market.unitPrice} />
        </div> */}
          <div className="flex justify-between text-sm text-gray-400">
            <span>$17.2m Vol.</span>
          </div>
        </CardBody>
      </Card>
      <MintModal
        marketId={marketId}
        outcome={outcome}
        amount={1}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onMint={onMint}
      />
    </>
  );
}
