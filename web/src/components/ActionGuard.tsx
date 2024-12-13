import { useCallback, type ReactNode } from "react";
import { Button, type ButtonProps } from "@nextui-org/react";
import { useQueryClient } from "@tanstack/react-query";

import { useAccount } from "wagmi";

import ConnectButton from "./ConnectButton";
import ApprovalButton from "./ApprovalButton";
import useTokenBalance from "@/hooks/useTokenBalance";
import useTokenAllowance from "@/hooks/useTokenAllowance";

type ActionGuardProps = {
  isLoading?: boolean;
  token?: `0x${string}`;
  amount?: bigint;
  spender?: `0x${string}`;
  approveMax?: boolean;
  buttonProps?: ButtonProps;
  children: ReactNode;
};

const FLIPSIDE_ADDRESS = process.env.NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS;

export default function ActionGuard({
  isLoading,
  token,
  amount = BigInt(0),
  spender = FLIPSIDE_ADDRESS,
  buttonProps,
  children,
}: ActionGuardProps) {
  const { isConnected } = useAccount();

  const queryClient = useQueryClient();

  const { isLoading: isBalanceLoading, data: balance = BigInt(0) } = useTokenBalance(token);

  const {
    isLoading: isAllowanceLoading,
    data: allowance = BigInt(0),
    refetch: refetchAllowance,
    queryKey,
  } = useTokenAllowance(spender, token);

  const onApprove = useCallback(
    (amount: bigint) => {
      queryClient.setQueryData(queryKey, amount); // optimistic update
      refetchAllowance();
    },
    [queryClient, queryKey, refetchAllowance]
  );

  const sufficientAllowance = allowance >= amount;
  const sufficientBalance = balance >= amount;

  if (isLoading || isBalanceLoading || isAllowanceLoading) return <Button variant="ghost" isLoading {...buttonProps} />;

  if (!isConnected) return <ConnectButton {...buttonProps} />;

  if (token && !sufficientAllowance)
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
