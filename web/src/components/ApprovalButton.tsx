"use client";

import { erc20Abi } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { Button, ButtonProps } from "@nextui-org/react";

const FLIPSIDE_ADDRESS = process.env.NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS;

type ApprovalButtonProps = ButtonProps & {
  token: `0x${string}`;
  amount: bigint;
};

export default function ApprovalButton({ token, amount, ...props }: ApprovalButtonProps) {
  const { isConnected } = useAccount();

  const approve = useWriteContract();
  const approveReceipt = useWaitForTransactionReceipt({ hash: approve.data });

  const isDisabled = !isConnected;
  const isLoading = approve.isPending || approveReceipt.isLoading;

  return (
    <Button
      onPress={() => {
        approve.writeContract({
          address: token,
          abi: erc20Abi,
          functionName: "approve",
          args: [FLIPSIDE_ADDRESS, amount],
        });
      }}
      isDisabled={isDisabled}
      isLoading={isLoading}
      {...props}
    >
      {isLoading ? "Approving..." : "Approve"}
    </Button>
  );
}
