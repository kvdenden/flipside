"use client";

import { useEffect } from "react";
import { Button, ButtonProps } from "@nextui-org/react";

import { zeroAddress } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { flipsideAbi } from "@/web3/abi";

import Outcome from "@/util/outcome";
import { getLoadingText } from "@/util/loading";

const FLIPSIDE_ADDRESS = process.env.NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS;
const FLIPSIDE_ABI = flipsideAbi;

type MintButtonProps = Omit<ButtonProps, "children"> & {
  label?: string;
  loadingLabel?: string;
  marketId: `0x${string}`;
  outcome: Outcome;
  amount?: number;
  onMint?: () => void;
};

export default function MintButton({
  label = "Mint",
  loadingLabel = getLoadingText(label),
  marketId,
  outcome,
  amount = 1,
  onMint = () => {},
  ...props
}: MintButtonProps) {
  const { address, isConnected } = useAccount();

  const mintOutcome = useWriteContract();
  const mintOutcomeReceipt = useWaitForTransactionReceipt({ hash: mintOutcome.data });

  useEffect(() => {
    if (mintOutcomeReceipt.isSuccess) {
      onMint();
    }
  }, [onMint, mintOutcomeReceipt]);

  const isDisabled = !isConnected;
  const isLoading = mintOutcome.isPending || mintOutcomeReceipt.isLoading;

  return (
    <Button
      onPress={() => {
        mintOutcome.writeContract({
          address: FLIPSIDE_ADDRESS,
          abi: FLIPSIDE_ABI,
          functionName: "mintOutcome",
          args: [marketId, address ?? zeroAddress, BigInt(amount * 1e18), BigInt(0), outcome === Outcome.Yes],
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
