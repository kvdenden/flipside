namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_CHAIN?: "mainnet" | "testnet";

    NEXT_PUBLIC_API_URL: string;

    NEXT_PUBLIC_ALCHEMY_API_KEY: string;
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string;

    NEXT_PUBLIC_USDC: `0x${string}`;
    NEXT_PUBLIC_WETH: `0x${string}`;

    NEXT_PUBLIC_UNISWAP_QUOTERV2: `0x${string}`;

    NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS: `0x${string}`;
    NEXT_PUBLIC_RESOLVER_CONTRACT_ADDRESS: `0x${string}`;

    OPENAI_API_KEY: string;
  }
}
