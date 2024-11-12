"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Autocomplete,
  AutocompleteItem,
  Button,
  DatePicker,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  Skeleton,
  Textarea,
} from "@nextui-org/react";
import { Wand2 } from "lucide-react";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { fromDate, getLocalTimeZone, now } from "@internationalized/date";

import { parseUnits, zeroAddress } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { flipsideAbi } from "@/web3/abi";
import useToken from "@/hooks/useToken";
import useMarkets from "@/hooks/useMarkets";
import ActionGuard from "./ActionGuard";

const USDC = { name: "USDC", address: process.env.NEXT_PUBLIC_USDC };
const WETH = { name: "WETH", address: process.env.NEXT_PUBLIC_WETH };

const FLIPSIDE_ADDRESS = process.env.NEXT_PUBLIC_FLIPSIDE_CONTRACT_ADDRESS;
const FLIPSIDE_ABI = flipsideAbi;

const popularTokens = [USDC, WETH];

type CreateMarketModalProps = {
  defaultStatement?: string;
  onCreate?: () => void;
};

const fetchSuggestion = async (prediction: string) => {
  const response = await fetch(`/api/markets/suggest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prediction }),
  });
  if (response.ok) {
    const { result } = await response.json();

    const { title, description } = result;
    const expirationDate = new Date(result.expiration_date);

    return { title, description, expirationDate };
  }

  return;
};

function CreateMarketModal({
  defaultStatement = "",
  onCreate = () => {},
  ...props
}: Omit<ModalProps, "children"> & CreateMarketModalProps) {
  const [statement, setStatement] = useState(defaultStatement);

  const [marketData, setMarketData] = useState({
    title: "",
    description: "",
    expirationDate: now(getLocalTimeZone()).add({ years: 1 }),
    collateralToken: USDC.address,
    unitPrice: "1",
  });

  const { address } = useAccount();

  const { data: collateralToken } = useToken(marketData.collateralToken as `0x${string}`);

  const unitPrice = collateralToken ? parseUnits(marketData.unitPrice, collateralToken.decimals) : BigInt(0);
  const initialLiquidity = BigInt(10 * 1e18);
  const price = (unitPrice * initialLiquidity) / BigInt(1e18);

  const createMarket = useWriteContract();

  const {
    data: suggestion,
    isFetching: isSuggestionLoading,
    refetch: suggest,
  } = useQuery({
    queryKey: ["suggestion", statement],
    queryFn: () => fetchSuggestion(statement),
    enabled: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  useEffect(() => {
    setStatement(defaultStatement);
    setMarketData((prevState) => ({
      ...prevState,
      title: "",
      description: "",
      expirationDate: now(getLocalTimeZone()).add({ years: 1 }),
    }));
  }, [defaultStatement]);

  useEffect(() => {
    if (suggestion) {
      setMarketData((prevState) => ({
        ...prevState,
        title: suggestion.title,
        description: suggestion.description,
        expirationDate: fromDate(suggestion.expirationDate, getLocalTimeZone()),
      }));
    }
  }, [suggestion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMarketData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleCreateMarket = () => {
    if (!address) return;
    if (!collateralToken) return;

    createMarket.writeContract({
      address: FLIPSIDE_ADDRESS,
      abi: FLIPSIDE_ABI,
      functionName: "createMarket",
      args: [
        {
          creator: address,
          pairName: "Flipside",
          pairSymbol: "FLIP",
          title: marketData.title,
          description: marketData.description,
          expirationDate: BigInt(marketData.expirationDate.toDate().getTime() / 1000),
          collateralToken: collateralToken.address,
          unitPrice,
          initialLiquidity,
        },
      ],
    });
  };

  const createMarketReceipt = useWaitForTransactionReceipt({ hash: createMarket.data });

  useEffect(() => {
    if (createMarketReceipt.isSuccess) {
      onCreate();
    }
  }, [onCreate, createMarketReceipt]);

  return (
    <Modal scrollBehavior="inside" {...props}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">Create a Prediction Market</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    label="Prediction statement"
                    name="statement"
                    value={statement}
                    onValueChange={setStatement}
                    isReadOnly={isSuggestionLoading}
                  />
                  <Button
                    color="secondary"
                    className="w-full"
                    isLoading={isSuggestionLoading}
                    onClick={() => suggest()}
                  >
                    <Wand2 size={16} className="flex-shrink-0" />
                    Generate Market Details with AI
                  </Button>
                </div>
                <Divider />
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold">Market Details</h2>
                  <Skeleton isLoaded={!isSuggestionLoading} className="rounded-xl">
                    <Input
                      label="Title"
                      name="title"
                      value={marketData.title}
                      onChange={handleChange}
                      isReadOnly={isSuggestionLoading}
                    />
                  </Skeleton>
                  <Skeleton isLoaded={!isSuggestionLoading} className="rounded-xl">
                    <Textarea
                      label="Description"
                      name="description"
                      value={marketData.description}
                      onChange={handleChange}
                      isReadOnly={isSuggestionLoading}
                    />
                  </Skeleton>
                  <DatePicker
                    label="Expiration Date"
                    granularity="minute"
                    hideTimeZone
                    showMonthAndYearPickers
                    value={marketData.expirationDate}
                    onChange={(value) => {
                      setMarketData((prevState) => ({
                        ...prevState,
                        expirationDate: value,
                      }));
                    }}
                    minValue={now(getLocalTimeZone()).add({ hours: 24 })}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Unit Price</h3>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      label="Amount"
                      name="unitPrice"
                      value={marketData.unitPrice}
                      onChange={handleChange}
                      className="w-1/3"
                    />
                    <Autocomplete
                      label="Collateral Token"
                      defaultItems={popularTokens}
                      selectedKey={marketData.collateralToken}
                      onSelectionChange={(value) => {
                        setMarketData((prevState) => ({
                          ...prevState,
                          collateralToken: value as `0x${string}`,
                        }));
                      }}
                      isClearable={false}
                      className="w-2/3"
                    >
                      {(token) => (
                        <AutocompleteItem key={token.address} textValue={token.name}>
                          {token.name}
                        </AutocompleteItem>
                      )}
                    </Autocomplete>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <ActionGuard
                token={collateralToken ? collateralToken.address : zeroAddress}
                amount={price}
                spender={FLIPSIDE_ADDRESS}
                buttonProps={{ className: "w-full" }}
              >
                <Button
                  type="submit"
                  color="primary"
                  className="w-full"
                  onPress={handleCreateMarket}
                  isLoading={createMarket.isPending || createMarketReceipt.isLoading}
                >
                  Create Market
                </Button>
              </ActionGuard>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default NiceModal.create((props: CreateMarketModalProps) => {
  const modal = useModal();
  const { refetch: refetchMarkets } = useMarkets();

  const onCreate = useCallback(() => {
    if (modal.visible) modal.hide();
    refetchMarkets();
  }, [modal, refetchMarkets]);

  return <CreateMarketModal isOpen={modal.visible} onClose={modal.hide} onCreate={onCreate} {...props} />;
});
