import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function useConnect() {
  const { openConnectModal: connect } = useConnectModal();

  return { connect };
}
