
-include .env

.PHONY: test

# Clean the repo
clean :; forge clean

test :; forge test --fork-url ${FORK_URL} --fork-block-number ${FORK_BLOCK_NUMBER}

anvil :; anvil --fork-url ${FORK_URL} --fork-block-number ${FORK_BLOCK_NUMBER} --chain-id 31337 --block-time 2 --auto-impersonate

# local development
deploy-anvil :; @forge script script/Deploy.s.sol --rpc-url http://localhost:8545  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
create-market :; @forge script script/Market.s.sol --rpc-url http://localhost:8545  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
resolve-market :; @forge script script/ResolveMarket.s.sol --rpc-url http://localhost:8545  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast


from ?= 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
amount ?= 1

TOKEN ?= ${USDC}

send-eth :; @cast send ${to} --from ${from} --value $(shell cast to-wei ${amount}) --unlocked
send-usdc :; @cast send ${USDC} --from ${from} "transfer(address,uint256)(bool)" ${to} $(shell echo ${amount} \* 1e6 | bc) --unlocked
approve :; @cast send ${TOKEN} --from ${from} "approve(address,uint256)(bool)" ${spender} $(shell echo ${amount} \* $(shell cast call ${TOKEN} "decimals()(uint8)") | bc) --unlocked