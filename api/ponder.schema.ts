import { createSchema } from "@ponder/core";

export default createSchema(
  (p) => ({
    Outcome: p.createEnum(["YES", "NO", "INVALID"]),
    Market: p.createTable({
      id: p.hex(),
      creator: p.hex(),
      collateralToken: p.hex(),
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
  })
  // Account: p.createTable({
  //   id: p.hex(),
  //   balance: p.bigint(),
  //   isOwner: p.boolean(),

  //   allowances: p.many("Allowance.ownerId"),
  //   approvalOwnerEvents: p.many("ApprovalEvent.ownerId"),
  //   approvalSpenderEvents: p.many("ApprovalEvent.spenderId"),
  //   transferFromEvents: p.many("TransferEvent.fromId"),
  //   transferToEvents: p.many("TransferEvent.toId"),
  // }),
  // Allowance: p.createTable({
  //   id: p.string(),
  //   amount: p.bigint(),

  //   ownerId: p.hex().references("Account.id"),
  //   spenderId: p.hex().references("Account.id"),

  //   owner: p.one("ownerId"),
  //   spender: p.one("spenderId"),
  // }),
  // TransferEvent: p.createTable(
  //   {
  //     id: p.string(),
  //     amount: p.bigint(),
  //     timestamp: p.int(),

  //     fromId: p.hex().references("Account.id"),
  //     toId: p.hex().references("Account.id"),

  //     from: p.one("fromId"),
  //     to: p.one("toId"),
  //   },
  //   { fromIdIndex: p.index("fromId") },
  // ),
  // ApprovalEvent: p.createTable({
  //   id: p.string(),
  //   amount: p.bigint(),
  //   timestamp: p.int(),

  //   ownerId: p.hex().references("Account.id"),
  //   spenderId: p.hex().references("Account.id"),

  //   owner: p.one("ownerId"),
  //   spender: p.one("spenderId"),
  // }),
  //})
);
