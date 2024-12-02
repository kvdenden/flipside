"use client";

import { Spinner } from "@nextui-org/spinner";
import { Clock } from "lucide-react";

import useMarket from "@/hooks/useMarket";
import useYesPercentage from "@/hooks/useYesPercentage";

type MarketPageProps = {
  params: {
    marketId: `0x${string}`;
  };
};

export default function MarketPage({ params: { marketId } }: MarketPageProps) {
  const { data: market } = useMarket(marketId);
  const { data: yesPercentage } = useYesPercentage(marketId);

  if (!market)
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner color="default" />
      </div>
    );

  return (
    <div className="flex flex-col flex-1">
      <div className="py-6 px-4">
        <h1 className="text-2xl font-bold mb-2">{market.title}</h1>
        <p className="text-sm text-gray-400">
          <div className="flex items-center text-sm text-gray-400">
            <Clock size={16} className="mr-2" />
            {market.expirationDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="bg-gray-800 rounded-lg p-6">
            <p className="text-4xl font-bold mb-4">{yesPercentage}% chance</p>
            {/* Placeholder for Graph */}
            <div className="h-64 bg-gray-700 rounded"></div>
          </section>

          <section className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Market Description</h2>
            <p className="text-sm text-gray-400">{market.description}</p>
          </section>
        </div>

        <aside className="bg-gray-800 rounded-lg p-6"></aside>
      </div>
    </div>
  );
}
