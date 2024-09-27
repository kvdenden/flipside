"use client";

import React, { useState } from "react";
import { Button, Input, Textarea, Card, CardBody, CardHeader, Autocomplete, AutocompleteItem } from "@nextui-org/react";

const popularTokens = [
  { name: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
  { name: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
];

export default function MarketForm() {
  const [formData, setFormData] = useState({
    pairName: "",
    pairSymbol: "",
    description: "",
    collateralToken: "",
    initialLiquidity: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    setFormData({
      pairName: "",
      pairSymbol: "",
      description: "",
      collateralToken: "",
      initialLiquidity: "",
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Create New Market</h2>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            allowsCustomValue={true}
          >
            {(token) => <AutocompleteItem key={token.address}>{token.name}</AutocompleteItem>}
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
          <Button type="submit" color="primary" className="w-full">
            Create Market
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
