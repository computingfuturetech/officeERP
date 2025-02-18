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
  createFixedAmount,
  getFixedAmount,
  updateFixedAmount,
} from "../../services/fixedAmount";

export default function FixedAmount() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingFixedAmount, setEditingFixedAmount] = useState(null);
  const [viewingFixedAmount, setViewingFixedAmount] = useState(null);
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

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleEditSubmit = async (data) => {
    try {
      const response = await updateFixedAmount(editingFixedAmount._id, data);

      if (response.status === 200) {
        setData((prev) =>
          prev.map((fixedAmount) =>
            fixedAmount._id === editingFixedAmount._id
              ? {
                  ...fixedAmount,
                  ...data,
                  updatedAt: formatDate(response?.data?.data?.updatedAt),
                }
              : fixedAmount
          )
        );
        toast({
          title: "Fixed Amount updated",
          description: "Fixed Amount has been successfully updated.",
        });
        setEditingFixedAmount(null);
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
      const response = await createFixedAmount(data);

      if (response.status === 201) {
        setData((prev) => [response?.data?.data, ...prev]);
        toast({
          title: "Fixed Amount created",
          description: "Fixed Amount has been successfully created.",
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
    fetchFixedAmount();
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

  const getFieldConfig = (fixedAmount) => [
    // {
    //   id: "bankOpeningBalance",
    //   label: "Bank Opening Balance",
    //   type: "number",
    //   value: fixedAmount?.bankOpeningBalance || "",
    //   required: true,
    //   placeholder: "Enter bank opening balance",
    // },
    {
      id: "cashOpeningBalance",
      label: "Cash Opening Balance",
      type: "number",
      value: fixedAmount?.cashOpeningBalance || "",
      placeholder: "Enter cash opening balance",
      required: true,
    },
    {
      id: "shareCapital",
      label: "Share Capital",
      type: "number",
      value: fixedAmount?.shareCapital || "",
      placeholder: "Enter share capital",
    },
  ];

  const fetchFixedAmount = async () => {
    try {
      setIsLoading(true);
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await getFixedAmount(queryParams);
      const data = response?.data?.data ? [response?.data?.data] : [];

      const formattedData = data.map((item) => ({
        ...item,
        updatedAt: formatDate(item.updatedAt),
      }));
      setData(formattedData);
    } catch (error) {
      console.error("Error fetching fixed amounts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch fixed amounts data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    // {
    //   accessorKey: "bankOpeningBalance",
    //   header: "Bank Opening Balance",
    // },
    {
      accessorKey: "cashOpeningBalance",
      header: "Cash Opening Balance",
    },
    {
      accessorKey: "shareCapital",
      header: "Share Capital",
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const fixedAmount = row.original;
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
                onClick={() => setEditingFixedAmount(fixedAmount)}
              >
                Edit Fixed Amount
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewingFixedAmount(fixedAmount)}
              >
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
          heading="Fixed Amount"
          columns={columns}
          data={data}
          enableColumnVisibility={true}
          enableFilters={false}
          createButton={
            data.length === 0
              ? {
                  onClick: () => {
                    dismiss();
                    setIsCreateOpen(true);
                  },
                  label: "Create",
                }
              : null
          }
          resetFilters={{
            onClick: handleResetFilters,
            disabled: Object.keys(filters).length === 0,
          }}
        />
      </div>

      <DynamicSheet
        mode="create"
        title="Create Fixed Amount"
        description="Add a new fixed amount to the system."
        fields={getFieldConfig()}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingFixedAmount && (
        <DynamicSheet
          mode="edit"
          title="Edit Fixed Amount"
          description="Make changes to the fixed amount details."
          fields={getFieldConfig(editingFixedAmount)}
          onSubmit={handleEditSubmit}
          open={!!editingFixedAmount}
          onOpenChange={(open) => !open && setEditingFixedAmount(null)}
        />
      )}

      {viewingFixedAmount && (
        <DynamicSheet
          mode="view"
          title="View Fixed Amount"
          description="View fixed amount details."
          fields={getFieldConfig(viewingFixedAmount)}
          onSubmit={() => {}}
          open={!!viewingFixedAmount}
          onOpenChange={(open) => !open && setViewingFixedAmount(null)}
        />
      )}
    </div>
  );
}
