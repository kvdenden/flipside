"use client";

import { ConnectButton as RainbowKitConnectButton } from "@rainbow-me/rainbowkit";
import { Button, ButtonProps } from "@nextui-org/react";

type ConnectButtonProps = Omit<ButtonProps, "children">;

export default function ConnectButton(props: ConnectButtonProps) {
  return (
    <RainbowKitConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && !!account && !!chain;

        if (!connected) {
          return (
            <Button onPress={openConnectModal} color="primary" {...props}>
              Connect
            </Button>
          );
        }

        if (chain.unsupported) {
          return (
            <Button onPress={openChainModal} color="warning" {...props}>
              Wrong network
            </Button>
          );
        }

        return (
          <Button onPress={openAccountModal} {...props}>
            {account.displayName}
          </Button>
        );
      }}
    </RainbowKitConnectButton.Custom>
  );
}
