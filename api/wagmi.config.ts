import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "abis/flipside.ts",
  plugins: [
    foundry({
      project: "../contracts",
      include: ["MarketFactory.sol/**", "Market.sol/**"],
    }),
  ],
});
