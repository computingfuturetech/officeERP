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
import {
  createWaterMaintenance,
  getWaterMaintenance,
  updateWaterMaintenance,
} from "../../services/waterMaintenance";
import WaterMaintenanceForm from "../../components/components/add-mulitple";
import AddMultiple from "../../components/components/add-mulitple";

export default function WaterMaintenance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWaterMaintenance, setEditingWaterMaintenance] = useState(null);
  const [viewingWaterMaintenance, setViewingWaterMaintenance] = useState(null);
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
        (headOfAccount) =>
          headOfAccount.headOfAccount === "Water/Maintenance Bill"
      )?._id;
      const response = await updateWaterMaintenance(
        editingWaterMaintenance._id,
        data
      );
      if (response.status === 200) {
        setData((prev) =>
          prev.map((waterMaintenance) =>
            waterMaintenance._id === editingWaterMaintenance._id
              ? {
                  ...waterMaintenance,
                  ...response?.data?.data,
                  paidDate: formatDate(response?.data?.data.paidDate),
                }
              : waterMaintenance
          )
        );
        toast({
          title: "Water Maintenance updated",
          description: "Water Maintenance has been successfully updated.",
        });
        setEditingWaterMaintenance(null);
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
        (headOfAccount) =>
          headOfAccount.headOfAccount === "Water/Maintenance Bill"
      )?._id;
      const response = await createBankProfit(data);

      if (response.status === 201) {
        setData((prev) => [
          {
            ...response?.data?.data,
            paidDate: formatDate(response?.data?.data?.paidDate),
          },
          ...prev,
        ]);
        toast({
          title: "Water Maintenance created",
          description: "Water Maintenance has been successfully created.",
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
    fetchWaterMaintenance();
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

  const getFieldConfig = (waterMaintenance) => [
    {
      id: "msNo",
      label: "Member No",
      type: "text",
      value: waterMaintenance?.msNo?.msNo || "",
      required: true,
      placeholder: "Enter member number",
      readOnly: true,
    },
    {
      id: "purchaseName",
      label: "Member Name",
      type: "text",
      value: waterMaintenance?.msNo?.purchaseName || "",
      placeholder: "Enter member name",
      required: true,
      readOnly: true,
    },
    {
      id: "challanNo",
      label: "Challan No",
      type: "text",
      value: waterMaintenance?.challanNo || "",
      placeholder: "Enter challan number",
      required: true,
    },
    {
      id: "referenceNo",
      label: "Reference No",
      type: "text",
      value: waterMaintenance?.referenceNo || "",
      placeholder: "Enter reference number",
      required: true,
      readOnly: true,
    },
    {
      id: "plotNo",
      label: "Plot No",
      type: "text",
      value: waterMaintenance?.plotNo || "",
      placeholder: "Enter plot number",
      required: true,
      readOnly: true,
    },
    {
      id: "month",
      label: "Month",
      type: "select",
      value: waterMaintenance?.billingMonth || "",
      options: months,
      required: true,
      readOnly: true,
    },
    {
      id: "paidDate",
      label: "Paid Date",
      type: "date",
      value: waterMaintenance?.paidDate || "",
      placeholder: "Enter paid date",
      required: true,
      readOnly: true,
    },
    {
      id: "amount",
      label: "Amount",
      type: "text",
      value: waterMaintenance?.amount || "",
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

  const fetchWaterMaintenance = async () => {
    try {
      setIsLoading(true);
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await getWaterMaintenance(queryParams);
      const formattedData = response?.data?.data.map((item) => ({
        ...item,
        paidDate: formatDate(item?.paidDate),
      }));

      setData(formattedData);
      setOriginalFilters(response?.data?.filters);
      setPageCount(response?.data?.pagination?.totalPages);
    } catch (error) {
      console.error("Error fetching bankProfit:", error);
      toast({
        title: "Error",
        description: "Failed to fetch water maintenance data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "msNo.msNo",
      header: "Member No",
    },
    {
      accessorKey: "msNo.purchaseName",
      header: "Member Name",
    },
    {
      accessorKey: "plotNo",
      header: "Plot No",
    },
    {
      accessorKey: "billingMonth",
      header: "Billing Month",
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
        const bankProfit = row?.original;
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
                onClick={() => setEditingWaterMaintenance(bankProfit)}
              >
                Edit Water Maintenance
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewingWaterMaintenance(bankProfit)}
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
      id: "billingMonth",
      label: "Billing Month",
      type: "select",
      mode: "single",
      options: months,
    },
  ];
  const handleSubmit = async (formData) => {
    try {
      formData?.map((data) => {
        data.headOfAccount = (originalFilters?.headOfAccount ?? [])?.find(
          (headOfAccount) =>
            headOfAccount.headOfAccount === "Water/Maintenance Bill"
        )?._id;
      });
      const response = await createWaterMaintenance(formData);
      if (response?.status === 201) {
        toast({
          title: "Water Maintenance created",
          description: "Water Maintenance has been successfully created.",
        });
        fetchWaterMaintenance();
      } else {
        toast({
          title: "Creation Failed",
          description:
            response?.data?.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
      return response;
    } catch (error) {
      toast({
        title: "Creation Failed",
        description:
          error?.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const fields = [
    {
      id: "msNo",
      label: "Member Num",
      type: "text",
      required: true,
      placeholder: "Enter member number",
    },
    {
      id: "challanNo",
      label: "Challan No",
      type: "text",
      required: true,
      placeholder: "Enter challan number",
    },
    {
      id: "plotNum",
      label: "Plot Num",
      type: "text",
      required: true,
      placeholder: "Enter plot number",
    },
    {
      id: "referenceNo",
      label: "Reference Num",
      type: "text",
      required: true,
      placeholder: "Enter reference number",
    },
    {
      id: "billingMonth",
      label: "Billing Month",
      placeholder: "Select billing month",
      type: "select",
      required: true,
      options: months,
    },
    {
      id: "paidDate",
      label: "Paid Date",
      type: "date",
      required: true,
      placeholder: "Select paid date",
    },
    {
      id: "amount",
      label: "Amount",
      type: "number",
      required: true,
      placeholder: "Enter amount",
    },
  ];
  return (
    <div>
      <AddMultiple
        title="Add Water Maintenance"
        fields={fields}
        onSubmit={handleSubmit}
        gridCols="grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
        enableMultiple={true}
        submitButtonText="Save Bills"
        addNewButtonText="+ Add New"
      />{" "}
      <div className="mt-4">
        <DataTable
          heading="Water Maintenance"
          columns={columns}
          data={data}
          enableFilters={true}
          filterableField="plotNo"
          filterableFieldLabel="Plot No"
          enableColumnVisibility={true}
          filters={filterConfig}
          onFilterChange={handleFilterChange}
          pagination={pagination}
          pageCount={pageCount}
          onPaginationChange={setPagination}
          resetFilters={{
            onClick: handleResetFilters,
            disabled: Object.keys(filters).length === 0,
          }}
        />
      </div>
      {editingWaterMaintenance && (
        <DynamicSheet
          mode="edit"
          title="Edit Water Maintenance"
          description="Make changes to the water maintenance details."
          fields={getFieldConfig(editingWaterMaintenance)}
          onSubmit={handleEditSubmit}
          open={!!editingWaterMaintenance}
          onOpenChange={(open) => !open && setEditingWaterMaintenance(null)}
        />
      )}
      {viewingWaterMaintenance && (
        <DynamicSheet
          mode="view"
          title="View Water Maintenance"
          description="View water maintenance details."
          fields={getFieldConfig(viewingWaterMaintenance)}
          onSubmit={() => {}}
          open={!!viewingWaterMaintenance}
          onOpenChange={(open) => !open && setViewingWaterMaintenance(null)}
        />
      )}
    </div>
  );
}
