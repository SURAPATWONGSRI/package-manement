"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Cell, Pie, PieChart } from "recharts";

interface Package {
  packageId: string;
  symbol: string;
  timeframe: string;
}

interface PackageSelection {
  id: string;
  packages: Package[];
}

interface PackageDistributionChartProps {
  data: PackageSelection[];
}

export function PackageDistributionChart({
  data,
}: PackageDistributionChartProps) {
  // Count package symbols
  const symbolCounts = data.reduce((acc, selection) => {
    if (selection.packages && Array.isArray(selection.packages)) {
      selection.packages.forEach((pkg) => {
        const symbol = pkg.symbol || "Unknown";
        acc[symbol] = (acc[symbol] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(symbolCounts).map(([symbol, count]) => ({
    symbol,
    count,
    fill: getSymbolColor(symbol),
  }));

  const chartConfig = {
    count: {
      label: "จำนวน",
    },
    EURUSD: {
      label: "EUR/USD",
      color: "hsl(var(--chart-1))",
    },
    USDJPY: {
      label: "USD/JPY",
      color: "hsl(var(--chart-2))",
    },
    GOLD: {
      label: "GOLD",
      color: "hsl(var(--chart-3))",
    },
    BTCUSD: {
      label: "BTC/USD",
      color: "hsl(var(--chart-4))",
    },
  } satisfies ChartConfig;

  function getSymbolColor(symbol: string) {
    const colors = {
      EURUSD: "hsl(var(--chart-1))",
      USDJPY: "hsl(var(--chart-2))",
      GOLD: "hsl(var(--chart-3))",
      BTCUSD: "hsl(var(--chart-4))",
    };
    return colors[symbol as keyof typeof colors] || "hsl(var(--chart-5))";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>การกระจายตัวของแพ็คเกจ</CardTitle>
        <CardDescription>สัดส่วนการใช้งานแต่ละสัญลักษณ์การเทรด</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="symbol"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
