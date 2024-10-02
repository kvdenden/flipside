namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_CHAIN?: "mainnet";

    NEXT_PUBLIC_ALCHEMY_API_KEY: string;
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string;

    NEXT_PUBLIC_USDC: `0x${string}`;
    NEXT_PUBLIC_WETH: `0x${string}`;

    NEXT_PUBLIC_MARKET_FACTORY_CONTRACT_ADDRESS: `0x${string}`;
  }
}
