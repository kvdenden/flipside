"use client";

import { useEffect } from "react";
import { Button, ButtonProps } from "@nextui-org/react";

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { resolverAbi } from "@/web3/abi";

import Outcome from "@/util/outcome";
import { getLoadingText } from "@/util/loading";

const RESOLVER_ADDRESS = process.env.NEXT_PUBLIC_RESOLVER_CONTRACT_ADDRESS;
const RESOLVER_ABI = resolverAbi;

type ResolveMarketButtonProps = Omit<ButtonProps, "children"> & {
  label?: string;
  loadingLabel?: string;
  marketId: `0x${string}`;
  outcome: Outcome;
  onResolve?: () => void;
};

export default function ResolveMarketButton({
  label = "Resolve",
  loadingLabel = getLoadingText(label),
  marketId,
  outcome,
  onResolve = () => {},
  ...props
}: ResolveMarketButtonProps) {
  const { isConnected } = useAccount();

  const resolveMarket = useWriteContract();
  const resolveMarketReceipt = useWaitForTransactionReceipt({ hash: resolveMarket.data });

  useEffect(() => {
    if (resolveMarketReceipt.isSuccess) {
      onResolve();
    }
  }, [onResolve, resolveMarketReceipt]);

  const isDisabled = !isConnected;
  const isLoading = resolveMarket.isPending || resolveMarketReceipt.isLoading;

  return (
    <Button
      onPress={() => {
        resolveMarket.writeContract({
          address: RESOLVER_ADDRESS,
          abi: RESOLVER_ABI,
          functionName: "assertOutcome",
          args: [marketId, outcome],
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
