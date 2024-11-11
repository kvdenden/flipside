import { ponder } from "@/generated";
import { marketAbi } from "../abis/flipside";

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

  const expirationDate = await client
    .readContract({
      abi: marketAbi,
      address: market,
      functionName: "expirationDate",
    })
    .then(Number);

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

  await db.Market.create({
    id: market,
    data: {
      creator,
      collateralToken,
      unitPrice,
      title,
      description,
      expirationDate,
      longToken,
      shortToken,
      resolved: false,
      outcome: undefined,

      createdAt: Number(event.block.timestamp),
    },
  });

  await db.Pool.create({
    id: pool,
    data: {
      initialLiquidity,
      marketId: market,
    },
  });
});
