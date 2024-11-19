import { createConfig } from "@ponder/core";
import { getAddress, http, parseAbiItem, zeroAddress } from "viem";
import { marketAbi, marketFactoryAbi } from "./abis/flipside";

import Deploy from "../contracts/broadcast/Deploy.s.sol/31337/run-latest.json";

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

function address(contract: string) {
  const tx = Deploy.transactions.find((tx) => tx.transactionType === "CREATE" && tx.contractName === contract);
  if (!tx) return;

  return getAddress(tx.contractAddress);
}

function startBlock(contract: string) {
  const tx = Deploy.transactions.find((tx) => tx.transactionType === "CREATE" && tx.contractName === contract);
  if (!tx) return;

  const receipt = Deploy.receipts.find((receipt) => receipt.transactionHash === tx.hash);
  if (!receipt) return;

  console.log("Start block for", contract, "is", parseInt(receipt.blockNumber));

  return parseInt(receipt.blockNumber);
}

const network = getNetwork();

const marketFactoryAddress = process.env.MARKET_FACTORY_CONTRACT_ADDRESS || address("MarketFactory")!;
const marketFactoryStartBlock = process.env.PONDER_START_BLOCK || startBlock("MarketFactory")!;

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
      startBlock: marketFactoryStartBlock,
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
      startBlock: marketFactoryStartBlock,
    },
  },
});
