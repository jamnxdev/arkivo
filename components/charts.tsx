"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

interface ChartsProps {
  refreshToken?: number;
}

interface ChartPoint {
  date: string;
  total: number;
}

export function Charts({ refreshToken = 0 }: ChartsProps) {
  const [data, setData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    fetch("/api/analytics/timeseries")
      .then((res) => res.json())
      .then((res) => setData(res.data));
  }, [refreshToken]);

  return (
    <LineChart width={400} height={200} data={data}>
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="total" />
    </LineChart>
  );
}
