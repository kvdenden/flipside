import CreateMarketForm from "@/components/CreateMarketForm";
import MarketGrid from "@/components/MarketGrid";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 items-center sm:items-start">
      <CreateMarketForm />
      <MarketGrid />
    </div>
  );
}
