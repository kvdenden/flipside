. as $root |
.transactions[] 
| select(.contractName == $ARGS.named.name)
| . as $tx
| {
    contractName,
    contractAddress,
    transactionHash: .hash,
    blockNumber: ($root.receipts[] | select(.transactionHash == $tx.hash) | .blockNumber)
  }