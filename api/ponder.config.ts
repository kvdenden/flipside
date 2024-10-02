import { createConfig } from "@ponder/core";
import { http, parseAbiItem } from "viem";
import { marketAbi, marketFactoryAbi } from "./abis/flipside";

export default createConfig({
  networks: {
    baseSepolia: {
      chainId: 84532,
      transport: http(process.env.PONDER_RPC_URL_84532),
    },
  },
  contracts: {
    MarketFactory: {
      abi: marketFactoryAbi,
      network: "baseSepolia",
      address: process.env.MARKET_FACTORY_CONTRACT_ADDRESS,
      startBlock: process.env.PONDER_START_BLOCK,
    },
    Market: {
      abi: marketAbi,
      network: "baseSepolia",
      factory: {
        address: process.env.MARKET_FACTORY_CONTRACT_ADDRESS,
        event: parseAbiItem(
          "event MarketCreated(address indexed market, address indexed creator, address indexed collateralToken, address pool, uint256 initialLiquidity)"
        ),
        parameter: "market",
      },
      startBlock: process.env.PONDER_START_BLOCK,
    },
  },
});
