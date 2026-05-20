// components/DatePickerWithRange.tsx
import React from "react";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "ikon-react-components-lib";

type Props = {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
};

const DatePickerWithRange: React.FC<Props> = ({
  date,
  onDateChange,
  minDate,
  maxDate,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date-picker-range"
          className="justify-start px-2.5 font-normal"
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={onDateChange}
          numberOfMonths={2}
          disabled={(day) => {
            if (minDate && day < minDate) return true;
            if (maxDate && day > maxDate) return true;
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerWithRange;