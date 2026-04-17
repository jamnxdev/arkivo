"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

type CalendarProps = {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
};

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDate(left: Date, right?: Date) {
  if (!right) return false;
  return normalizeDate(left).getTime() === normalizeDate(right).getTime();
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstOfMonth.getDay() + 6) % 7;

  const days: Date[] = [];

  for (let index = 0; index < startOffset; index += 1) {
    days.push(new Date(year, month, index - startOffset + 1));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    const lastDate = days[days.length - 1];
    days.push(
      new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate() + 1),
    );
  }

  return days;
}

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date(),
  );

  const monthDays = React.useMemo(() => getMonthDays(currentMonth), [currentMonth]);
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  return (
    <div className={cn("w-72 p-3", className)}>
      <div className="mb-2 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() =>
            setCurrentMonth(
              (prevMonth) =>
                new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1),
            )
          }
          aria-label="Previous month"
        >
          <CaretLeftIcon size={16} />
        </Button>
        <p className="text-sm font-medium">{monthLabel}</p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() =>
            setCurrentMonth(
              (prevMonth) =>
                new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1),
            )
          }
          aria-label="Next month"
        >
          <CaretRightIcon size={16} />
        </Button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <span
            key={label}
            className="h-8 text-center text-xs leading-8 font-medium text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((dayDate) => {
          const isOutsideMonth = dayDate.getMonth() !== currentMonth.getMonth();
          const isSelected = isSameDate(dayDate, selected);
          const isToday = isSameDate(dayDate, new Date());

          return (
            <button
              key={dayDate.toISOString()}
              type="button"
              onClick={() => {
                if (mode === "single") {
                  onSelect?.(dayDate);
                }
              }}
              className={cn(
                "h-8 rounded-md text-sm transition-colors",
                isOutsideMonth
                  ? "text-muted-foreground/60"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground",
                isToday && !isSelected ? "border border-border" : "border border-transparent",
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  : null,
              )}
            >
              {dayDate.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
