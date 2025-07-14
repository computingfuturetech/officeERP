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
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "../../services/voucher";
import { formatDate } from "@/utils/commonUtils";
import { getAccounts } from "@/services/chartOfAccount";
import DeleteModal from "@/components/components/delete-modal";

export default function Vouchers() {
  const { toast, dismiss } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [viewingVoucher, setViewingVoucher] = useState(null);
  const [deletingVoucher, setDeletingVoucher] = useState(null);
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
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const handleEditSubmit = async (data) => {
    try {
      const response = await updateVoucher(editingVoucher._id, data);
      const updatedVoucher = response?.data?.data;
      if (updatedVoucher)
        updatedVoucher.voucherDate = formatDate(updatedVoucher.voucherDate);

      if (response.status === 200) {
        setData((prev) =>
          prev.map((voucher) =>
            voucher._id === editingVoucher._id
              ? { ...voucher, ...updatedVoucher }
              : voucher
          )
        );
        toast({
          title: "Voucher updated",
          description: "Voucher has been successfully updated.",
        });
        setEditingVoucher(null);
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
      const response = await createVoucher(data);
      const createdVoucher = response?.data?.data;
      if (createdVoucher)
        createdVoucher.voucherDate = formatDate(createdVoucher.voucherDate);

      if (response.status === 201) {
        setData((prev) => [createdVoucher, ...prev]);
        toast({
          title: "Voucher created",
          description: "Voucher has been successfully created.",
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

  const handleDelete = async (voucher) => {
    try {
      setIsDeleteLoading(true);
      const response = await deleteVoucher(voucher._id);

      if (response.status === 200) {
        toast({
          title: "Voucher deleted",
          description: "Voucher has been successfully deleted.",
        });
        setDeletingVoucher(null);
        await fetchVouchers();
      } else {
        toast({
          title: "Deletion Failed",
          description:
            response?.data?.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete submission error:", error);
      toast({
        title: "Deletion Failed",
        description:
          error?.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  useEffect(() => {
    const fetchaccounts = async () => {
      try {
        const response = await getAccounts({
          pagination: "false",
        });
        setAccounts(response?.data?.data || []);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchaccounts();
  }, []);

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
    fetchVouchers();
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

  const getDefaultVoucherEntries = () => [
    {
      account: "",
      creditAmount: "0",
      debitAmount: "0",
      particulars: "",
    },
    {
      account: "",
      creditAmount: "0",
      debitAmount: "0",
      particulars: "",
    },
  ];

  const getFieldConfig = (voucher) => [
    {
      id: "voucherType",
      label: "Voucher Type",
      type: "select",
      value: voucher?.voucherType,
      options: [
        { label: "Cash Receipt Voucher (CRV)", value: "Cash Receipt Voucher" },
        { label: "Bank Receipt Voucher (BRV)", value: "Bank Receipt Voucher" },
        { label: "Cash Payment Voucher (CPV)", value: "Cash Payment Voucher" },
        { label: "Bank Payment Voucher (BPV)", value: "Bank Payment Voucher" },
        { label: "Journal Voucher (JV)", value: "Journal Voucher" },
      ],
      placeholder: "Select voucher type",
      required: true,
    },
    ...(editingVoucher
      ? [
          {
            id: "voucherNumber",
            label: "Voucher Number",
            type: "text",
            value: voucher?.voucherNumber || "",
            required: true,
            placeholder: "Enter voucher number",
            readOnly: true,
          },
        ]
      : []),
    {
      id: "voucherDate",
      label: "Voucher Date",
      type: "date",
      value: voucher?.voucherDate || "",
      required: true,
      placeholder: "Select voucher date",
    },
    {
      id: "amount",
      label: "Amount",
      type: "number",
      value: voucher?.amount || "",
      required: true,
      placeholder: "Enter amount",
      min: 0,
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      value: voucher?.status || "Pending",
      options: [
        { label: "Pending", value: "Pending" },
        { label: "Approved", value: "Approved" },
        { label: "Posted", value: "Posted" },
        { label: "Rejected", value: "Rejected" },
      ],
      placeholder: "Select status",
      required: true,
    },
    {
      id: "referenceNumber",
      label: "Reference Number",
      type: "text",
      value: voucher?.referenceNumber || "",
      required: false,
      placeholder: "Enter reference number",
    },
    {
      id: "voucherEntries",
      label: "Voucher Entries",
      type: "fieldSet",
      value:
        voucher?.voucherEntries?.map((entry) => ({
          creditAmount: entry.creditAmount || "0",
          debitAmount: entry.debitAmount || "0",
          particulars: entry.particulars || "",
          account: entry.account || "",
        })) || getDefaultVoucherEntries(),
      required: true,
      gridColumns: 2,
      fieldSetTemplate: [
        {
          id: "account",
          label: "Account",
          placeholder: "Select account",
          type: "select",
          value: "",
          required: true,
          options: accounts.map((account) => ({
            label: `${account.code} - ${account.name}`,
            value: account._id,
          })),
        },
        {
          id: "creditAmount",
          label: "Credit Amount",
          type: "number",
          value: "",
          required: true,
          placeholder: "Enter credit amount",
        },
        {
          id: "debitAmount",
          label: "Debit Amount",
          type: "number",
          value: "",
          required: true,
          placeholder: "Enter debit amount",
        },
        {
          id: "particulars",
          label: "Particulars",
          type: "textarea",
          value: "",
          required: true,
          placeholder: "Enter particulars",
        },
      ],
    },
  ];

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };
      const response = await getVouchers(queryParams);

      const voucherData = response?.data?.data || [];
      voucherData.forEach((voucher) => {
        voucher.voucherDate = formatDate(voucher.voucherDate);
      });
      setData(voucherData);
      setPageCount(response?.data?.meta?.pagination?.totalPages);
    } catch (error) {
      console.error("Error fetching Vouchers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch Vouchers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "voucherType",
      header: "Voucher Type",
    },
    {
      accessorKey: "voucherNumber",
      header: "Voucher Number",
    },
    {
      accessorKey: "voucherDate",
      header: "Voucher Date",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "referenceNumber",
      header: "Reference Number",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const voucher = row.original;
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
              <DropdownMenuItem onClick={() => setEditingVoucher(voucher)}>
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewingVoucher(voucher)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeletingVoucher(voucher)}>
                Delete Voucher
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
          heading="Vouchers"
          columns={columns}
          data={data}
          enableFilters={true}
          enableColumnVisibility={true}
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
          filters={[
            {
              id: "voucherType",
              type: "select",
              label: "Voucher Type",
              placeholder: "Search by Voucher Type",
              options: [
                {
                  label: "Cash Receipt Voucher (CRV)",
                  value: "Cash Receipt Voucher",
                },
                {
                  label: "Bank Receipt Voucher (BRV)",
                  value: "Bank Receipt Voucher",
                },
                {
                  label: "Cash Payment Voucher (CPV)",
                  value: "Cash Payment Voucher",
                },
                {
                  label: "Bank Payment Voucher (BPV)",
                  value: "Bank Payment Voucher",
                },
                { label: "Journal Voucher (JV)", value: "Journal Voucher" },
              ],
            },
          ]}
        />
      </div>

      <DynamicSheet
        mode="create"
        title="Create Voucher"
        description="Add a new Voucher."
        fields={getFieldConfig()}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingVoucher && (
        <DynamicSheet
          mode="edit"
          title="Edit Voucher"
          description="Make changes to the Voucher details."
          fields={getFieldConfig(editingVoucher)}
          onSubmit={handleEditSubmit}
          open={!!editingVoucher}
          onOpenChange={(open) => !open && setEditingVoucher(null)}
        />
      )}

      {viewingVoucher && (
        <DynamicSheet
          mode="view"
          title="View Voucher"
          description="View Voucher details."
          fields={getFieldConfig(viewingVoucher)}
          onSubmit={() => {}}
          open={!!viewingVoucher}
          onOpenChange={(open) => !open && setViewingVoucher(null)}
        />
      )}

      {deletingVoucher && (
        <DeleteModal
          open={!!deletingVoucher}
          onOpenChange={(open) => !open && setDeletingVoucher(null)}
          title={`Delete Voucher ${deletingVoucher.voucherNumber}`}
          description={`Are you sure you want to delete the voucher with number ${deletingVoucher.voucherNumber}? This action cannot be undone.`}
          onConfirm={() => handleDelete(deletingVoucher)}
          onCancel={() => {
            setDeletingVoucher(null);
          }}
          isLoading={isDeleteLoading}
        />
      )}
    </div>
  );
}
