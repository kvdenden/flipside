"use client";

import { useRouter } from "next/navigation";
import { NextUIProvider } from "@nextui-org/react";

import Web3Provider from "@/web3/provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <Web3Provider>{children}</Web3Provider>
    </NextUIProvider>
  );
}
