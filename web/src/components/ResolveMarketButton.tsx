"use client";

import { useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSimulateContract } from "wagmi";

import { Button, ButtonProps } from "@nextui-org/react";
import { Outcome } from "@/hooks/useMarket";
import { resolverAbi } from "@/web3/abi";

const RESOLVER_ADDRESS = process.env.NEXT_PUBLIC_RESOLVER_CONTRACT_ADDRESS;
const RESOLVER_ABI = resolverAbi;

type ResolveMarketButtonProps = Omit<ButtonProps, "children"> & {
  marketId: `0x${string}`;
  outcome: Outcome;
  onResolve?: () => void;
};

export default function ResolveMarketButton({
  marketId,
  outcome,
  onResolve = () => {},
  ...props
}: ResolveMarketButtonProps) {
  const { isConnected } = useAccount();

  const sim = useSimulateContract({
    address: RESOLVER_ADDRESS,
    abi: RESOLVER_ABI,
    functionName: "assertOutcome",
    args: [marketId, outcome],
  });

  console.log("sim", sim);

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
      {isLoading ? "Submitting..." : "Submit"}
    </Button>
  );
}
