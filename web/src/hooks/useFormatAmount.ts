import { formatUnits } from "viem";
import useToken from "./useToken";

export type FormatAmountOptions = {
  symbol?: string; // Optional token symbol to override
  precision?: number; // Optional precision for fractional digits
};

export default function useFormatAmount(amount: bigint, address?: `0x${string}`, options?: FormatAmountOptions) {
  const { data: token } = useToken(address);

  if (!token) return;

  const { symbol, precision } = options || {};

  const formattedValue = formatUnits(amount, token.decimals);
  const formattedWithPrecision = precision ? Number(formattedValue).toFixed(precision) : formattedValue;

  return `${formattedWithPrecision} ${symbol || token.symbol}`;
}
