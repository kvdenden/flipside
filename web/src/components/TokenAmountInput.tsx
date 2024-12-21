"use client";

import { useEffect, useState } from "react";
import { Input, InputProps } from "@nextui-org/react";

import { formatUnits, parseUnits } from "viem";

import useToken from "@/hooks/useToken";

type TokenAmountInputProps = Omit<InputProps, "value" | "onValueChange"> & {
  address?: `0x${string}`;
  value?: bigint;
  onValueChange?: (value: bigint) => void;
};

export default function TokenAmountInput({
  address,
  value = BigInt(0),
  onValueChange = () => {},
  ...props
}: TokenAmountInputProps) {
  const [inputValue, setInputValue] = useState("");
  const { data: token } = useToken(address);

  useEffect(() => {
    setInputValue(token ? formatUnits(value, token.decimals) : "");
  }, [value, token]);

  const onInputValueChange = (inputValue: string) => {
    if (!token) return;

    const regex = new RegExp(`^\\d*\\.?\\d{0,${token.decimals}}$`);
    if (regex.test(inputValue)) {
      setInputValue(inputValue);

      const parsedValue = parseUnits(inputValue, token.decimals);
      if (parsedValue !== value) onValueChange(parsedValue);
    }
  };

  if (!token) return <Input isDisabled {...props} />;

  return <Input value={inputValue} onValueChange={onInputValueChange} {...props} />;
}
