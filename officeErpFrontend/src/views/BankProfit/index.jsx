import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";
import { MoreHorizontal, MoreVertical, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/components/data-table";
import RevenueCard from "@/components/components/revenue-card";
import DailyTransactionDisplay from "@/components/components/transaction-card";
import { Button } from "@/components/components/ui/button";
import { DynamicSheet } from "@/components/components/dynamic-sheet";
import { useToast } from "@/components/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createBankProfit,
  getBankProfit,
  updateBankProfit,
} from "../../services/bankProfit";
import { months } from "../../assets/options";

export default function BankProfit() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBankProfit, setEditingBankProfit] = useState(null);
  const [viewingBankProfit, setViewingBankProfit] = useState(null);
  const [originalFilters, setOriginalFilters] = useState({});
  const { toast, dismiss } = useToast();
  const [pagination, setPagination] = useState({
    pageIndex: parseInt(searchParams.get("page")) - 1 || 0,
    pageSize: parseInt(searchParams.get("limit")) || 50,
  });
  const [pageCount, setPageCount] = useState(0);
  const [filters, setFilters] = useState(() => {
    const initialFilters = {};
    searchParams.forEach((value, key) => {
      if (key !== "page" && key !== "limit") {
        initialFilters[key] = value;
      }
    });
    return initialFilters;
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEditSubmit = async (data) => {
    try {
      data.headOfAccount = (originalFilters?.headOfAccount ?? []).find(
        (headOfAccount) => headOfAccount.headOfAccount === "Bank Profit"
      )?._id;
      const response = await updateBankProfit(editingBankProfit._id, data);
      console.log("Edit response:", response);
      if (response.status === 200) {
        setData((prev) =>
          prev.map((bankProfit) =>
            bankProfit._id === editingBankProfit._id
              ? {
                  ...bankProfit,
                  ...response?.data?.data,
                  paidDate: formatDate(response?.data?.data.paidDate),
                }
              : bankProfit
          )
        );
        toast({
          title: "Bank Profit updated",
          description: "Bank Profit has been successfully updated.",
        });
        setEditingBankProfit(null);
      } else {
        toast({
          title: "Edit Failed",
          description:
            response?.data?.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Edit submission error:", error);
      toast({
        title: "Edit Failed",
        description:
          error?.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };
  const handleCreateSubmit = async (data) => {
    try {
      data.headOfAccount = (originalFilters?.headOfAccount ?? []).find(
        (headOfAccount) => headOfAccount.headOfAccount === "Bank Profit"
      )?._id;
      const response = await createBankProfit(data);
      console.log("Create response:", response);

      if (response.status === 201) {
        setData((prev) => [
          {
            ...response?.data?.data,
            paidDate: formatDate(response?.data?.data.paidDate),
          },
          ...prev,
        ]);
        toast({
          title: "Bank Profit created",
          description: "Bank Profit has been successfully created.",
        });
        setIsCreateOpen(false);
        return true;
      } else {
        toast({
          title: "Creation Failed",
          description:
            response?.data?.message || "An unexpected error occurred.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Create submission error:", error);
      toast({
        title: "Creation Failed",
        description:
          error?.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", (pagination.pageIndex + 1).toString());
    params.set("limit", pagination.pageSize.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value.toString());
        }
      }
    });

    setSearchParams(params);
  }, [pagination, filters]);

  useEffect(() => {
    fetchBankProfitData();
  }, [pagination.pageIndex, pagination.pageSize, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  const handleResetFilters = () => {
    setFilters({});
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  const getFieldConfig = (bankProfit) => [
    {
      id: "bank",
      label: "Bank Name",
      type: "select",
      value: bankProfit?.bank?._id || "",
      options: originalFilters?.bankList?.map((bank) => ({
        value: bank._id,
        label: bank.bankName + " - " + bank.accountNo.slice(-4),
      })),
      required: true,
      placeholder: "Enter bank name",
    },
    {
      id: "challanNo",
      label: "Challan No",
      type: "text",
      value: bankProfit?.challanNo || "",
      placeholder: "Enter challan number",
      required: true,
    },
    {
      id: "chequeNumber",
      label: "Cheque No",
      type: "text",
      value: bankProfit?.chequeNumber || "",
      placeholder: "Enter cheque number",
    },
    {
      id: "paidDate",
      label: "Paid Date",
      type: "date",
      value: bankProfit?.paidDate || "",
      placeholder: "Enter paid date",
      required: true,
    },
    {
      id: "amount",
      label: "Amount",
      type: "text",
      value: bankProfit?.amount || "",
      placeholder: "Enter amount",
      required: true,
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-PK", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const fetchBankProfitData = async () => {
    try {
      setIsLoading(true);
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await getBankProfit(queryParams);
      const formattedData = response?.data?.data.map((item) => ({
        ...item,
        paidDate: formatDate(item.paidDate),
      }));

      setData(formattedData);
      setOriginalFilters(response?.data?.filters);
      console.log("Original filters:", response?.data?.filters);
      setPageCount(response?.data?.pagination?.totalPages);
    } catch (error) {
      console.error("Error fetching bankProfit:", error);
      toast({
        title: "Error",
        description: "Failed to fetch bank profit data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "bank.bankName",
      header: "Bank Name",
    },
    {
      accessorKey: "bank.accountNo",
      header: "Account No",
    },
    {
      accessorKey: "paidDate",
      header: "Paid Date",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const bankProfit = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setEditingBankProfit(bankProfit)}
              >
                Edit Bank Profit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewingBankProfit(bankProfit)}
              >
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filterConfig = [
    {
      id: "bank",
      label: "Bank Name",
      type: "select",
      mode: "single",
      options:
        originalFilters?.bankList?.map((bank) => ({
          value: bank._id,
          label: bank.bankName + " - " + bank.accountNo,
        })) || [],
    },
  ];

  return (
    <div>
      <div className="mt-4">
        <DataTable
          heading="Bank Profit"
          columns={columns}
          data={data}
          enableFilters={false}
          enableColumnVisibility={true}
          filters={filterConfig}
          onFilterChange={handleFilterChange}
          pagination={pagination}
          pageCount={pageCount}
          onPaginationChange={setPagination}
          createButton={{
            onClick: () => {
              dismiss();
              setIsCreateOpen(true);
            },
            label: "Create",
          }}
          resetFilters={{
            onClick: handleResetFilters,
            disabled: Object.keys(filters).length === 0,
          }}
        />
      </div>

      <DynamicSheet
        mode="create"
        title="Create Bank Profit"
        description="Add a new bak profit to the system."
        fields={getFieldConfig()}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingBankProfit && (
        <DynamicSheet
          mode="edit"
          title="Edit Bank Profit"
          description="Make changes to the bank profit details."
          fields={getFieldConfig(editingBankProfit)}
          onSubmit={handleEditSubmit}
          open={!!editingBankProfit}
          onOpenChange={(open) => !open && setEditingBankProfit(null)}
        />
      )}

      {viewingBankProfit && (
        <DynamicSheet
          mode="view"
          title="View Bank Profit"
          description="View bank profit details."
          fields={getFieldConfig(viewingBankProfit)}
          onSubmit={() => {}}
          open={!!viewingBankProfit}
          onOpenChange={(open) => !open && setViewingBankProfit(null)}
        />
      )}
    </div>
  );
}
