import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Outcome: p.createEnum(["YES", "NO", "INVALID"]),
  Market: p.createTable({
    id: p.hex(),
    creator: p.hex(),
    collateralToken: p.hex(),
    unitPrice: p.bigint(),
    title: p.string(),
    description: p.string(),
    longToken: p.hex(),
    shortToken: p.hex(),
    resolved: p.boolean(),
    outcome: p.enum("Outcome").optional(),

    pools: p.many("Pool.marketId"),

    createdAt: p.int(),
  }),
  Pool: p.createTable(
    {
      id: p.hex(),
      // token0: p.hex(),
      // token1: p.hex(),
      initialLiquidity: p.bigint(),

      marketId: p.hex().references("Market.id"),

      market: p.one("marketId"),
    },
    { marketIdIndex: p.index("marketId") }
  ),
}));
