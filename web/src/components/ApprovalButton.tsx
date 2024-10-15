"use client";

import { erc20Abi } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { Button } from "@nextui-org/react";

const FLIPSIDE_ADDRESS = process.env.NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS;

type ApprovalButtonProps = {
  token: `0x${string}`;
  amount: bigint;
};

export default function ApprovalButton({ token, amount }: ApprovalButtonProps) {
  const { isConnected } = useAccount();

  const approve = useWriteContract();
  const approveReceipt = useWaitForTransactionReceipt({ hash: approve.data });

  return (
    <Button
      onClick={() => {
        approve.writeContract({
          address: token,
          abi: erc20Abi,
          functionName: "approve",
          args: [FLIPSIDE_ADDRESS, amount],
        });
      }}
      isDisabled={!isConnected}
      isLoading={approve.isPending || approveReceipt.isLoading}
    >
      Approve
    </Button>
  );
}
