"use client";

import { StatsFilterBar } from "@/components/stats/filter-bar";
import {
  DATE_RANGE_OPTIONS,
  TIME_GRAIN_OPTIONS,
} from "@/components/stats/stats-series";
import type { DateRangePreset, TimeGrain } from "@/types/stats-types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatsDateRangeGrainControlsProps = {
  /** Shorter label row on narrow layouts (e.g. “Window”). */
  rangeLabel?: string;
  grainLabel?: string;
  range: DateRangePreset;
  onRangeChange: (value: DateRangePreset) => void;
  grain: TimeGrain;
  onGrainChange: (value: TimeGrain) => void;
};

export function StatsDateRangeGrainControls({
  rangeLabel = "Date range",
  grainLabel = "Group by",
  range,
  onRangeChange,
  grain,
  onGrainChange,
}: StatsDateRangeGrainControlsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{rangeLabel}</p>
        <StatsFilterBar>
          {DATE_RANGE_OPTIONS.map(({ id, label }) => (
            <Button
              key={id}
              onClick={() => onRangeChange(id)}
              size="sm"
              variant={range === id ? "default" : "outline"}
            >
              {label}
            </Button>
          ))}
        </StatsFilterBar>
      </div>
      <div className="min-w-[160px] space-y-1">
        <p className="text-xs text-muted-foreground">{grainLabel}</p>
        <Select
          onValueChange={(value) => onGrainChange(value as TimeGrain)}
          value={grain}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIME_GRAIN_OPTIONS.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
