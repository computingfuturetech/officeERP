import React, { useEffect, useState, useCallback } from "react";
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
import { Calendar as CalendarIcon, Loader2Icon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/components/lib/utils";
import { Calendar } from "@/components/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/components/ui/popover";
import { Label } from "@/components/components/ui/label";
import { useToast } from "@/components/hooks/use-toast";
import {
  getGeneralLedger,
  getIncomeStatement,
  getBalanceSheet,
} from "../../services/reports";
import { getAccounts } from "../../services/chartOfAccount";

// Report types
const REPORT_TYPES = {
  GENERAL_LEDGER: "general-ledger",
  INCOME_STATEMENT: "income-statement",
  BALANCE_SHEET: "balance-sheet",
};

const REPORTS = [
  { value: REPORT_TYPES.GENERAL_LEDGER, label: "General Ledger" },
  { value: REPORT_TYPES.INCOME_STATEMENT, label: "Income Statement" },
  { value: REPORT_TYPES.BALANCE_SHEET, label: "Balance Sheet" },
];

const REPORT_FUNCTIONS = {
  [REPORT_TYPES.GENERAL_LEDGER]: getGeneralLedger,
  [REPORT_TYPES.INCOME_STATEMENT]: getIncomeStatement,
  [REPORT_TYPES.BALANCE_SHEET]: getBalanceSheet,
};

const REPORT_FORMATS = [
  { value: "pdf", label: "PDF" },
  { value: "csv", label: "CSV" },
];

const DatePicker = React.memo(({ label, date, onChange }) => (
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
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  </div>
));

const Reports = () => {
  const useFormState = (initialState) => {
    const [state, setState] = useState(initialState);
    const resetState = () => setState(initialState);
    return [state, setState, resetState];
  };

  const [reportType, setReportType, resetReportType] = useFormState("");
  const [startDate, setStartDate, resetStartDate] = useFormState(null);
  const [endDate, setEndDate, resetEndDate] = useFormState(null);
  const [selectedAccount, setSelectedAccount, resetSelectedAccount] = useFormState("");
  const [reportFormat, setReportFormat, resetReportFormat] = useFormState("csv");
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await getAccounts({ pagination: false });
        setAccounts(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
        toast({
          title: "Error",
          description: "Failed to fetch accounts",
          variant: "destructive",
        });
      }
    };
    fetchAccounts();
  }, [toast]);

  const validateForm = useCallback(() => {
    if (!reportType) {
      toast({
        title: "Report Type Required",
        description: "Please select a report type to proceed.",
        variant: "destructive",
      });
      return false;
    }

    if (!reportFormat) {
      toast({
        title: "Report Format Required",
        description: "Please select a report format to proceed.",
        variant: "destructive",
      });
      return false;
    }

    // if (!startDate || !endDate) {
    //   toast({
    //     title: "Date Range Required",
    //     description: "Please select a date range to generate the report.",
    //     variant: "destructive",
    //   });
    //   return false;
    // }

    return true;
  }, [reportType, reportFormat, startDate, endDate, selectedAccount, toast]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const reportParams = {
      format: reportFormat,
      startDate,
      endDate,
      ...(reportType === REPORT_TYPES.GENERAL_LEDGER && {
        accountId: selectedAccount,
      }),
    };

    try {
      setIsLoading(true);
      const reportFunction = REPORT_FUNCTIONS[reportType];
      const response = await reportFunction(reportParams);

      const url = window.URL.createObjectURL(response);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}_report.${reportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    resetReportType();
    resetStartDate();
    resetEndDate();
    resetSelectedAccount();
  }, [resetReportType, resetStartDate, resetEndDate, resetSelectedAccount]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Financial Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-[3fr_1fr] gap-4">
            <div>
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
                  {REPORTS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select Report Format</Label>
              <Select
                onValueChange={setReportFormat}
                value={reportFormat}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a report format" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_FORMATS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range Selection */}
          {reportType && (
            <div className="grid grid-cols-2 gap-4">
              <DatePicker label="Start Date" date={startDate} onChange={setStartDate} />
              <DatePicker label="End Date" date={endDate} onChange={setEndDate} />
            </div>
          )}

          {/* Account Selection for General Ledger */}
          {reportType === REPORT_TYPES.GENERAL_LEDGER && (
            <div className="space-y-2">
              <Label>Account</Label>
              <Select
                onValueChange={setSelectedAccount}
                value={selectedAccount}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(({ _id, name, code }) => (
                    <SelectItem key={_id} value={_id}>
                      {`${code} ${name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !reportType}
            className="w-full"
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                Generating Report...
              </span>
            ) : (
              "Download Report"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
