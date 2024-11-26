import { createConfig } from "@ponder/core";
import { http, parseAbiItem } from "viem";
import { marketAbi, marketFactoryAbi, resolverAbi } from "./abis/flipside";

function getNetwork() {
  switch (process.env.PONDER_NETWORK) {
    case "mainnet":
      return "base";
    case "testnet":
      return "baseSepolia";
    default:
      return "anvil";
  }
}

const network = getNetwork();

const startBlock = process.env.PONDER_START_BLOCK;

const marketFactoryAddress = process.env.MARKET_FACTORY_CONTRACT_ADDRESS;
const resolverAddress = process.env.RESOLVER_CONTRACT_ADDRESS;

export default createConfig({
  networks: {
    anvil: {
      chainId: 31337,
      transport: http("http://127.0.0.1:8545"),
      disableCache: true,
    },
    baseSepolia: {
      chainId: 84532,
      transport: http(process.env.PONDER_RPC_URL_84532),
    },
    base: {
      chainId: 8453,
      transport: http(process.env.PONDER_RPC_URL_8453),
    },
  },
  contracts: {
    MarketFactory: {
      abi: marketFactoryAbi,
      network,
      address: marketFactoryAddress,
      startBlock,
    },
    Market: {
      abi: marketAbi,
      network,
      factory: {
        address: marketFactoryAddress,
        event: parseAbiItem(
          "event MarketCreated(address indexed market, address indexed creator, address indexed collateralToken, address pool, uint256 initialLiquidity)"
        ),
        parameter: "market",
      },
      startBlock,
    },
    Resolver: {
      abi: resolverAbi,
      network,
      address: resolverAddress,
      startBlock,
    },
  },
});
