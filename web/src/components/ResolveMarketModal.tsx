"use client";

import { useCallback, useState } from "react";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalProps } from "@nextui-org/react";

import NiceModal, { useModal } from "@ebay/nice-modal-react";

import { Outcome } from "@/hooks/useMarket";
import ActionGuard from "./ActionGuard";
import ResolveMarketButton from "./ResolveMarketButton";
import useBond from "@/hooks/useBond";
import { zeroAddress } from "viem";
import SelectOutcome from "./SelectOutcome";
import TokenAmount from "./TokenAmount";

const RESOLVER_ADDRESS = process.env.NEXT_PUBLIC_RESOLVER_CONTRACT_ADDRESS;

type ResolveMarketModalProps = {
  marketId: `0x${string}`;
  onResolve?: () => void;
};

function ResolveMarketModal({
  marketId,
  onResolve = () => {},
  ...props
}: Omit<ModalProps, "children"> & ResolveMarketModalProps) {
  const [outcome, setOutcome] = useState<Outcome>(Outcome.Yes);
  const { data: bond, isLoading } = useBond();

  return (
    <Modal scrollBehavior="inside" {...props}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">Propose Market Resolution</ModalHeader>
            <ModalBody>
              <SelectOutcome onSelect={setOutcome} />
              Bond: <TokenAmount amount={bond ? bond.amount : BigInt(0)} address={bond ? bond.currency : zeroAddress} />
            </ModalBody>
            <ModalFooter>
              <ActionGuard
                isLoading={isLoading}
                token={bond ? bond.currency : zeroAddress}
                amount={bond ? bond.amount : BigInt(0)}
                spender={RESOLVER_ADDRESS}
                buttonProps={{ className: "w-full" }}
              >
                <ResolveMarketButton marketId={marketId} outcome={outcome} onResolve={onResolve} className="w-full" />
              </ActionGuard>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default NiceModal.create((props: ResolveMarketModalProps) => {
  const modal = useModal();

  const onResolve = useCallback(() => {
    if (modal.visible) modal.hide();
  }, [modal]);

  return <ResolveMarketModal isOpen={modal.visible} onClose={modal.hide} onResolve={onResolve} {...props} />;
});
