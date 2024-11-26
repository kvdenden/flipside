import { onchainEnum, onchainTable, relations, index } from "@ponder/core";

export const outcomes = onchainEnum("outcomes", ["No", "Yes", "Invalid"]);

export const markets = onchainTable("markets", (t) => ({
  id: t.hex().primaryKey(),
  creator: t.hex().notNull(),
  collateralToken: t.hex().notNull(),
  unitPrice: t.bigint().notNull(),
  title: t.text().notNull(),
  description: t.text().notNull(),
  expirationDate: t.bigint().notNull(),
  longToken: t.hex().notNull(),
  shortToken: t.hex().notNull(),

  resolved: t.boolean().default(false),
  outcome: outcomes(),

  createdAt: t.bigint().notNull(),
}));

export const marketsRelations = relations(markets, ({ many }) => ({
  pools: many(pools),
}));

export const pools = onchainTable(
  "pools",
  (t) => ({
    id: t.hex().primaryKey(),
    // token0: t.hex(),
    // token1: t.hex(),
    initialLiquidity: t.bigint(),
    marketId: t.hex().notNull(),
  }),
  (table) => ({
    marketIdIndex: index().on(table.marketId),
  })
);

export const poolsRelations = relations(pools, ({ one }) => ({
  market: one(markets, {
    fields: [pools.marketId],
    references: [markets.id],
  }),
}));
