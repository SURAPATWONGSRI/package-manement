"use client";
import { DateSelector } from "@/components/date-selector";
import { PackageCard } from "@/components/package-card";
import { PackageSelections, PaymentButton } from "@/components/payment-button";
import { useState } from "react";

const MainPage = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [selections, setSelections] = useState<PackageSelections>({
    1: { symbol: "", timeframe: "" },
    2: { symbol: "", timeframe: "" },
    3: { symbol: "", timeframe: "" },
  });

  // Handle symbol selection change
  const handleSymbolChange = (packageId: number, value: string) => {
    setSelections({
      ...selections,
      [packageId]: { ...selections[packageId], symbol: value },
    });
  };

  // Handle timeframe selection change
  const handleTimeframeChange = (packageId: number, value: string) => {
    setSelections({
      ...selections,
      [packageId]: { ...selections[packageId], timeframe: value },
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <PackageCard
          packageId={1}
          title="Package 1"
          selectedSymbol={selections[1].symbol}
          selectedTimeframe={selections[1].timeframe}
          onSymbolChange={(value) => handleSymbolChange(1, value)}
          onTimeframeChange={(value) => handleTimeframeChange(1, value)}
        />
        <PackageCard
          packageId={2}
          title="Package 2"
          selectedSymbol={selections[2].symbol}
          selectedTimeframe={selections[2].timeframe}
          onSymbolChange={(value) => handleSymbolChange(2, value)}
          onTimeframeChange={(value) => handleTimeframeChange(2, value)}
        />
        <PackageCard
          packageId={3}
          title="Package 3"
          selectedSymbol={selections[3].symbol}
          selectedTimeframe={selections[3].timeframe}
          onSymbolChange={(value) => handleSymbolChange(3, value)}
          onTimeframeChange={(value) => handleTimeframeChange(3, value)}
        />
      </div>

      <DateSelector startDate={startDate} onStartDateChange={setStartDate} />
      <PaymentButton startDate={startDate} selections={selections} />
    </div>
  );
};

export default MainPage;
