# Deployment steps

### Tokens

- set env variable WETH
- set env variable USDC

### Uniswap

- set env variable UNISWAP_V3FACTORY (UniswapV3Factory)
- set env variable UNISWAP_V3POSITION_MANAGER (NonfungiblePositionManager)
- set env variable UNISWAP_SWAPROUTER (SwapRouter02)

### UMA

- set env variable UMA_OOV3 (OptimisticOracleV3)

### deploy resolver

- forge script script/Resolver.s.sol:Deploy --broadcast --verify --slow --rpc-url base_sepolia
- set RESOLVER_CONTRACT_ADDRESS env variable

### deploy pool manager

- forge script script/PoolManager.s.sol:Deploy --broadcast --verify --slow --rpc-url base_sepolia
- set POOL_MANAGER_CONTRACT_ADDRESS env variable

### deploy reward manager

- forge script script/RewardManager.s.sol:Deploy --broadcast --verify --slow --rpc-url base_sepolia
- set REWARD_MANAGER_CONTRACT_ADDRESS env variable

### deploy market factory

- forge script script/MarketFactory.s.sol:Deploy --broadcast --verify --slow --rpc-url base_sepolia
- set MARKET_FACTORY_CONTRACT_ADDRESS env variable

### deploy flipside gateway

- forge script script/Flipside.s.sol:Deploy --broadcast --verify --slow --rpc-url base_sepolia
- set FLIPSIDE_CONTRACT_ADDRESS env variable
