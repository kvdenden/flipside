"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalProps,
  Divider,
  Skeleton,
  Button,
} from "@nextui-org/react";

type CreateMarketModalProps = {
  statement: string;
  // onCreate?: () => void;
};

function CreateMarketModal({ statement, ...props }: Omit<ModalProps, "children"> & CreateMarketModalProps) {
  return (
    <Modal {...props}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Create Prediction Market</ModalHeader>
            <ModalBody>
              <div className="grid gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{statement}</h3>
                </div>
                <Divider />
                <div>
                  <Skeleton isLoaded={false}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">You pay</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">You receive (estimated)</span>
                    </div>
                  </Skeleton>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default NiceModal.create((props: CreateMarketModalProps) => {
  const modal = useModal();

  return <CreateMarketModal isOpen={modal.visible} onClose={modal.hide} {...props} />;
});
