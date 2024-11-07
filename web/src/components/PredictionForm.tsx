"use client";

import { useState } from "react";

import NiceModal from "@ebay/nice-modal-react";
import { Button, Card, CardBody, CardHeader, Input } from "@nextui-org/react";
import { Sparkles } from "lucide-react";
import CreateMarketModal from "./CreateMarketModal";

export default function PredictionForm() {
  const [prediction, setPrediction] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    NiceModal.show(CreateMarketModal, { defaultStatement: prediction });
  };

  return (
    <Card className="p-2">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold">Launch Your Own Prediction Market</h1>
          <p>From future trends to community predictions, create a market that unlocks insights on any topic.</p>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <Input
            name="prediction"
            value={prediction}
            onChange={(e) => setPrediction(e.target.value)}
            placeholder="Ethereum to hit $10k in 2024"
            description="Enter a high-level prediction statement about future events."
            size="lg"
            classNames={{ inputWrapper: "md:px-6 py-8 md:py-10" }}
            endContent={
              <Button type="submit" size="lg" color="primary" className="hidden md:flex">
                <Sparkles size={16} className="flex-shrink-0" /> Get started
              </Button>
            }
          />
          <Button type="submit" color="primary" size="lg" className="mt-4 w-full md:hidden">
            <Sparkles size={16} className="flex-shrink-0" /> Get started
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
