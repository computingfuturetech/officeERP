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
import { getBanks } from "../../services/banks";
import { Label } from "@/components/components/ui/label";
import { Input } from "@/components/components/ui/input";
import { useToast } from "@/components/hooks/use-toast";
import {
  getBankLedger,
  getCashLedger,
  getGeneralLedger,
  getIncomeRecord,
  getBalanceSheet,
} from "../../services/reports";

const REPORT_TYPES = {
  BANK_LEDGER: "bank-ledger",
  GENERAL_LEDGER: "general-ledger",
  CASH_LEDGER: "cash-ledger",
  INCOME_RECORD: "income-record",
  BALANCE_SHEET: "balance-sheet",
};

const REPORTS = [
  { value: REPORT_TYPES.BANK_LEDGER, label: "Bank Ledger" },
  { value: REPORT_TYPES.GENERAL_LEDGER, label: "General Ledger" },
  { value: REPORT_TYPES.CASH_LEDGER, label: "Cash Ledger" },
  { value: REPORT_TYPES.INCOME_RECORD, label: "Income Record" },
  { value: REPORT_TYPES.BALANCE_SHEET, label: "Balance Sheet" },
];

const REPORT_FUNCTIONS = {
  [REPORT_TYPES.BANK_LEDGER]: getBankLedger,
  [REPORT_TYPES.CASH_LEDGER]: getCashLedger,
  [REPORT_TYPES.GENERAL_LEDGER]: getGeneralLedger,
  [REPORT_TYPES.INCOME_RECORD]: getIncomeRecord,
  [REPORT_TYPES.BALANCE_SHEET]: getBalanceSheet,
};

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

