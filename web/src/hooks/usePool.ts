// import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { useMemo } from "react";

import { Token } from "@uniswap/sdk-core";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";

import { parseAbi } from "viem";
import { useReadContracts } from "wagmi";

import { chain } from "@/web3/config";
import useMarket from "@/hooks/useMarket";

const chainId = chain.id;

const IUniswapV3PoolABI = parseAbi([
  "function slot0() external view returns (uint160 sqrtPriceX96,int24 tick,uint16 observationIndex,uint16 observationCardinality,uint16 observationCardinalityNext,uint8 feeProtocol,bool unlocked)",
  "function liquidity() external view returns (uint128)",
]);

export default function usePool(marketId?: `0x${string}`) {
  const { data: market } = useMarket(marketId);

  const poolId = useMemo(() => {
    if (!market) return;

    return market.pool.id;
  }, [market]);

  const result = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: poolId,
        abi: IUniswapV3PoolABI,
        functionName: "slot0",
      },
      {
        address: poolId,
        abi: IUniswapV3PoolABI,
        functionName: "liquidity",
      },
    ],
    query: {
      enabled: !!poolId,
    },
  });

  const pool = useMemo(() => {
    if (!market || !result.data) return;

    const tokenA = new Token(chainId, market.longToken, 18);
    const tokenB = new Token(chainId, market.shortToken, 18);

    const [slot0, liquidity] = result.data;
    const [sqrtPriceX96, tick] = slot0;

    return new Pool(tokenA, tokenB, FeeAmount.HIGH, sqrtPriceX96.toString(), liquidity.toString(), tick);
  }, [market, result.data]);

  return { ...result, data: pool };
}
