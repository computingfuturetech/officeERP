import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";
import { MoreVertical, Plus, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/components/data-table";
import { Button } from "@/components/components/ui/button";
import { DynamicSheet } from "@/components/components/dynamic-sheet";
import { useToast } from "@/components/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import {
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} from "@/services/vouchers";
import { getAccounts } from "@/services/chartOfAccounts";
import { formatDate } from "@/utils/commonUtils";
import DeleteModal from "@/components/components/delete-modal";

// Constants
const DEFAULT_PAGINATION = {
  pageIndex: 0,
  pageSize: 20,
};

const VOUCHER_TYPES = [
  { label: "Cash Receipt Voucher (CRV)", value: "Cash Receipt Voucher" },
  { label: "Bank Receipt Voucher (BRV)", value: "Bank Receipt Voucher" },
  { label: "Cash Payment Voucher (CPV)", value: "Cash Payment Voucher" },
  { label: "Bank Payment Voucher (BPV)", value: "Bank Payment Voucher" },
  { label: "Journal Voucher (JV)", value: "Journal Voucher" },
];

const STATUS_OPTIONS = [
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Posted", value: "Posted" },
  { label: "Rejected", value: "Rejected" },
];

const DEFAULT_VOUCHER_ENTRIES = [
  { account: "", creditAmount: "0", debitAmount: "0", particulars: "" },
  { account: "", creditAmount: "0", debitAmount: "0", particulars: "" },
];

