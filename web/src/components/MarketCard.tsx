"use client";

import { Button, Card, CardBody, Progress, useDisclosure } from "@nextui-org/react";

import useMarket, { Outcome } from "@/hooks/useMarket";
import usePool from "@/hooks/usePool";

import MintModal from "./MintModal";
import { useState } from "react";
// import ApprovalButton from "./ApprovalButton";

type MarketCardProps = {
  marketId: `0x${string}`;
};

export default function MarketCard({ marketId }: MarketCardProps) {
  const { data: market } = useMarket(marketId);
  const { data: pool } = usePool(marketId);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [outcome, setOutcome] = useState<Outcome>(Outcome.YES);

  const handleMint = (outcome: Outcome) => {
    setOutcome(outcome);
    onOpen();
  };

  if (!market) return null;

  const yesPercentage = pool && parseInt(pool.token0Price.add(1).invert().multiply(100).toFixed(0));

  return (
    <>
      <Card className="w-full bg-gray-800 text-white">
        <CardBody className="p-4">
          <div className="flex flex-col mb-2">
            <h3 className="text-lg font-semibold mb-2">{market.description}</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">Yes</span>
              <span className="text-sm">{yesPercentage}%</span>
            </div>
            <Progress color="primary" value={yesPercentage} className="my-2" aria-label="Yes percentage" />
          </div>
          <div className="flex gap-2 mb-4">
            <Button color="success" className="flex-1" onPress={() => handleMint(Outcome.YES)}>
              Buy Yes ↑
            </Button>
            <Button color="danger" className="flex-1" onPress={() => handleMint(Outcome.NO)}>
              Buy No ↓
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
      <MintModal marketId={marketId} outcome={outcome} amount={1} isOpen={isOpen} onOpenChange={onOpenChange} />
    </>
  );
}
