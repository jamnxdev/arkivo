"use client";

import { CalendarBlankIcon } from "@phosphor-icons/react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type DatePickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
};

function parseDateOnly(value?: string) {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const localDate = new Date(year, monthIndex, day);

  return Number.isNaN(localDate.getTime()) ? null : localDate;
}

function formatDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value?: string) {
  if (!value) return null;

  const parsedDate = parseDateOnly(value) ?? new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

export function DatePicker({
  value = "",
  onChange,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selectedDate = parseDateOnly(value) ?? undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            data-empty={!selectedDate}
            className={cn(
              "w-full justify-start px-3 text-left font-normal data-[empty=true]:text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarBlankIcon size={16} />
        {formatDate(value) ?? <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent className="z-60 w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            onChange?.(formatDateOnly(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
