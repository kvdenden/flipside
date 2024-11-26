import { ponder } from "@/generated";
import { marketAbi } from "../abis/flipside";
import { markets, outcomes, pools } from "../ponder.schema";

ponder.on("MarketFactory:MarketCreated", async ({ event, context }) => {
  const { market, creator, collateralToken, pool, initialLiquidity } = event.args;
  const { client, db } = context;

  const unitPrice = await client.readContract({
    abi: marketAbi,
    address: market,
    functionName: "unitPrice",
  });

  const title = await client.readContract({
    abi: marketAbi,
    address: market,
    functionName: "title",
  });

  const description = await client.readContract({
    abi: marketAbi,
    address: market,
    functionName: "description",
  });

  const expirationDate = await client.readContract({
    abi: marketAbi,
    address: market,
    functionName: "expirationDate",
  });

  const longToken = await client.readContract({
    abi: marketAbi,
    address: market,
    functionName: "longToken",
  });

  const shortToken = await client.readContract({
    abi: marketAbi,
    address: market,
    functionName: "shortToken",
  });

  await db.insert(markets).values({
    id: market,
    creator,
    collateralToken,
    unitPrice,
    title,
    description,
    expirationDate,
    longToken,
    shortToken,

    createdAt: event.block.timestamp,
  });

  await db.insert(pools).values({
    id: pool,
    initialLiquidity,
    marketId: market,
  });
});

ponder.on("Resolver:MarketResolved", async ({ event, context }) => {
  const { market, outcome } = event.args;
  const { db } = context;

  await db.update(markets, { id: market }).set({
    resolved: true,
    outcome: outcomes.enumValues[outcome] ?? "Invalid",
  });
});
