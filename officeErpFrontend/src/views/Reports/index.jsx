import React, { useEffect, useState } from "react";
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
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/components/lib/utils";
import { Calendar as CalendarComponent } from "@/components/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/components/ui/popover";
import { getBanks } from "../../services/banks";
import { Label } from "@/components/components/ui/label";
import { useToast } from "@/components/hooks/use-toast";
import {
  getBankLedger,
  getCashLedger,
  getGeneralLedger,
} from "../../services/reports";

const DatePicker = ({ label, date, onChange }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700">{label}</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  </div>
);

const Reports = () => {
  const [reportType, setReportType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await getBanks(null);
        setBanks(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };
    fetchBanks();
  }, []);

  const handleSubmit = async () => {
    if (!reportType) {
      return toast({
        title: "Report Type Required",
        description: "Please select a report type to proceed.",
        variant: "destructive",
      });
    }

    const reportParams = {
      startDate,
      endDate,
      ...(reportType === "bank-ledger" && { bank_account: selectedBank }),
    };

    if (!startDate || !endDate) {
      return toast({
        title: "Date Range Required",
        description: "Please select a date range to generate the report.",
        variant: "destructive",
      });
    }

    if (reportType === "bank-ledger" && !selectedBank) {
      return toast({
        title: "Bank Required",
        description: "Please select a bank to generate the report.",
        variant: "destructive",
      });
    }

    try {
      const reportFunctions = {
        "bank-ledger": getBankLedger,
        "cash-ledger": getCashLedger,
        "general-ledger": getGeneralLedger,
      };
      setIsLoading(true);
      const response = await reportFunctions[reportType](reportParams);

      // Download report
      const url = window.URL.createObjectURL(response);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the report. Please try again.",
        variant: "destructive",
      });
      console.error("Error downloading report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const reports = [
    { value: "bank-ledger", label: "Bank Ledger" },
    { value: "general-ledger", label: "General Ledger" },
    { value: "cash-ledger", label: "Cash Ledger" },
  ];

  const resetForm = () => {
    setReportType("");
    setStartDate(null);
    setEndDate(null);
    setSelectedBank(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Financial Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label>Select Report Type</Label>
            <Select
              onValueChange={(value) => {
                resetForm();
                setReportType(value);
              }}
              value={reportType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a report type" />
              </SelectTrigger>
              <SelectContent>
                {reports.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Start Date"
              date={startDate}
              onChange={setStartDate}
            />
            <DatePicker label="End Date" date={endDate} onChange={setEndDate} />
          </div>

          {/* Bank Selection (Only for Bank Ledger) */}
          {reportType === "bank-ledger" && (
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Select
                onValueChange={setSelectedBank}
                value={selectedBank}
                placeholder="Choose a bank"
                className="w-full"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map(({ _id, bankName, accountNo }) => (
                    <SelectItem key={_id} value={accountNo}>
                      {bankName} - {accountNo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Download Button */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Generating Report..." : "Download Report"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
