import { ponder } from "@/generated";
import { eq, graphql } from "@ponder/core";
import { getAddress } from "viem";

ponder.use("/graphql", graphql());

ponder.get("/markets", async (c) => {
  const result = await c.db.select().from(c.tables.Market).limit(10);

  return c.json(result);
});

ponder.get("/markets/:address", async (c) => {
  const address = getAddress(c.req.param("address"));
  const { Market } = c.tables;

  const result = await c.db.select().from(c.tables.Market).where(eq(Market.id, address));

  if (result.length === 0) return c.text("Market not found", 404);
  return c.json(result[0]);
});
