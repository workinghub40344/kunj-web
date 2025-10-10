"use client";

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const sizeArr = [
  "1-no", "2-no", "3-no", "4-no", "5-no", "6-no", "7-no", "8-no",
  "9-no", "10-no", "11-no", "12-no", "5-inch", "6-inch", "7-inch",
  "8-inch", "9-inch", "10-inch", "11-inch", "12-inch", "13-inch",
  "14-inch", "15-inch", "16-inch", "18-inch", "20-inch", "22-inch",
  "24-inch", "30-inch", "36-inch",
];

interface SizeComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SizeCombobox({
  value,
  onChange,
  placeholder = "Select size...",
}: SizeComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal border border-gray-400 focus:border-none"
        >
          {value
            ? sizeArr.find(
                (size) => size.toLowerCase() === value.toLowerCase()
              ) || "Select size..."
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn(
            "w-[500px] p-5 bg-gray-300 max-h-[80vh] overflow-y-auto",
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          )}>
        <div className="grid grid-cols-5 gap-5">
          {sizeArr.map((size) => (
            <Button
              key={size}
              variant="outline"
              onClick={() => {
                onChange(size === value ? "" : size); 
                setOpen(false);
              }}
              className={cn(
                "w-[90px] justify-evenly",
                value === size && "bg-accent text-accent-foreground" 
              )}
            >
              {size}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}