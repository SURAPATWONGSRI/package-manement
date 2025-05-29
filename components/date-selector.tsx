"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

interface DateSelectorProps {
  startDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
}

export function DateSelector({
  startDate,
  onStartDateChange,
}: DateSelectorProps) {
  // Allow any date selection (including past dates)
  // Server will handle Thailand timezone conversion when saving

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">เลือกวันที่เริ่มใช้งาน</h3>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full md:w-auto justify-start text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate
              ? format(startDate, "dd MMMM yyyy", { locale: th })
              : "เลือกวันที่เริ่มใช้งาน"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={onStartDateChange}
            // Remove disabled prop to allow past dates
            initialFocus
            locale={th}
          />
        </PopoverContent>
      </Popover>
      {startDate && <div className="mt-2 space-y-1"></div>}
    </div>
  );
}
