import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";
import { MoreHorizontal, MoreVertical, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/components/data-table";
import RevenueCard from "@/components/components/revenue-card";
import DailyTransactionDisplay from "@/components/components/transaction-card";
import { Button } from "@/components/components/ui/button";
import { DynamicSheet } from "@/components/components/dynamic-sheet";
import { getMembers } from "../../services/members";
import { getTransferIncome } from "../../services/transferIncome";
import { getWaterMaintenance } from "../../services/waterMaintenance";
import { getBankProfit } from "../../services/bankProfit";
import { getOfficeExpense } from "../../services/officeExpense";
import { getSiteExpense } from "../../services/siteExpense";

export default function Home() {
  const [members, setMembers] = useState([]);
  const [transferIncome, setTransferIncome] = useState([]);
  const [waterMaintenance, setWaterMaintenance] = useState([]);
  const [bankProfit, setBankProfit] = useState([]);
  const [officeExpense, setOfficeExpense] = useState([]);
  const [siteExpense, setSiteExpense] = useState([]);

  const fetchMembers = useCallback(async () => {
    try {
      const response = await getMembers({
        limit: 5,
      });
      setMembers(response.data.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  }, []);

  const fetchTransferIncome = useCallback(async () => {
    try {
      const response = await getTransferIncome({ limit: 5 });
      setTransferIncome(response.data.data);
    } catch (error) {
      console.error("Error fetching transfer income:", error);
    }
  }, []);

  const fetchWaterMaintenance = useCallback(async () => {
    try {
      const response = await getWaterMaintenance({ limit: 5 });
      setWaterMaintenance(response.data.data);
    } catch (error) {
      console.error("Error fetching water maintenance:", error);
    }
  }, []);
  const fetchBankProfit = useCallback(async () => {
    try {
      const response = await getBankProfit({ limit: 5 });
      setBankProfit(response.data.data);
    } catch (error) {
      console.error("Error fetching bank profit:", error);
    }
  }, []);
  const fetchOfficeExpense = useCallback(async () => {
    try {
      const response = await getOfficeExpense({ limit: 5 });
      setOfficeExpense(response.data.data);
    } catch (error) {
      console.error("Error fetching office expense:", error);
    }
  }, []);
  const fetchSiteExpense = useCallback(async () => {
    try {
      const response = await getSiteExpense({ limit: 5 });
      setSiteExpense(response.data.data);
    } catch (error) {
      console.error("Error fetching site expense:", error);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchTransferIncome();
    fetchWaterMaintenance();
    fetchBankProfit();
    fetchOfficeExpense();
    fetchSiteExpense();
  }, [fetchMembers]);

  const memberColumns = [
    {
      accessorKey: "msNo",
      header: "Member No",
    },
    {
      accessorKey: "purchaseName",
      header: "Name",
    },
    {
      accessorKey: "plotNo",
      header: "Plot No",
    },
  ];
  const transferIncomeColumns = [
    {
      accessorKey: "msNo.msNo",
      header: "Member No",
    },
    {
      accessorKey: "challanNo",
      header: "Challan No",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
  ];
  const waterMaintenanceColumns = [
    {
      accessorKey: "msNo.msNo",
      header: "Member No",
    },
    {
      accessorKey: "plotNo",
      header: "Plot No",
    },
    {
      accessorKey: "billingMonth",
      header: "Billing Month",
    },
  ];
  const bankProfitColumns = [
    {
      accessorKey: "bank.bankName",
      header: "Bank Name",
    },
    {
      accessorKey: "bank.accountNo",
      header: "Account No",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
  ];
  const officeExpenseColumns = [
    {
      accessorKey: "mainHeadOfAccount.headOfAccount",
      header: "Head of Account",
    },
    {
      accessorKey: "challanNo",
      header: "Challan No",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
  ];
  const siteExpenseColumns = [
    {
      accessorKey: "mainHeadOfAccount.headOfAccount",
      header: "Head of Account",
    },
    {
      accessorKey: "challanNo",
      header: "Challan No",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <DataTable
        className="bg-white rounded-md drop-shadow-lg shadow p-6"
        heading="Members"
        columns={memberColumns}
        data={members}
        enableFilters={false}
        enableColumnVisibility={false}
        seeAllPath="/members"
      />

      <DataTable
        className="bg-white rounded-md drop-shadow-lg shadow p-6"
        heading="Transfer Income"
        columns={transferIncomeColumns}
        data={transferIncome}
        enableFilters={false}
        enableColumnVisibility={false}
        seeAllPath="/transfer-income"
      />
      <DataTable
        className="bg-white rounded-md drop-shadow-lg shadow p-6"
        heading="Water Maintenance"
        columns={waterMaintenanceColumns}
        data={waterMaintenance}
        enableFilters={false}
        enableColumnVisibility={false}
        seeAllPath="/water-maintenance"
      />
      <DataTable
        className="bg-white rounded-md drop-shadow-lg shadow p-6"
        heading="Bank Profit"
        columns={bankProfitColumns}
        data={bankProfit}
        enableFilters={false}
        enableColumnVisibility={false}
        seeAllPath="/bank-profit"
      />
      <DataTable
        className="bg-white rounded-md drop-shadow-lg shadow p-6"
        heading="Office Expense"
        columns={officeExpenseColumns}
        data={officeExpense}
        enableFilters={false}
        enableColumnVisibility={false}
        seeAllPath="/office-expense"
      />
      <DataTable
        className="bg-white rounded-md drop-shadow-lg shadow p-6"
        heading="Site Expense"
        columns={siteExpenseColumns}
        data={siteExpense}
        enableFilters={false}
        enableColumnVisibility={false}
        seeAllPath="/site-expense"
      />
    </div>
  );
}
