#!/usr/bin/env bash
cd "$(dirname "$0")"
jq -r --arg name "$1" -f parse.jq ../../contracts/broadcast/Deploy.s.sol/31337/run-latest.json | jq -r .contractAddress
