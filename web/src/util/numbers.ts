import { formatUnits } from "viem";

export function formatValue(value: bigint, decimals: number = 18, options?: { precision?: number }) {
  const { precision } = options || {};
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: precision }).format(
    Number(formatUnits(value, decimals))
  );
}
