import useFormatAmount from "@/hooks/useFormatAmount";

type FormatAmountOptions = {
  symbol?: string; // Optional token symbol to override
  precision?: number; // Optional precision for fractional digits
};

type TokenAmountProps = {
  amount: bigint;
  address?: `0x${string}`;
  options?: FormatAmountOptions;
};

export default function TokenAmount({ amount, address, options }: TokenAmountProps) {
  const formattedAmount = useFormatAmount(amount, address, options);

  return formattedAmount;
}
