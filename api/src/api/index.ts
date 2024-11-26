import { ponder } from "@/generated";
import { graphql, replaceBigInts } from "@ponder/core";
import { getAddress, numberToHex } from "viem";

import { markets, pools } from "../../ponder.schema";

function serialize(obj: any) {
  return replaceBigInts(obj, (v) => numberToHex(v));
}

ponder.use("/graphql", graphql());

ponder.get("/markets", async (c) => {
  const result = await c.db.select({ id: markets.id }).from(markets);

  return c.json(serialize(result));
});

ponder.get("/markets/:address", async (c) => {
  const address = getAddress(c.req.param("address"));

  const result = await c.db.query.markets.findFirst({
    where: (market, { eq }) => eq(market.id, address),
    with: {
      pools: {
        columns: { marketId: false },
      },
    },
  });
  // const result = await c.db.query.markets.findOne({ where: (t, { eq }) => eq(t.id, address) });

  if (!result) return c.text("Market not found", 404);

  return c.json(serialize(result));
});

// ponder.get("/markets", async (c) => {
//   const { Market } = c.tables;
//   const result = await c.db.select({ id: Market.id }).from(c.tables.Market);

//   return c.json(result);
// });

// ponder.get("/markets/:address", async (c) => {
//   const address = getAddress(c.req.param("address"));
//   const { Market, Pool } = c.tables;

//   const result = await c.db
//     .select()
//     .from(c.tables.Market)
//     .where(eq(Market.id, address))
//     .leftJoin(c.tables.Pool, eq(Market.id, Pool.marketId));

//   if (result.length === 0) return c.text("Market not found", 404);
//   return c.json(serialize(result[0]));
// });
