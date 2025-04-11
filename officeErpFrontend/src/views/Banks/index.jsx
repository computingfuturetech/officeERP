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
import { createBank, getBanks, updateBank } from "../../services/banks";

export default function Banks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [viewingBank, setViewingBank] = useState(null);
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
      const response = await updateBank(editingBank._id, data);

      if (response.status === 200) {
        setData((prev) =>
          prev.map((bank) =>
            bank._id === editingBank._id
              ? { ...bank, ...response?.data?.data }
              : bank
          )
        );
        toast({
          title: "Bank updated",
          description: "Bank has been successfully updated.",
        });
        setEditingBank(null);
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
      const response = await createBank(data);

      if (response.status === 201) {
        setData((prev) => [response?.data?.data, ...prev]);
        toast({
          title: "Bank created",
          description: "Bank has been successfully created.",
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
    fetchBanks();
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

  const getFieldConfig = (bank) => [
    {
      id: "bankName",
      label: "Bank Name",
      type: "text",
      value: bank?.bankName || "",
      required: true,
      placeholder: "Enter bank name (abbreviation)",
      validate: (value) => {
        const regex = /\(.*\)$/;
        if (!regex.test(value)) {
          return "Bank name must end with '(abbreviation)'";
        }
      },
    },
    {
      id: "accountNo",
      label: "Account No",
      type: "text",
      value: bank?.accountNo || "",
      placeholder: "Enter account number",
      required: true,
    },
    {
      id: "branchName",
      label: "Branch Name",
      type: "text",
      value: bank?.branchName || "",
      placeholder: "Enter branch name",
      required: true,
    },
    {
      id: "branchCode",
      label: "Branch Code",
      type: "text",
      value: bank?.branchCode || "",
      placeholder: "Enter branch code",
      required: true,
    },
    {
      id: "accountName",
      label: "Account Name",
      type: "text",
      value: bank?.accountName || "",
      placeholder: "Enter account name",
      required: true,
    },
    {
      id: "accountType",
      label: "Account Type",
      type: "select",
      value: bank?.accountType || "",
      placeholder: "Enter account type",
      options: [
        { value: "Current", label: "Current" },
        { value: "Saving", label: "Saving" },
      ],
      required: true,
    },
    {
      id: "bankBalance",
      label: "Balance",
      type: "number",
      value: bank?.bankBalance?.balance || "",
      placeholder: "Enter balance",
      required: true,
    },
  ];

  const fetchBanks = async () => {
    try {
      setIsLoading(true);
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await getBanks(queryParams);

      setData(response?.data?.data);
      setPageCount(response?.data?.pagination?.totalPages);
    } catch (error) {
      console.error("Error fetching banks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch banks data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "accountName",
      header: "Account Name",
    },
    {
      accessorKey: "accountNo",
      header: "Account No",
    },
    {
      accessorKey: "accountType",
      header: "Account Type",
    },
    {
      accessorKey: "bankName",
      header: "Bank Name",
    },
    {
      accessorKey: "branchCode",
      header: "Branch Code",
    },
    {
      accessorKey: "bankBalance.balance",
      header: "Balance",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const bank = row.original;
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
              <DropdownMenuItem onClick={() => setEditingBank(bank)}>
                Edit Bank
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewingBank(bank)}>
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div>
      <div className="mt-4">
        <DataTable
          heading="Banks"
          columns={columns}
          data={data}
          enableFilters={false}
          enableColumnVisibility={true}
          // filterableField="msNo"
          // filterableFieldLabel="Bank No"
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
        title="Create Bank"
        description="Add a new bank to the system."
        fields={getFieldConfig()}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingBank && (
        <DynamicSheet
          mode="edit"
          title="Edit Bank"
          description="Make changes to the bank details."
          fields={getFieldConfig(editingBank)}
          onSubmit={handleEditSubmit}
          open={!!editingBank}
          onOpenChange={(open) => !open && setEditingBank(null)}
        />
      )}

      {viewingBank && (
        <DynamicSheet
          mode="view"
          title="View Bank"
          description="View bank details."
          fields={getFieldConfig(viewingBank)}
          onSubmit={() => {}}
          open={!!viewingBank}
          onOpenChange={(open) => !open && setViewingBank(null)}
        />
      )}
    </div>
  );
}
