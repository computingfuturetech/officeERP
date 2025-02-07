import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/components/ui/select";
import { Button } from "@/components/components/ui/button";
import { Input } from "@/components/components/ui/input";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/components/lib/utils";
import { Calendar as CalendarComponent } from "@/components/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/components/ui/popover";

const Reports = () => {
  const [reportType, setReportType] = useState("");
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const reports = [
    { value: "bank-ledger", label: "Bank Ledger" },
    { value: "cash-book", label: "Cash Book" },
    { value: "income-statement", label: "Income Statement" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="bg-white shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Financial Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Select Report Type
            </label>
            <Select onValueChange={setReportType} value={reportType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a report type" />
              </SelectTrigger>
              <SelectContent>
                {reports.map((report) => (
                  <SelectItem key={report.value} value={report.value}>
                    {report.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Bank Name Field - Only shown for Bank Ledger */}
          {reportType === "bank-ledger" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Bank Name
              </label>
              <Input
                type="text"
                placeholder="Enter bank name"
                className="w-full"
              />
            </div>
          )}

          {/* Income Statement Fields */}
          {reportType === "income-statement" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Taxation Amount
                </label>
                <Input
                  type="number"
                  placeholder="Enter taxation amount"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Accumulated Surplus
                </label>
                <Input
                  type="number"
                  placeholder="Enter accumulated surplus"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Download Button */}
          <Button className="w-full  text-white py-2 rounded-lg transition-colors">
            Download Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
