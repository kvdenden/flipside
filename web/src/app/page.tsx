import CreateMarketForm from "@/components/CreateMarketForm";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 items-center sm:items-start">
      <CreateMarketForm />
    </div>
  );
}
