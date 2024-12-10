"use client";

import { useEffect } from "react";
import { Button, ButtonProps } from "@nextui-org/react";

import { zeroAddress } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { flipsideAbi } from "@/web3/abi";

const FLIPSIDE_ADDRESS = process.env.NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS;
const FLIPSIDE_ABI = flipsideAbi;

type MintPairButtonProps = Omit<ButtonProps, "children"> & {
  marketId: `0x${string}`;
  amount?: number;
  onMint?: () => void;
};

export default function MintPairButton({ marketId, amount = 1, onMint = () => {}, ...props }: MintPairButtonProps) {
  const { address, isConnected } = useAccount();

  const mintPair = useWriteContract();
  const mintPairReceipt = useWaitForTransactionReceipt({ hash: mintPair.data });

  useEffect(() => {
    if (mintPairReceipt.isSuccess) {
      onMint();
    }
  }, [onMint, mintPairReceipt]);

  const isDisabled = !isConnected;
  const isLoading = mintPair.isPending || mintPairReceipt.isLoading;

  return (
    <Button
      onPress={() => {
        mintPair.writeContract({
          address: FLIPSIDE_ADDRESS,
          abi: FLIPSIDE_ABI,
          functionName: "mintPair",
          args: [marketId, address ?? zeroAddress, BigInt(amount * 1e18)],
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
