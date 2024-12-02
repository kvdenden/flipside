"use client";

import { useEffect } from "react";
import { zeroAddress } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { Button, ButtonProps } from "@nextui-org/react";
import Outcome from "@/util/outcome";
import { flipsideAbi } from "@/web3/abi";

const FLIPSIDE_ADDRESS = process.env.NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS;
const FLIPSIDE_ABI = flipsideAbi;

type MintButtonProps = Omit<ButtonProps, "children"> & {
  marketId: `0x${string}`;
  outcome: Outcome;
  amount?: number;
  onMint?: () => void;
};

export default function MintButton({ marketId, outcome, amount = 1, onMint = () => {}, ...props }: MintButtonProps) {
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
      {isLoading ? "Minting..." : "Mint"}
    </Button>
  );
}
