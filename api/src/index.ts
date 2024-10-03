import { ponder } from "@/generated";
import { marketAbi } from "../abis/flipside";

ponder.on("MarketFactory:MarketCreated", async ({ event, context }) => {
  const { market, creator, collateralToken, pool, initialLiquidity } = event.args;
  const { client, db } = context;

  const description = await client.readContract({
    abi: marketAbi,
    address: market,
    functionName: "description",
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

  await db.Market.create({
    id: market,
    data: {
      creator,
      collateralToken,
      description,
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

// ponder.on("ERC20:Transfer", async ({ event, context }) => {
//   const { Account, TransferEvent } = context.db;

//   // Create an Account for the sender, or update the balance if it already exists.
//   await Account.upsert({
//     id: event.args.from,
//     create: {
//       balance: BigInt(0),
//       isOwner: false,
//     },
//     update: ({ current }) => ({
//       balance: current.balance - event.args.amount,
//     }),
//   });

//   // Create an Account for the recipient, or update the balance if it already exists.
//   await Account.upsert({
//     id: event.args.to,
//     create: {
//       balance: event.args.amount,
//       isOwner: false,
//     },
//     update: ({ current }) => ({
//       balance: current.balance + event.args.amount,
//     }),
//   });

//   // Create a TransferEvent.
//   await TransferEvent.create({
//     id: event.log.id,
//     data: {
//       fromId: event.args.from,
//       toId: event.args.to,
//       amount: event.args.amount,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });

// ponder.on("ERC20:Approval", async ({ event, context }) => {
//   const { Allowance, ApprovalEvent } = context.db;

//   const allowanceId = `${event.args.owner}-${event.args.spender}`;

//   // Create or update the Allowance.
//   await Allowance.upsert({
//     id: allowanceId,
//     create: {
//       ownerId: event.args.owner,
//       spenderId: event.args.spender,
//       amount: event.args.amount,
//     },
//     update: {
//       amount: event.args.amount,
//     },
//   });

//   // Create an ApprovalEvent.
//   await ApprovalEvent.create({
//     id: event.log.id,
//     data: {
//       ownerId: event.args.owner,
//       spenderId: event.args.spender,
//       amount: event.args.amount,
//       timestamp: Number(event.block.timestamp),
//     },
//   });
// });
