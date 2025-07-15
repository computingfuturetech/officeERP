// DatePicker.tsx
import { format } from "date-fns";
import * as React from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "../lib/utils";
import { CalendarIcon } from "lucide-react";

export function DatePicker({
    value,
    onChange,
    disabled = false,
    maxDate,
}: {
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
    disabled?: boolean;
    maxDate?: Date;
}) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (selectedDate: Date | undefined) => {
        if (!disabled) {
            onChange(selectedDate);
            setOpen(false);
        }
    };

    return (
        <Popover
            open={open}
            onOpenChange={(newOpen) => {
                if (!disabled) setOpen(newOpen);
            }}
            modal={!disabled}
        >
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        disabled && "cursor-not-allowed opacity-50"
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            {!disabled && (
                <PopoverContent
                    className="w-full p-0"
                    align="start"
                >
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={handleSelect}
                        initialFocus
                        disabled={(date) => date > maxDate}
                    />
                </PopoverContent>
            )}
        </Popover>
    );
}
