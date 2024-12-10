"use client";

import React, { useMemo, useState } from "react";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalProps,
  Button,
  ButtonGroup,
  Divider,
  Input,
} from "@nextui-org/react";

import useMarket from "@/hooks/useMarket";

import ActionGuard from "./ActionGuard";
import MintPairButton from "./MintPairButton";
import useToken from "@/hooks/useToken";
import TokenAmount from "./TokenAmount";
import { Minus, Plus } from "lucide-react";

export type MintLiquidityModalProps = {
  marketId: `0x${string}`;
  onMint?: () => void;
};

const FLIPSIDE_ADDRESS = process.env.NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS;

function MintLiquidityModal({
  marketId,
  onMint = () => {},
  ...props
}: Omit<ModalProps, "children"> & MintLiquidityModalProps) {
  const [amount, setAmount] = useState(10);

  const { data: market } = useMarket(marketId);
  const { data: collateralToken } = useToken(market?.collateralToken);

  const price = useMemo(() => (market?.unitPrice ?? BigInt(0)) * BigInt(amount), [market, amount]);

  return (
    <Modal {...props}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">Provide Liquidity</ModalHeader>
            <ModalBody>
              <div className="grid gap-6">
                <p>Earn fees by providing liquidity to the YES/NO trading pool.</p>
                <div>
                  <label className="block font-semibold mb-2">Amount</label>
                  <ButtonGroup fullWidth>
                    <Button isIconOnly onPress={() => setAmount((x) => Math.max(0, x - 10))}>
                      <Minus />
                    </Button>
                    <Input
                      radius="none"
                      type="number"
                      min={0}
                      value={amount.toString()}
                      onChange={(e) => {
                        const parsedAmount = parseInt(e.target.value);
                        if (!isNaN(parsedAmount)) {
                          setAmount(parsedAmount);
                        }
                      }}
                      classNames={{ input: "text-center hide-spinners" }}
                    />
                    <Button isIconOnly onPress={() => setAmount((x) => x + 10)}>
                      <Plus />
                    </Button>
                  </ButtonGroup>
                </div>
                <Divider />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">You pay</span>
                    <span className="font-medium">
                      <TokenAmount amount={price} address={collateralToken?.address} />
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">You receive</span>
                    <span className="font-medium">
                      {amount} YES + {amount} NO
                    </span>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="flex flex-col justify-center">
              {market && (
                <ActionGuard
                  token={market.collateralToken}
                  amount={price}
                  spender={FLIPSIDE_ADDRESS}
                  buttonProps={{ className: "w-full" }}
                >
                  <MintPairButton
                    marketId={marketId}
                    amount={amount}
                    isDisabled={!amount}
                    className="w-full"
                    color="primary"
                    onMint={() => {
                      onMint();
                    }}
                  />
                </ActionGuard>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default NiceModal.create((props: MintLiquidityModalProps) => {
  const modal = useModal();

  return <MintLiquidityModal isOpen={modal.visible} onClose={modal.hide} {...props} />;
});