// Field configuration for the form
const getFieldConfig = (voucher = {}, accounts = [], isEditing = false) => [
  {
    id: "voucherType",
    label: "Voucher Type",
    type: "select",
    value: voucher.voucherType || "",
    options: VOUCHER_TYPES,
    placeholder: "Select voucher type",
    required: true,
  },
  ...(isEditing
    ? [
        {
          id: "voucherNumber",
          label: "Voucher Number",
          type: "text",
          value: voucher.voucherNumber || "",
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
    value: voucher.voucherDate || "",
    required: true,
    placeholder: "Select voucher date",
  },
  {
    id: "amount",
    label: "Amount",
    type: "number",
    value: voucher.amount || "",
    required: true,
    placeholder: "Enter amount",
    min: 0,
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    value: voucher.status || "Pending",
    options: STATUS_OPTIONS,
    placeholder: "Select status",
    required: true,
  },
  {
    id: "referenceNumber",
    label: "Reference Number",
    type: "text",
    value: voucher.referenceNumber || "",
    required: false,
    placeholder: "Enter reference number",
  },
  {
    id: "voucherEntries",
    label: "Voucher Entries",
    type: "fieldSet",
    value:
      voucher.voucherEntries?.map((entry) => ({
        creditAmount: entry.creditAmount || "0",
        debitAmount: entry.debitAmount || "0",
        particulars: entry.particulars || "",
        account: entry.account || "",
      })) || DEFAULT_VOUCHER_ENTRIES,
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
        value: "0",
        required: true,
        placeholder: "Enter credit amount",
      },
      {
        id: "debitAmount",
        label: "Debit Amount",
        type: "number",
        value: "0",
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

// Enhanced table columns with expandable entries
const getColumns = (
  setEditingVoucher,
  setViewingVoucher,
  setDeletingVoucher,
  accounts,
  allExpanded,
  setAllExpanded
) => [
  { accessorKey: "voucherType", header: "Voucher Type" },
  { accessorKey: "voucherNumber", header: "Voucher Number" },
  { accessorKey: "voucherDate", header: "Voucher Date" },
  { accessorKey: "amount", header: "Amount" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "referenceNumber", header: "Reference Number" },
  {
    id: "voucherEntries",
    header: "Entries",
    cell: ({ row }) => {
      const [isExpanded, setIsExpanded] = useState(allExpanded);
      useEffect(() => {
        setIsExpanded(allExpanded);
      }, [allExpanded]);
      return (
        <div>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </Button>
          {isExpanded && (
            <div className="mt-2 space-y-2">
              {row.original.voucherEntries.map((entry, index) => (
                <div key={index} className="border rounded p-2 bg-gray-50">
                  <p>Account: {accounts.find(a => a._id === entry.account)?.name || "N/A"}</p>
                  <p>Debit: {entry.debitAmount}</p>
                  <p>Credit: {entry.creditAmount}</p>
                  <p>Particulars: {entry.particulars}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    },
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

export default function Vouchers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [viewingVoucher, setViewingVoucher] = useState(null);
  const [deletingVoucher, setDeletingVoucher] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const { toast, dismiss } = useToast();
  const [pagination, setPagination] = useState({
    pageIndex:
      parseInt(searchParams.get("page")) - 1 || DEFAULT_PAGINATION.pageIndex,
    pageSize:
      parseInt(searchParams.get("limit")) || DEFAULT_PAGINATION.pageSize,
  });
  const [pageCount, setPageCount] = useState(0);
  const [filters, setFilters] = useState(() => {
    const initialFilters = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== "page" && key !== "limit") {
        initialFilters[key] = value;
      }
    }
    return initialFilters;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);

  // Memoized columns with account names and expand state
  const columns = useMemo(
    () => getColumns(setEditingVoucher, setViewingVoucher, setDeletingVoucher, accounts, allExpanded, setAllExpanded),
    [accounts, allExpanded]
  );

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      const response = await getAccounts({ pagination: "false" });
      setAccounts(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch accounts.",
        variant: "destructive",
      });
    }
  };

  // Fetch vouchers
  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };
      const response = await getVouchers(queryParams);
      const voucherData = (response?.data?.data || []).map((voucher) => ({
        ...voucher,
        voucherDate: formatDate(voucher.voucherDate),
      }));
      setData(voucherData);
      setPageCount(response?.data?.meta?.pagination?.totalPages || 0);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch vouchers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle create voucher
  const handleCreateSubmit = async (data) => {
    try {
      const response = await createVoucher(data);
      if (response.status === 201) {
        const createdVoucher = {
          ...response.data.data,
          voucherDate: formatDate(response.data.data.voucherDate),
        };
        setData((prev) => [createdVoucher, ...prev]);
        toast({
          title: "Voucher Created",
          description: "Voucher has been successfully created.",
        });
        setIsCreateOpen(false);
        return true;
      }
      throw new Error(response?.data?.message || "Creation failed.");
    } catch (error) {
      console.error("Create submission error:", error);
      toast({
        title: "Creation Failed",
        description:
          error?.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Handle update voucher
  const handleEditSubmit = async (data) => {
    try {
      const response = await updateVoucher(editingVoucher._id, data);
      if (response.status === 200) {
        const updatedVoucher = {
          ...response.data.data,
          voucherDate: formatDate(response.data.data.voucherDate),
        };
        setData((prev) =>
          prev.map((voucher) =>
            voucher._id === editingVoucher._id
              ? { ...voucher, ...updatedVoucher }
              : voucher
          )
        );
        toast({
          title: "Voucher Updated",
          description: "Voucher has been successfully updated.",
        });
        setEditingVoucher(null);
      } else {
        throw new Error(response?.data?.message || "Update failed.");
      }
    } catch (error) {
      console.error("Edit submission error:", error);
      toast({
        title: "Update Failed",
        description:
          error?.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Handle delete voucher
  const handleDelete = async (voucher) => {
    setIsDeleteLoading(true);
    try {
      const response = await deleteVoucher(voucher._id);
      if (response.status === 200) {
        toast({
          title: "Voucher Deleted",
          description: "Voucher has been successfully deleted.",
        });
        setDeletingVoucher(null);
        await fetchVouchers();
      } else {
        throw new Error(response?.data?.message || "Deletion failed.");
      }
    } catch (error) {
      console.error("Delete submission error:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Sync search params with pagination and filters
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", (pagination.pageIndex + 1).toString());
    params.set("limit", pagination.pageSize.toString());
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  }, [pagination, filters, setSearchParams]);

  // Fetch accounts and vouchers on mount and when dependencies change
  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [pagination.pageIndex, pagination.pageSize, filters]);

  // Memoized filters for DataTable
  const tableFilters = useMemo(
    () => [
      {
        id: "voucherType",
        type: "select",
        label: "Voucher Type",
        placeholder: "Search by Voucher Type",
        options: VOUCHER_TYPES,
      },
    ],
    []
  );

  return (
    <div className="mt-4">

      <DataTable
        heading="Vouchers"
        columns={columns}
        data={data}
        enableFilters
        enableColumnVisibility
        filters={tableFilters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        pagination={pagination}
        pageCount={pageCount}
        onPaginationChange={setPagination}
        isLoading={isLoading}
        createButton={{
          onClick: () => {
            dismiss();
            setIsCreateOpen(true);
          },
          label: "Create",
          icon: <Plus className="h-4 w-4" />,
        }}
        resetFilters={{
          onClick: handleResetFilters,
          disabled: Object.keys(filters).length === 0,
        }}
        customButtons={[
          {
            className: "ml-2",
            onClick: () => setAllExpanded(!allExpanded),
            content: allExpanded ? "Collapse All" : "Expand All"
          }
        ]}
      />

      <DynamicSheet
        mode="create"
        title="Create Voucher"
        description="Add a new voucher to the system."
        fields={getFieldConfig({}, accounts)}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingVoucher && (
        <DynamicSheet
          mode="edit"
          title="Edit Voucher"
          description="Make changes to the voucher details."
          fields={getFieldConfig(editingVoucher, accounts, true)}
          onSubmit={handleEditSubmit}
          open={!!editingVoucher}
          onOpenChange={(open) => !open && setEditingVoucher(null)}
        />
      )}

      {viewingVoucher && (
        <DynamicSheet
          mode="view"
          title="View Voucher"
          description="View voucher details."
          fields={getFieldConfig(viewingVoucher, accounts, true)}
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
          onCancel={() => setDeletingVoucher(null)}
          isLoading={isDeleteLoading}
        />
      )}
    </div>
  );
}