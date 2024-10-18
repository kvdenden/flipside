"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalProps } from "@nextui-org/react";
import useMarket, { Outcome } from "@/hooks/useMarket";
import MintButton from "./MintButton";
import ApprovalButton from "./ApprovalButton";

type MintModalProps = Omit<ModalProps, "children"> & {
  marketId: `0x${string}`;
  outcome: Outcome;
  amount?: number;
};

export default function MintModal({ marketId, outcome, amount = 1, ...props }: MintModalProps) {
  const { data: market } = useMarket(marketId);

  return (
    <Modal {...props}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">Mint</ModalHeader>
            <ModalBody>
              <h2>{market?.title}</h2>
              <p>{market?.description}</p>
            </ModalBody>
            <ModalFooter>
              {market && <ApprovalButton token={market.collateralToken} amount={market.unitPrice} />}
              <MintButton marketId={marketId} outcome={outcome} amount={amount} />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
