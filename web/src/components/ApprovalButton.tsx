"use client";

import { useEffect } from "react";

import { erc20Abi } from "viem";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { Button, ButtonProps } from "@nextui-org/react";

type ApprovalButtonProps = Omit<ButtonProps, "children"> & {
  token: `0x${string}`;
  amount: bigint;
  spender: `0x${string}`;
  onApprove?: () => void;
};

export default function ApprovalButton(props: ApprovalButtonProps) {
  const { token, amount, spender, onApprove = () => {}, ...buttonProps } = props;
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
      {...buttonProps}
    >
      {isLoading ? "Approving..." : "Approve"}
    </Button>
  );
}
