import CreateMarketForm from "@/components/CreateMarketForm";
import MarketGrid from "@/components/MarketGrid";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <CreateMarketForm />
      <MarketGrid />
    </div>
  );
}
