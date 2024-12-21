import { formatValue } from "@/util/numbers";

import useToken from "./useToken";

export type FormatAmountOptions = {
  symbol?: string; // Optional token symbol to override
  precision?: number; // Optional precision for fractional digits
};

export default function useFormatAmount(amount: bigint, address?: `0x${string}`, options?: FormatAmountOptions) {
  const { data: token } = useToken(address);

  if (!token) return;

  const { symbol, precision } = options || {};

  return `${formatValue(amount, token.decimals, { precision })} ${symbol || token.symbol}`;
}
