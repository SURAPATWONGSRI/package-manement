import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define enums
export enum SymbolType {
  EURUSD = "EURUSD",
  USDJPY = "USDJPY",
  GOLD = "GOLD",
  BTCUSD = "BTCUSD",
}

export enum Timeframe {
  M15 = "M15",
  M30 = "M30",
  H1 = "H1",
  D1 = "D1",
}

interface PackageCardProps {
  packageId: number;
  title: string;
  selectedSymbol: string;
  selectedTimeframe: string;
  onSymbolChange: (value: string) => void;
  onTimeframeChange: (value: string) => void;
}

export function PackageCard({
  packageId,
  title,
  selectedSymbol,
  selectedTimeframe,
  onSymbolChange,
  onTimeframeChange,
}: PackageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`symbol${packageId}`}>Symbol</Label>
          <Select onValueChange={onSymbolChange} value={selectedSymbol}>
            <SelectTrigger id={`symbol${packageId}`}>
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
          <Label htmlFor={`timeframe${packageId}`}>Period</Label>
          <Select onValueChange={onTimeframeChange} value={selectedTimeframe}>
            <SelectTrigger id={`timeframe${packageId}`}>
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
  );
}
