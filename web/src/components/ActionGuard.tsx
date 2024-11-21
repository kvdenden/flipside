import { useCallback, type ReactNode } from "react";

import { erc20Abi, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";

import { Button, type ButtonProps } from "@nextui-org/react";

import ConnectButton from "./ConnectButton";
import ApprovalButton from "./ApprovalButton";
import { useQueryClient } from "@tanstack/react-query";

type ActionGuardProps = {
  token: `0x${string}`;
  amount: bigint;
  spender: `0x${string}`;
  approveMax?: boolean;
  buttonProps?: ButtonProps;
  children: ReactNode;
};

export default function ActionGuard({ token, amount, spender, buttonProps, children }: ActionGuardProps) {
  const { address = zeroAddress, isConnected } = useAccount();

  const queryClient = useQueryClient();

  const { isLoading: isBalanceLoading, data: balance = BigInt(0) } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: isConnected,
      refetchInterval: 10000,
    },
  });

  const {
    isLoading: isAllowanceLoading,
    data: allowance = BigInt(0),
    refetch: refetchAllowance,
    queryKey,
  } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address, spender],
    query: {
      enabled: isConnected,
    },
  });

  const onApprove = useCallback(
    (amount: bigint) => {
      queryClient.setQueryData(queryKey, amount); // optimistic update
      refetchAllowance();
    },
    [queryClient, queryKey, refetchAllowance]
  );

  const sufficientAllowance = allowance >= amount;
  const sufficientBalance = balance >= amount;

  if (isBalanceLoading || isAllowanceLoading) return <Button variant="ghost" isLoading {...buttonProps} />;

  if (!isConnected) return <ConnectButton {...buttonProps} />;

  if (!sufficientAllowance)
    return (
      <ApprovalButton
        token={token}
        spender={spender}
        amount={amount}
        onApprove={() => onApprove(amount)}
        {...buttonProps}
      />
    );

  if (!sufficientBalance)
    return (
      <Button isDisabled {...buttonProps}>
        Insufficient Balance
      </Button>
    );

  return <>{children}</>;
}
