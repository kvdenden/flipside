import CreateMarketForm from "@/components/CreateMarketForm";
import PredictionForm from "@/components/PredictionForm";
import MarketGrid from "@/components/MarketGrid";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <PredictionForm />
      {/* <CreateMarketForm /> */}
      <MarketGrid />
    </div>
  );
}
