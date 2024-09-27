import { http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const chain = process.env.NEXT_PUBLIC_CHAIN === "mainnet" ? base : baseSepolia;
export const rpc =
  process.env.NEXT_PUBLIC_CHAIN === "mainnet"
    ? `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
    : `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

export const config = getDefaultConfig({
  appName: "Flipside",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [chain],
  transports: {
    [chain.id]: http(rpc),
  },
  ssr: true, // If your dApp uses server side rendering (SSR)
});
