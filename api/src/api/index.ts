import { ponder } from "@/generated";
import { eq, graphql, replaceBigInts } from "@ponder/core";
import { getAddress, numberToHex } from "viem";

function serialize(obj: any) {
  return replaceBigInts(obj, (v) => numberToHex(v));
}

ponder.use("/graphql", graphql());

ponder.get("/markets", async (c) => {
  const { Market, Pool } = c.tables;
  const result = await c.db
    .select()
    .from(c.tables.Market)
    .leftJoin(c.tables.Pool, eq(Market.id, Pool.marketId))
    .limit(10);

  return c.json(serialize(result));
});

ponder.get("/markets/:address", async (c) => {
  const address = getAddress(c.req.param("address"));
  const { Market, Pool } = c.tables;

  const result = await c.db
    .select()
    .from(c.tables.Market)
    .where(eq(Market.id, address))
    .leftJoin(c.tables.Pool, eq(Market.id, Pool.marketId));

  if (result.length === 0) return c.text("Market not found", 404);
  return c.json(serialize(result[0]));
});
