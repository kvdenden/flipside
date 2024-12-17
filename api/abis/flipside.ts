//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Market
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const marketAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: 'params',
        internalType: 'struct Market.MarketParams',
        type: 'tuple',
        components: [
          { name: 'creator', internalType: 'address', type: 'address' },
          { name: 'pairName', internalType: 'string', type: 'string' },
          { name: 'pairSymbol', internalType: 'string', type: 'string' },
          { name: 'title', internalType: 'string', type: 'string' },
          { name: 'description', internalType: 'string', type: 'string' },
          { name: 'expirationDate', internalType: 'uint256', type: 'uint256' },
          { name: 'collateralToken', internalType: 'address', type: 'address' },
          { name: 'unitPrice', internalType: 'uint256', type: 'uint256' },
          { name: 'resolver', internalType: 'address', type: 'address' },
          { name: 'rewardManager', internalType: 'address', type: 'address' },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'collateralToken',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'creator',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'description',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'expirationDate',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'longToken',
    outputs: [
      { name: '', internalType: 'contract OutcomeToken', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'marketReward',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'outcome',
    outputs: [{ name: '', internalType: 'enum Outcome', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'price',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'redeem',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'redemptionPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'resolved',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'resolver',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'longAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'shortAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'settle',
    outputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'outcome_', internalType: 'enum Outcome', type: 'uint8' },
      { name: 'longAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'shortAmount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'settlementAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [],
    name: 'shortToken',
    outputs: [
      { name: '', internalType: 'contract OutcomeToken', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'title',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalVolume',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unitPrice',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Minted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Redeemed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Settled',
  },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'AddressInsufficientBalance',
  },
  { type: 'error', inputs: [], name: 'FailedInnerCall' },
  { type: 'error', inputs: [], name: 'MathOverflowedMulDiv' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MarketFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const marketFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'resolver_', internalType: 'address', type: 'address' },
      { name: 'rewardManager_', internalType: 'address', type: 'address' },
      { name: 'poolManager_', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'params',
        internalType: 'struct MarketFactory.Params',
        type: 'tuple',
        components: [
          { name: 'creator', internalType: 'address', type: 'address' },
          { name: 'pairName', internalType: 'string', type: 'string' },
          { name: 'pairSymbol', internalType: 'string', type: 'string' },
          { name: 'title', internalType: 'string', type: 'string' },
          { name: 'description', internalType: 'string', type: 'string' },
          { name: 'expirationDate', internalType: 'uint256', type: 'uint256' },
          { name: 'collateralToken', internalType: 'address', type: 'address' },
          { name: 'unitPrice', internalType: 'uint256', type: 'uint256' },
          {
            name: 'initialLiquidity',
            internalType: 'uint256',
            type: 'uint256',
          },
        ],
      },
    ],
    name: 'createMarket',
    outputs: [{ name: '', internalType: 'contract Market', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'market',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'creator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'collateralToken',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'pool',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'initialLiquidity',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MarketCreated',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Resolver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const resolverAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'oo_', internalType: 'address', type: 'address' },
      { name: 'currency_', internalType: 'address', type: 'address' },
      { name: 'bond_', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'market', internalType: 'address', type: 'address' },
      { name: 'outcome_', internalType: 'enum Outcome', type: 'uint8' },
    ],
    name: 'assertOutcome',
    outputs: [
      { name: 'assertionId', internalType: 'bytes32', type: 'bytes32' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'assertionId', internalType: 'bytes32', type: 'bytes32' }],
    name: 'assertionDisputedCallback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'assertionId', internalType: 'bytes32', type: 'bytes32' },
      { name: 'assertedTruthfully', internalType: 'bool', type: 'bool' },
    ],
    name: 'assertionResolvedCallback',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'assertions',
    outputs: [
      { name: 'market', internalType: 'address', type: 'address' },
      { name: 'outcome', internalType: 'enum Outcome', type: 'uint8' },
      { name: 'asserter', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'bond',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currency',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'market', internalType: 'address', type: 'address' }],
    name: 'outcome',
    outputs: [{ name: '', internalType: 'enum Outcome', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'queries',
    outputs: [
      { name: 'resolved', internalType: 'bool', type: 'bool' },
      { name: 'outcome', internalType: 'enum Outcome', type: 'uint8' },
      { name: 'resolver', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'market', internalType: 'address', type: 'address' }],
    name: 'resolved',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'market', internalType: 'address', type: 'address' }],
    name: 'resolver',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'market',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'outcome',
        internalType: 'enum Outcome',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'MarketAsserted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'market',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'outcome',
        internalType: 'enum Outcome',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'MarketResolved',
  },
] as const