const FormInput = React.memo(({ label, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input
      type="number"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
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
  const [selectedBank, setSelectedBank, resetSelectedBank] = useFormState(null);
  const [year, setYear] = useFormState(null);
  const [banks, setBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [financialData, setFinancialData] = useState({
    accumulatedSurplusBrought: "",
    taxation: "",
    reserveFund: "",
    shareDeposit: "",
    tradePayable: "",
    provisionForTax: "",
    accumulatedSurplus: "",
    intangibleAssets: "",
    purchaseCostOfLand: "",
    longTermSecurities: "",
    loanAndAdvances: "",
  });

  const { toast } = useToast();

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await getBanks(null);
        setBanks(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching banks:", error);
        toast({
          title: "Error",
          description: "Failed to fetch banks data",
          variant: "destructive",
        });
      }
    };
    fetchBanks();
  }, [toast]);

  // Form validation
  const validateForm = useCallback(() => {
    if (!reportType) {
      toast({
        title: "Report Type Required",
        description: "Please select a report type to proceed.",
        variant: "destructive",
      });
      return false;
    }

    if (
      reportType !== REPORT_TYPES.INCOME_RECORD &&
      reportType !== REPORT_TYPES.BALANCE_SHEET &&
      (!startDate || !endDate)
    ) {
      toast({
        title: "Date Range Required",
        description: "Please select a date range to generate the report.",
        variant: "destructive",
      });
      return false;
    }

    if (reportType === REPORT_TYPES.BANK_LEDGER && !selectedBank) {
      toast({
        title: "Bank Required",
        description: "Please select a bank to generate the report.",
        variant: "destructive",
      });
      return false;
    }
    if (reportType === REPORT_TYPES.INCOME_RECORD && !year) {
      toast({
        title: "Year Required",
        description: "Please select a year to generate the report.",
        variant: "destructive",
      });
      return false;
    }
    if (reportType === REPORT_TYPES.BALANCE_SHEET && !year) {
      toast({
        title: "Year Required",
        description: "Please select a year to generate the report.",
        variant: "destructive",
      });
      return;
    }

    return true;
  }, [reportType, startDate, endDate, selectedBank, toast, year]);

  // Handle report generation
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const reportParams = {
      startDate,
      endDate,
      ...(reportType === REPORT_TYPES.BANK_LEDGER && {
        bank_account: selectedBank,
      }),
      ...(reportType === REPORT_TYPES.INCOME_RECORD && {
        year,
        taxation: financialData.taxation,
        accumulated_surplus_brought_forward:
          financialData.accumulatedSurplusBrought,
      }),
      ...(reportType === REPORT_TYPES.BALANCE_SHEET && {
        year,
        reserve_fund: financialData.reserveFund,
        accumulated_surplus: financialData.accumulatedSurplus,
        share_deposit_money: financialData.shareDeposit,
        trade_and_other_payable: financialData.tradePayable,
        provision_for_taxation: financialData.provisionForTax,
        intangible_assets: financialData.intangibleAssets,
        purchase_cost_of_land_development: financialData.purchaseCostOfLand,
        long_term_security_deposit: financialData.longTermSecurities,
        loan_and_advances: financialData.loanAndAdvances,
      }),
    };

    try {
      setIsLoading(true);
      const reportFunction = REPORT_FUNCTIONS[reportType];
      const response = await reportFunction(reportParams);

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

  // Reset form
  const resetForm = useCallback(() => {
    resetReportType();
    resetStartDate();
    resetEndDate();
    resetSelectedBank();
    setFinancialData({
      accumulatedSurplusBrought: "",
      taxation: "",
      reserveFund: "",
      shareDeposit: "",
      tradePayable: "",
      provisionForTax: "",
      accumulatedSurplus: "",
      intangibleAssets: "",
      purchaseCostOfLand: "",
      longTermSecurities: "",
      loanAndAdvances: "",
    });
  }, [resetReportType, resetStartDate, resetEndDate, resetSelectedBank]);

  // Handle financial data changes
  const handleFinancialDataChange = (field) => (value) => {
    setFinancialData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
                {REPORTS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Selection */}
          {reportType &&
            ![REPORT_TYPES.INCOME_RECORD, REPORT_TYPES.BALANCE_SHEET].includes(
              reportType
            ) && (
              <div className="grid grid-cols-2 gap-4">
                <DatePicker
                  label="Start Date"
                  date={startDate}
                  onChange={setStartDate}
                />
                <DatePicker
                  label="End Date"
                  date={endDate}
                  onChange={setEndDate}
                />
              </div>
            )}
          {/* Year Selection */}
          {[REPORT_TYPES.INCOME_RECORD, REPORT_TYPES.BALANCE_SHEET].includes(
            reportType
          ) && (
            <div className="space-y-2">
              <Label>Year</Label>
              <Select
                onValueChange={(value) => {
                  setYear(value);
                }}
                value={year}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 50 }, (_, i) => {
                    const yearValue = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={yearValue} value={yearValue}>
                        {yearValue}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Income Record Fields */}
          {reportType === REPORT_TYPES.INCOME_RECORD && (
            <div className="grid grid-cols-2 gap-2">
              <FormInput
                label="Accumulated Surplus"
                value={financialData.accumulatedSurplusBrought}
                placeholder="Enter Accumulated Surplus"
                onChange={handleFinancialDataChange(
                  "accumulatedSurplusBrought"
                )}
              />
              <FormInput
                label="Taxation"
                value={financialData.taxation}
                placeholder="Enter Taxation"
                onChange={handleFinancialDataChange("taxation")}
              />
            </div>
          )}

          {/* Balance Sheet Fields */}
          {reportType === REPORT_TYPES.BALANCE_SHEET && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "reserveFund", label: "Reserve Fund" },
                { key: "shareDeposit", label: "Share Deposit" },
                { key: "tradePayable", label: "Trade Payable" },
                { key: "provisionForTax", label: "Provision for Tax" },
                { key: "accumulatedSurplus", label: "Accumulated Surplus" },
                { key: "intangibleAssets", label: "Intangible Assets" },
                { key: "purchaseCostOfLand", label: "Purchase Cost of Land" },
                { key: "longTermSecurities", label: "Long Term Securities" },
                { key: "loanAndAdvances", label: "Loan and Advances" },
              ].map(({ key, label }) => (
                <FormInput
                  key={key}
                  label={label}
                  placeholder={`Enter ${label}`}
                  value={financialData[key]}
                  onChange={handleFinancialDataChange(key)}
                />
              ))}
            </div>
          )}

          {/* Bank Selection */}
          {reportType === REPORT_TYPES.BANK_LEDGER && (
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Select onValueChange={setSelectedBank} value={selectedBank}>
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
