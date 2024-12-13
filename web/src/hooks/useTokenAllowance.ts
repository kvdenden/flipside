"use client";

import { useAccount, useReadContract } from "wagmi";
import { erc20Abi, zeroAddress } from "viem";

export default function useTokenAllowance(spender: `0x${string}`, token?: `0x${string}`) {
  const { address = zeroAddress, isConnected } = useAccount();

  return useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address, spender],
    query: {
      enabled: isConnected && !!token,
    },
  });
}
