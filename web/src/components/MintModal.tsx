"use client";

import React, { useMemo } from "react";
import { zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";

import { erc20Abi } from "viem";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalProps, Divider } from "@nextui-org/react";

import useMarket, { Outcome } from "@/hooks/useMarket";

import ActionGuard from "./ActionGuard";
import MintButton from "./MintButton";

type MintModalProps = Omit<ModalProps, "children"> & {
  marketId: `0x${string}`;
  outcome: Outcome;
  amount?: number;
  onMint?: () => void;
};

const FLIPSIDE_ADDRESS = process.env.NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS;

export default function MintModal({ marketId, outcome, amount = 1, onMint = () => {}, ...props }: MintModalProps) {
  const { address, isConnected } = useAccount();

  const { data: market } = useMarket(marketId);

  const { data: balance } = useReadContract({
    address: market?.collateralToken,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    query: {
      enabled: isConnected && !!market,
    },
  });

  const price = useMemo(() => (market?.unitPrice ?? BigInt(0)) * BigInt(amount), [market, amount]);
  const sufficientBalance = useMemo(() => !!balance && balance >= price, [balance, price]);

  return (
    <Modal {...props}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Buy {outcome == Outcome.YES ? "Yes" : "No"}</ModalHeader>
            <ModalBody>
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{market?.title}</h3>
                  <p className="text-sm">{market?.description}</p>
                </div>
                <Divider />
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">You pay</span>
                    <span className="font-medium">${amount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">You receive (estimated)</span>
                    <span className="font-medium">100 YES tokens</span>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              {market && (
                <ActionGuard
                  token={market.collateralToken}
                  amount={price}
                  spender={FLIPSIDE_ADDRESS}
                  buttonProps={{ className: "w-full" }}
                >
                  <MintButton
                    marketId={marketId}
                    outcome={outcome}
                    amount={amount}
                    isDisabled={!sufficientBalance}
                    className="w-full"
                    color="primary"
                    onMint={() => {
                      onMint();
                      onClose();
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
