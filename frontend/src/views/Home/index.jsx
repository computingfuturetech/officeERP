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
import { getMemberPlotRecords } from "../../services/memberPlotRecords";

export default function Home() {
  const [memberPlotRecords, setMemberPlotRecords] = useState([]);

  const fetchMemberPlotRecords = useCallback(async () => {
    try {
      const response = await getMemberPlotRecords({
        limit: 5,
      });
      setMemberPlotRecords(response.data.data);
    } catch (error) {
      console.error("Error fetching member plot records:", error);
    }
  }, []);

  useEffect(() => {
    fetchMemberPlotRecords();
  }, [fetchMemberPlotRecords]);

  const memberPlotRecordColumns = [
    {
      accessorKey: "membershipNumber",
      header: "Membership No.",
    },
    {
      accessorKey: "member.name",
      header: "Name",
    },
    {
      accessorKey: "plot.number",
      header: "Plot No.",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <DataTable
        className="bg-white rounded-md drop-shadow-lg shadow p-6"
        heading="Member Plot Records"
        columns={memberPlotRecordColumns}
        data={memberPlotRecords}
        enableFilters={false}
        enableColumnVisibility={false}
        seeAllPath="/member-plot-records"
      />
    </div>
  );
}
