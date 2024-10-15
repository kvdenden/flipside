"use client";

import { Card, CardBody, Skeleton } from "@nextui-org/react";

import MarketCard from "./MarketCard";
import useMarkets from "@/hooks/useMarkets";

export default function MarketGrid() {
  const { data: markets, isLoading, error } = useMarkets();

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Prediction Markets</h2>
        <Card>
          <CardBody>
            <p className="text-red-500">Error loading markets: {error.message}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Prediction Markets</h2>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardBody>
                <Skeleton className="rounded h-4 w-3/4 mb-2" />
                <Skeleton className="rounded h-4 w-full mb-2" />
                <Skeleton className="rounded h-4 w-full mb-2" />
                <Skeleton className="rounded h-4 w-full mb-2" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : markets && markets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {markets.map((marketId: `0x${string}`) => (
            <MarketCard key={marketId} marketId={marketId} />
          ))}
          {[...Array(6)].map((_, index) => (
            <Card key={index}>
              <CardBody>
                <Skeleton className="rounded h-4 w-3/4 mb-2" />
                <Skeleton className="rounded h-4 w-full mb-2" />
                <Skeleton className="rounded h-4 w-full mb-2" />
                <Skeleton className="rounded h-4 w-full mb-2" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody>
            <p className="text-gray-500">No markets available.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
