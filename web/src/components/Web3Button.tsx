import { useEffect } from "react";
import { Button, type ButtonProps } from "@nextui-org/react";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { getLoadingText } from "@/util/loading";

type WriteContractVariables = Parameters<ReturnType<typeof useWriteContract>["writeContract"]>[0];

export type Web3ButtonProps = Omit<ButtonProps, "children"> & {
  label?: string;
  loadingLabel?: string;
  contractCall: WriteContractVariables;
  onSuccess?: () => void;
};

export default function Web3Button({
  label = "Submit",
  loadingLabel = getLoadingText(label),
  contractCall,
  onSuccess,
  ...props
}: Web3ButtonProps) {
  const { writeContract, data, isPending } = useWriteContract();
  const { isSuccess, isLoading } = useWaitForTransactionReceipt({ hash: data });

  useEffect(() => {
    if (isSuccess && onSuccess) {
      onSuccess();
    }
  }, [isSuccess, onSuccess]);

  return (
    <Button {...props} isLoading={isPending || isLoading} onPress={() => writeContract(contractCall)}>
      {isPending || isLoading ? loadingLabel : label}
    </Button>
  );
}
