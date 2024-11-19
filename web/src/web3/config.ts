import { http } from "wagmi";
import { anvil, base, baseSepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

function getChain() {
  switch (process.env.NEXT_PUBLIC_CHAIN) {
    case "mainnet":
      return base;
    case "testnet":
      return baseSepolia;
    default:
      return anvil;
  }
}

function getRPC() {
  switch (process.env.NEXT_PUBLIC_CHAIN) {
    case "mainnet":
      return `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
    case "testnet":
      return `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
    default:
      return "http://127.0.0.1:8545";
  }
}

export const chain = getChain();
export const rpc = getRPC();

export const config = getDefaultConfig({
  appName: "Flipside",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [chain],
  transports: {
    [chain.id]: http(rpc),
  },
  ssr: true, // If your dApp uses server side rendering (SSR)
});
