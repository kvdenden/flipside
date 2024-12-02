"use client";

import React, { useMemo } from "react";
import { zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";

import { erc20Abi } from "viem";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalProps,
  Divider,
  Skeleton,
} from "@nextui-org/react";

import Outcome from "@/util/outcome";
import useMarket from "@/hooks/useMarket";
import useQuote from "@/hooks/useQuote";

import ActionGuard from "./ActionGuard";
import MintButton from "./MintButton";
import useToken from "@/hooks/useToken";
import TokenAmount from "./TokenAmount";

type MintModalProps = {
  marketId: `0x${string}`;
  outcome: Outcome;
  amount?: number;
  onMint?: () => void;
};

const FLIPSIDE_ADDRESS = process.env.NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS;

function MintModal({
  marketId,
  outcome,
  amount = 1,
  onMint = () => {},
  ...props
}: Omit<ModalProps, "children"> & MintModalProps) {
  const { address, isConnected } = useAccount();

  const { data: market } = useMarket(marketId);
  const { data: collateralToken } = useToken(market?.collateralToken);

  const amountIn = BigInt(amount * 1e18);
  const { data: amountOut = BigInt(0), isLoading: quoteIsLoading } = useQuote(marketId, outcome, amountIn);

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
            <ModalHeader className="flex flex-col gap-1">Buy {outcome == Outcome.Yes ? "Yes" : "No"}</ModalHeader>
            <ModalBody>
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{market?.title}</h3>
                  <p className="text-sm">{market?.description}</p>
                </div>
                <Divider />
                <div>
                  <Skeleton isLoaded={!quoteIsLoading}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">You pay</span>
                      <span className="font-medium">
                        <TokenAmount amount={price} address={collateralToken?.address} />
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">You receive (estimated)</span>
                      <span className="font-medium">
                        <TokenAmount
                          amount={amountIn + amountOut}
                          address={outcome === Outcome.Yes ? market?.longToken : market?.shortToken}
                          options={{ symbol: outcome === Outcome.Yes ? "YES" : "NO", precision: 2 }}
                        />
                      </span>
                    </div>
                  </Skeleton>
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

export default NiceModal.create((props: MintModalProps) => {
  const modal = useModal();

  return <MintModal isOpen={modal.visible} onClose={modal.hide} {...props} />;
});
