import React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
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
import { getAccounts } from "../../services/chartOfAccounts";

// Constants
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

const INITIAL_FORM_STATE = {
  reportType: "",
  startDate: null,
  endDate: null,
  selectedAccount: "",
  reportFormat: "csv",
};

// DatePicker Component
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
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  </div>
);

// Memoized to prevent unnecessary re-renders
const MemoizedDatePicker = React.memo(DatePicker);

const Reports = () => {
  const { toast } = useToast();
  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    try {
      const response = await getAccounts({ pagination: false });
      setAccounts(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch accounts.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Form validation
  const validateForm = useCallback(() => {
    const { reportType, reportFormat, selectedAccount } = formState;

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

    if (reportType === REPORT_TYPES.GENERAL_LEDGER && !selectedAccount) {
      toast({
        title: "Account Required",
        description: "Please select an account for General Ledger report.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [formState, toast]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    const { reportType, reportFormat, startDate, endDate, selectedAccount } =
      formState;
    const reportParams = {
      format: reportFormat,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(reportType === REPORT_TYPES.GENERAL_LEDGER &&
        selectedAccount && {
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
        description:
          error?.response?.data?.message || "Could not download the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [formState, validateForm, toast]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormState(INITIAL_FORM_STATE);
  }, []);

  // Handle form field changes
  const handleFieldChange = useCallback((field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
      // Reset account when switching report types
      ...(field === "reportType" && { selectedAccount: "" }),
    }));
  }, []);

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Memoized account options
  const accountOptions = useMemo(
    () =>
      accounts.map(({ _id, name, code }) => ({
        value: _id,
        label: `${code} ${name}`,
      })),
    [accounts]
  );

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
                onValueChange={(value) =>
                  handleFieldChange("reportType", value)
                }
                value={formState.reportType}
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
                onValueChange={(value) =>
                  handleFieldChange("reportFormat", value)
                }
                value={formState.reportFormat}
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

          {formState.reportType && (
            <div className="grid grid-cols-2 gap-4">
              <MemoizedDatePicker
                label="Start Date"
                date={formState.startDate}
                onChange={(date) => handleFieldChange("startDate", date)}
              />
              <MemoizedDatePicker
                label="End Date"
                date={formState.endDate}
                onChange={(date) => handleFieldChange("endDate", date)}
              />
            </div>
          )}

          {formState.reportType === REPORT_TYPES.GENERAL_LEDGER && (
            <div className="space-y-2">
              <Label>Account</Label>
              <Select
                onValueChange={(value) =>
                  handleFieldChange("selectedAccount", value)
                }
                value={formState.selectedAccount}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an account" />
                </SelectTrigger>
                <SelectContent>
                  {accountOptions.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formState.reportType}
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
