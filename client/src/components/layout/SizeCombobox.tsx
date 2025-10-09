"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


const sizeArr = [
  "1-no", "2-no", "3-no", "4-no", "5-no", "6-no", "7-no", "8-no", "9-no", "10-no",
  "11-no", "12-no", "13-no", "14-no", "15-no", "16-no", "17-no", "18-no", "19-no", "20-no",
  "21-no", "22-no", "23-no", "24-no", "25-no", "26-no", "27-no", "28-no", "29-no", "30-no",
  "1-inch", "2-inch", "3-inch", "4-inch", "5-inch", "6-inch", "7-inch", "8-inch", "9-inch", "10-inch",
  "11-inch", "12-inch", "13-inch", "14-inch", "15-inch", "16-inch", "17-inch", "18-inch", "19-inch", "20-inch",
  "21-inch", "22-inch", "23-inch", "24-inch", "25-inch", "26-inch", "27-inch", "28-inch", "29-inch", "30-inch",
];

interface SizeComboboxProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SizeCombobox({ value, onChange, placeholder = "Select size..." }: SizeComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal border border-gray-400 focus:border-none"
        >
          {value
            ? sizeArr.find((size) => size.toLowerCase() === value.toLowerCase()) || "Select size..."
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search size..." />
          <CommandList>
            <CommandEmpty>No size found.</CommandEmpty>
            <CommandGroup>
              {sizeArr.map((size) => (
                <CommandItem
                    className="border border-gray-400 focus:border-none"
                  key={size}
                  value={size}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === size ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {size}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}