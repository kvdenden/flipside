"use client";

import { useEffect } from "react";
import { Button, ButtonProps } from "@nextui-org/react";

import { zeroAddress } from "viem";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";

import { flipsideAbi } from "@/web3/abi";

import Outcome from "@/util/outcome";
import { getLoadingText } from "@/util/loading";

const FLIPSIDE_ADDRESS = process.env.NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS;
const FLIPSIDE_ABI = flipsideAbi;

type RedeemButtonProps = Omit<ButtonProps, "children"> & {
  label?: string;
  loadingLabel?: string;
  marketId: `0x${string}`;
  outcome: Outcome;
  amount: bigint;
  amountInMax: bigint;
  onRedeem?: () => void;
};

export default function RedeemButton({
  label = "Redeem",
  loadingLabel = getLoadingText(label),
  marketId,
  outcome,
  amount,
  amountInMax,
  onRedeem = () => {},
  ...props
}: RedeemButtonProps) {
  const { address, isConnected } = useAccount();

  const redeemOutcome = useWriteContract();
  const redeemOutcomeReceipt = useWaitForTransactionReceipt({ hash: redeemOutcome.data });

  useEffect(() => {
    if (redeemOutcomeReceipt.isSuccess) {
      onRedeem();
    }
  }, [onRedeem, redeemOutcomeReceipt]);

  const isDisabled = !isConnected;
  const isLoading = redeemOutcome.isPending || redeemOutcomeReceipt.isLoading;

  return (
    <Button
      onPress={() => {
        redeemOutcome.writeContract({
          address: FLIPSIDE_ADDRESS,
          abi: FLIPSIDE_ABI,
          functionName: "redeemOutcome",
          args: [marketId, address ?? zeroAddress, amount, amountInMax, outcome === Outcome.Yes],
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
