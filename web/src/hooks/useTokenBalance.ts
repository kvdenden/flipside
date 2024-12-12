"use client";

import { useAccount, useReadContract } from "wagmi";
import { erc20Abi, zeroAddress } from "viem";

export default function useTokenBalance(token?: `0x${string}`) {
  const { address = zeroAddress, isConnected } = useAccount();

  return useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    query: {
      enabled: isConnected,
    },
  });
}
