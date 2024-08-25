"use client";

import React, { useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Calendar,
  BarChart as BarChartIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { IOrderItem } from "@/lib/database/models/order.model";
import { formatPrice } from "@/lib/utils";

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<string>("lg");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize(width < 640 ? "sm" : width < 768 ? "md" : "lg");
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenSize;
};

const OrdersChart = ({ orders }: { orders: IOrderItem[] }) => {
  const [view, setView] = useState<"week" | "month">("month");
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(
      now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 0)
    );
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  });
  const screenSize = useScreenSize();

  const now = new Date();
  const startOfCurrentWeek = new Date(now);
  startOfCurrentWeek.setDate(
    now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 0)
  );
  startOfCurrentWeek.setHours(0, 0, 0, 0);

  const twoYearsAgo = new Date(now);
  twoYearsAgo.setFullYear(now.getFullYear() - 2);

  const totalSales = orders.length;
  const totalAmount = orders.reduce(
    (acc: number, order: IOrderItem) => acc + parseFloat(order.totalAmount),
    0
  );

  const getMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const getDateRange = (
    startDate: Date,
    endDate: Date,
    format: "weekday" | "month"
  ) => {
    const result: string[] = [];
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      if (format === "weekday") {
        result.push(date.toLocaleDateString("default", { weekday: "short" }));
      } else {
        const monthYear = getMonthYear(date.toISOString());
        if (!result.includes(monthYear)) result.push(monthYear);
      }
    }
    return result;
  };

  const getDisplayRange = (orders: IOrderItem[]) => {
    if (orders.length === 0) return [];

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    const monthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - (screenSize === "lg" ? 11 : 5),
      1
    );

    return view === "week"
      ? getDateRange(weekStart, now, "weekday")
      : getDateRange(monthsAgo, now, "month");
  };

  const displayRange = getDisplayRange(orders);

  const aggregateData = (orders: IOrderItem[]) => {
    const aggregated = orders.reduce((acc, order) => {
      let key;
      const orderDate = new Date(order.createdAt);

      if (view === "week") {
        if (
          orderDate >= currentWeekStart &&
          orderDate <
            new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        ) {
          key = orderDate.toLocaleDateString("default", { weekday: "short" });
        } else {
          return acc;
        }
      } else {
        key = getMonthYear(order.createdAt.toString());
      }

      if (!acc[key]) acc[key] = { Sales: 0, Amount: 0 };
      acc[key].Sales += 1;
      acc[key].Amount += parseFloat(order.totalAmount);
      return acc;
    }, {} as Record<string, { Sales: number; Amount: number }>);

    return displayRange.map((period) => ({
      period,
      Sales: aggregated[period]?.Sales || 0,
      Amount: aggregated[period]?.Amount || 0,
    }));
  };

  const chartData = aggregateData(orders);

  const chartConfig: ChartConfig = {
    Sales: { label: "Sales", color: "#2563eb" },
    Amount: { label: "Amount", color: "#60a5fa" },
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekStart((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      return newDate;
    });
  };

  useEffect(() => {
    if (view === "week") {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(
        now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 0)
      );
      startOfWeek.setHours(0, 0, 0, 0);
      setCurrentWeekStart(startOfWeek);
    }
  }, [view]);

  const isNextDisabled =
    view === "week" && currentWeekStart >= startOfCurrentWeek;
  const isPrevDisabled = view === "week" && currentWeekStart <= twoYearsAgo;

  return (
    <div className="mt-4 flex flex-col md:flex-row justify-center items-center gap-4 w-full max-w-5xl mx-auto">
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full mb-4">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => setView(value as "week" | "month")}
          >
            <ToggleGroupItem value="week" aria-label="View data for the week">
              <Calendar className="h-4 w-4" />
              <span className="ml-2 text-sm">Week</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="View data by month">
              <BarChartIcon className="h-4 w-4" />
              <span className="ml-2 text-sm">Month</span>
            </ToggleGroupItem>
          </ToggleGroup>
          {view === "week" && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigateWeek("prev")}
                size="icon"
                variant="outline"
                disabled={isPrevDisabled}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm flex ">
                <span>{currentWeekStart.toLocaleDateString()}</span>
                <span className="hidden sm:block">
                  &nbsp;-&nbsp;
                  {new Date(
                    currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
                  ).toLocaleDateString()}
                </span>
              </span>
              <Button
                onClick={() => navigateWeek("next")}
                size="icon"
                variant="outline"
                disabled={isNextDisabled}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <ChartContainer
          config={chartConfig}
          className="h-[200px] md:h-[350px] lg:h-[450px] w-full"
        >
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              //@ts-ignore
              className="bg-white"
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="Sales" fill="var(--color-Sales)" radius={4} />
            <Bar dataKey="Amount" fill="var(--color-Amount)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="bg-white w-40 h-16 rounded-lg shadow text-center sm:text-left flex justify-center items-center flex-col">
          <p className="text-gray-600 flex justify-center items-center">
            Total Sales
          </p>
          <span className="text-xl font-bold">&nbsp;{totalSales}</span>
        </div>
        <div className="bg-white w-40 h-16 rounded-lg shadow text-center sm:text-left flex justify-center items-center flex-col">
          <p className="text-gray-600 flex justify-center items-center">
            Total Amount
          </p>
          <span className="text-xl font-bold">
            &nbsp;{formatPrice(totalAmount.toString())}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrdersChart;
