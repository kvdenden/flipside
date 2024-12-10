import NiceModal from "@ebay/nice-modal-react";

import MintModal, { type MintModalProps } from "@/components/MintModal";
import MintLiquidityModal, { type MintLiquidityModalProps } from "@/components/MintLiquidityModal";
import ResolveMarketModal, { type ResolveMarketModalProps } from "@/components/ResolveMarketModal";
import CreateMarketModal, { type CreateMarketModalProps } from "@/components/CreateMarketModal";

export const openMintModal = (props: MintModalProps) => {
  NiceModal.show(MintModal, props);
};

export const openResolutionModal = (props: ResolveMarketModalProps) => {
  NiceModal.show(ResolveMarketModal, props);
};

export const openCreateMarketModal = (props: CreateMarketModalProps) => {
  NiceModal.show(CreateMarketModal, props);
};

export const openMintLiquidityModal = (props: MintLiquidityModalProps) => {
  NiceModal.show(MintLiquidityModal, props);
};
