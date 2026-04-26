"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

import { Skeleton } from "@/components/ui/skeleton";

interface ChartsProps {
  refreshToken?: number;
}

interface ChartPoint {
  date: string;
  total: number;
}

export function Charts({ refreshToken = 0 }: ChartsProps) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/analytics/timeseries")
      .then((res) => res.json())
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .finally(() => setIsLoading(false));
  }, [refreshToken]);

  if (isLoading) {
    return <Skeleton className="h-[200px] w-[400px] rounded-lg" />;
  }

  return (
    <LineChart width={400} height={200} data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="total" />
    </LineChart>
  );
}
