"use client";

import { useRouter } from "next/navigation";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";

import { Provider as NiceModalProvider } from "@ebay/nice-modal-react";

import Web3Provider from "@/web3/provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <NextUIProvider navigate={router.push}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <Web3Provider>
          <NiceModalProvider>{children}</NiceModalProvider>
        </Web3Provider>
      </ThemeProvider>
    </NextUIProvider>
  );
}
