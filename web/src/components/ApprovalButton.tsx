"use client";

import { useEffect } from "react";
import { Button, ButtonProps } from "@nextui-org/react";

import { erc20Abi } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { getLoadingText } from "@/util/loading";

type ApprovalButtonProps = Omit<ButtonProps, "children"> & {
  label?: string;
  loadingLabel?: string;
  token: `0x${string}`;
  amount: bigint;
  spender: `0x${string}`;
  onApprove?: () => void;
};

export default function ApprovalButton({
  label = "Approve",
  loadingLabel = getLoadingText(label),
  token,
  amount,
  spender,
  onApprove = () => {},
  ...props
}: ApprovalButtonProps) {
  const { isConnected } = useAccount();

  const approve = useWriteContract();
  const approveReceipt = useWaitForTransactionReceipt({ hash: approve.data });

  useEffect(() => {
    if (approveReceipt.isSuccess) {
      onApprove();
    }
  }, [onApprove, approveReceipt]);

  const isDisabled = !isConnected;
  const isLoading = approve.isPending || approveReceipt.isLoading;

  return (
    <Button
      onPress={() => {
        approve.writeContract({
          address: token,
          abi: erc20Abi,
          functionName: "approve",
          args: [spender, amount],
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
