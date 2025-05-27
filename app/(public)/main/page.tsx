"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { addMonths, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Define enums
enum SymbolType {
  EURUSD = "EURUSD",
  USDJPY = "USDJPY",
  GOLD = "GOLD",
  BTCUSD = "BTCUSD",
}

enum Timeframe {
  M15 = "M15",
  M30 = "M30",
  H1 = "H1",
  D1 = "D1",
}

// Update interfaces to match schema
interface PackageSelectionData {
  symbol: string;
  timeframe: string;
}

interface PackageSelections {
  [key: number]: PackageSelectionData;
}

const MainPage = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  // Track symbol and timeframe selections for each package with proper typing
  const [selections, setSelections] = useState<PackageSelections>({
    1: { symbol: "", timeframe: "" },
    2: { symbol: "", timeframe: "" },
    3: { symbol: "", timeframe: "" },
  });

  // Calculate end date (3 months from start date)
  const endDate = startDate ? addMonths(startDate, 3) : undefined;

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

  // Handle payment redirect
  const handlePayment = () => {
    if (!startDate) return;

    // Filter packages that have both symbol and timeframe selected
    const validPackages = Object.entries(selections)
      .filter(([_, { symbol, timeframe }]) => symbol && timeframe)
      .map(([id]) => parseInt(id));

    // If no valid packages, don't proceed
    if (validPackages.length === 0) return;

    // Generate random decimal between 0.00 and 0.99 for customer identification
    const randomDecimal = Math.floor(Math.random() * 100) / 100;
    // Format to ensure it always has 2 decimal places
    const formattedDecimal = randomDecimal.toFixed(2).substring(2);

    // Fixed amount of 100 baht for all packages (regardless of count)
    const amount = `100.${formattedDecimal}`;
    const payPrice = parseFloat(`100.${formattedDecimal}`); // Include decimal part in the price

    // Create a params object with selections
    const params = new URLSearchParams();
    params.set("amount", amount);
    params.set("payPrice", payPrice.toString());
    params.set("packages", validPackages.join(","));
    params.set("startDate", startDate.toISOString());
    params.set("endDate", endDate!.toISOString());

    // Add symbol and timeframe for each valid package
    validPackages.forEach((packageId) => {
      params.set(`symbol${packageId}`, selections[packageId].symbol);
      params.set(`timeframe${packageId}`, selections[packageId].timeframe);
    });

    // Redirect to payment page with parameters
    router.push(`/payment?${params.toString()}`);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card 1 */}
        <Card>
          <CardHeader>
            <CardTitle>Package 1</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symbol1">Symbol</Label>
              <Select onValueChange={(value) => handleSymbolChange(1, value)}>
                <SelectTrigger id="symbol1">
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SymbolType).map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe1">Period</Label>
              <Select
                onValueChange={(value) => handleTimeframeChange(1, value)}
              >
                <SelectTrigger id="timeframe1">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Timeframe).map((timeframe) => (
                    <SelectItem key={timeframe} value={timeframe}>
                      {timeframe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card>
          <CardHeader>
            <CardTitle>Package 2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symbol2">Symbol</Label>
              <Select onValueChange={(value) => handleSymbolChange(2, value)}>
                <SelectTrigger id="symbol2">
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SymbolType).map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe2">Period</Label>
              <Select
                onValueChange={(value) => handleTimeframeChange(2, value)}
              >
                <SelectTrigger id="timeframe2">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Timeframe).map((timeframe) => (
                    <SelectItem key={timeframe} value={timeframe}>
                      {timeframe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card>
          <CardHeader>
            <CardTitle>Package 3</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="symbol3">Symbol</Label>
              <Select onValueChange={(value) => handleSymbolChange(3, value)}>
                <SelectTrigger id="symbol3">
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SymbolType).map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe3">Period</Label>
              <Select
                onValueChange={(value) => handleTimeframeChange(3, value)}
              >
                <SelectTrigger id="timeframe3">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Timeframe).map((timeframe) => (
                    <SelectItem key={timeframe} value={timeframe}>
                      {timeframe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global start date selector */}
      <div className="max-w-md ml-0 mt-12 border p-6 rounded-lg shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-lg font-medium">
            Package Start Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Select start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {startDate && (
          <div className="mt-4 bg-slate-50 p-4 rounded-md border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-600">
                  เเพ็กเกจมีอายุได้แค่3เดือน
                </p>
                <p className="font-medium mt-1 text-slate-800">
                  หมดอายุ: {endDate ? format(endDate, "PPP") : ""}
                </p>
              </div>
              <div className="flex-shrink-0 ml-4 text-right">
                <p className="text-xs text-slate-500">ราคา</p>
                <p className="font-semibold text-emerald-600 text-lg">
                  ฿100.xx
                </p>
                <p className="text-xs text-slate-500">
                  ยอดจริงจะปรากฏในหน้าถัดไป
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buy button */}
        <div className="mt-6">
          <Button
            onClick={handlePayment}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
            disabled={
              !startDate ||
              Object.values(selections).every(
                ({ symbol, timeframe }) => !symbol || !timeframe
              )
            }
          >
            {!startDate
              ? "เลือกวันเริ่มต้นก่อน"
              : Object.values(selections).every(
                  ({ symbol, timeframe }) => !symbol || !timeframe
                )
              ? "เลือกอย่างน้อย 1 แพ็กเกจ"
              : "ชำระเงิน"}
          </Button>
          {startDate && (
            <p className="text-xs text-center mt-2 text-slate-500">
              การสมัครของคุณจะเริ่มในวันที่ {format(startDate, "d MMMM yyyy")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
