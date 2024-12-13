"use client";

import { useEffect } from "react";
import { Button, ButtonProps } from "@nextui-org/react";

import { zeroAddress } from "viem";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";

import { marketAbi } from "@/web3/abi";

import useMarket from "@/hooks/useMarket";
import { getLoadingText } from "@/util/loading";

const MARKET_ABI = marketAbi;

type SettleButtonProps = Omit<ButtonProps, "children"> & {
  label?: string;
  loadingLabel?: string;
  marketId: `0x${string}`;
  longAmount: bigint;
  shortAmount: bigint;
  onSettle?: () => void;
};

export default function SettleButton({
  label = "Settle",
  loadingLabel = getLoadingText(label),
  marketId,
  longAmount,
  shortAmount,
  onSettle = () => {},
  ...props
}: SettleButtonProps) {
  const { address, isConnected } = useAccount();

  const { data: market } = useMarket(marketId);

  const settleOutcome = useWriteContract();
  const settleOutcomeReceipt = useWaitForTransactionReceipt({ hash: settleOutcome.data });

  useEffect(() => {
    if (settleOutcomeReceipt.isSuccess) {
      onSettle();
    }
  }, [onSettle, settleOutcomeReceipt]);

  const isDisabled = !isConnected || !market?.resolved;
  const isLoading = settleOutcome.isPending || settleOutcomeReceipt.isLoading;

  return (
    <Button
      onPress={() => {
        settleOutcome.writeContract({
          address: marketId,
          abi: MARKET_ABI,
          functionName: "settle",
          args: [address ?? zeroAddress, longAmount, shortAmount],
        });
      }}
      isDisabled={isDisabled}
      isLoading={isLoading}
      {...props}
    >
      {isLoading ? loadingLabel : label}
    </Button>
  );
}
