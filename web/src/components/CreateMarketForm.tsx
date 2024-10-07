"use client";

import React, { useEffect, useMemo, useState } from "react";
import { isAddress, parseUnits, zeroAddress } from "viem";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

import { erc20Abi } from "viem";
import { marketFactoryAbi } from "@/web3/abi";

import { Button, Input, Textarea, Card, CardBody, CardHeader, Autocomplete, AutocompleteItem } from "@nextui-org/react";

import useConnect from "@/hooks/useConnect";
import useToken from "@/hooks/useToken";

const popularTokens = [
  { name: "USDC", address: process.env.NEXT_PUBLIC_USDC },
  { name: "WETH", address: process.env.NEXT_PUBLIC_WETH },
];

const MARKET_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_MARKET_FACTORY_CONTRACT_ADDRESS;
const MARKET_FACTORY_ABI = marketFactoryAbi;

export default function CreateMarketForm() {
  const [formData, setFormData] = useState({
    pairName: "",
    pairSymbol: "",
    description: "",
    collateralToken: "",
    initialLiquidity: "",
  });

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const { data: collateralToken } = useToken(formData.collateralToken as `0x${string}`);

  const initialLiquidity = useMemo(
    () => (collateralToken ? parseUnits(formData.initialLiquidity, collateralToken.decimals) : BigInt(0)),
    [collateralToken, formData.initialLiquidity]
  );

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: formData.collateralToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address ?? zeroAddress],
    query: {
      enabled: isConnected && isAddress(formData.collateralToken),
    },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: formData.collateralToken as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address ?? zeroAddress, MARKET_FACTORY_ADDRESS],
    query: {
      enabled: isConnected && isAddress(formData.collateralToken),
    },
  });

  const approve = useWriteContract();
  const approveReceipt = useWaitForTransactionReceipt({ hash: approve.data });

  const createMarket = useWriteContract();
  const createMarketReceipt = useWaitForTransactionReceipt({ hash: createMarket.data });

  useEffect(() => {
    if (approveReceipt.isSuccess) {
      refetchAllowance();
    }
  }, [approveReceipt.isSuccess, refetchAllowance]);

  useEffect(() => {
    if (createMarketReceipt.isSuccess) {
      refetchBalance();
      refetchAllowance();
    }
  }, [createMarketReceipt.isSuccess, refetchBalance, refetchAllowance]);

  const sufficientBalance = useMemo(() => !!balance && balance >= initialLiquidity, [balance, initialLiquidity]);

  const sufficientAllowance = useMemo(
    () => !!allowance && allowance >= initialLiquidity,
    [allowance, initialLiquidity]
  );

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();

    if (!collateralToken) return;

    approve.writeContract({
      address: collateralToken.address,
      abi: erc20Abi,
      functionName: "approve",
      args: [MARKET_FACTORY_ADDRESS, initialLiquidity],
    });
  };

  const handleCreateMarket = (e: React.FormEvent) => {
    e.preventDefault();

    if (!collateralToken) return;

    createMarket.writeContract({
      address: MARKET_FACTORY_ADDRESS,
      abi: MARKET_FACTORY_ABI,
      functionName: "createMarket",
      args: [
        formData.pairName,
        formData.pairSymbol,
        formData.description,
        collateralToken.address,
        initialLiquidity, // TODO: Update this to the correct decimal places
      ],
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCollateralTokenChange = (value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      collateralToken: value,
    }));
  };

  // not connected -> connect wallet
  // insufficient balance -> disabled
  // insufficient allowance -> approve
  // else -> create market

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Create New Market</h2>
      </CardHeader>
      <CardBody>
        <form className="space-y-4">
          <div className="grid grid-cols-4 gap-2 items-end">
            <div className="col-span-3">
              <Input
                label="Pair Name"
                name="pairName"
                value={formData.pairName}
                onChange={handleChange}
                placeholder="Enter pair name"
                required
              />
            </div>
            <div className="col-span-1">
              <Input
                label="Symbol"
                name="pairSymbol"
                value={formData.pairSymbol}
                onChange={handleChange}
                placeholder="Symbol"
                required
                className="text-sm"
              />
            </div>
          </div>
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter market description"
            required
          />
          <Autocomplete
            label="Collateral Token"
            placeholder="Select token or enter address"
            defaultItems={popularTokens}
            onSelectionChange={(address) => handleCollateralTokenChange(address as string)}
            selectedKey={formData.collateralToken}
            // onInputChange={handleCollateralTokenChange}
            allowsCustomValue={true}
          >
            {(token) => (
              <AutocompleteItem key={token.address} textValue={token.name}>
                {token.name}
              </AutocompleteItem>
            )}
          </Autocomplete>
          <Input
            type="number"
            label="Initial Liquidity"
            name="initialLiquidity"
            value={formData.initialLiquidity}
            onChange={handleChange}
            placeholder="Enter initial liquidity"
            required
          />
          {!isConnected && (
            <Button type="submit" color="primary" className="w-full" onClick={connect}>
              Connect wallet
            </Button>
          )}
          {isConnected && !sufficientBalance && (
            <Button type="submit" color="primary" className="w-full" isDisabled>
              Create Market
            </Button>
          )}
          {isConnected && sufficientBalance && !sufficientAllowance && (
            <Button
              type="submit"
              color="primary"
              className="w-full"
              onClick={handleApprove}
              // isLoading={approve.isPending || approveReceipt.isPending}
            >
              Approve
            </Button>
          )}
          {isConnected && sufficientBalance && sufficientAllowance && (
            <Button
              type="submit"
              color="primary"
              className="w-full"
              onClick={handleCreateMarket}
              // isLoading={createMarket.isPending || createMarketReceipt.isPending}
            >
              Create Market
            </Button>
          )}

          {/* <Button type="submit" color="primary" className="w-full" isDisabled={isPending || isConfirming}>
            {isPending ? "Confirming..." : isConfirming ? "Creating Market..." : "Create Market"}
          </Button>
          {isSuccess && <p className="text-green-500 text-center">Market created successfully!</p>}
          {error && <p className="text-red-500 text-center">Error creating market: {error.message}</p>} */}
        </form>
      </CardBody>
    </Card>
  );
}
