import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";
import { MoreVertical, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/components/data-table";
import { Button } from "@/components/components/ui/button";
import { DynamicSheet } from "@/components/components/dynamic-sheet";
import { useToast } from "@/components/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import {
  createMemberPlotRecord,
  getMemberPlotRecords,
  updateMemberPlotRecord,
  transferPlot,
} from "@/services/memberPlotRecords";
import ImportModal from "@/components/components/import-modal";

// Constants
const DEFAULT_PAGINATION = {
  pageIndex: 0,
  pageSize: 20,
};

const STATUS_OPTIONS = [
  { label: "Active", value: "Active" },
  { label: "Transferred", value: "Transferred" },
];

const PHASE_OPTIONS = [
  { value: "I", label: "I" },
  { value: "II", label: "II" },
  { value: "III", label: "III" },
  { value: "IV", label: "IV" },
  { value: "V", label: "V" },
];

const AREA_UNIT_OPTIONS = [
  { value: "sq ft", label: "sq ft" },
  { value: "sq yd", label: "sq yd" },
  { value: "sq m", label: "sq m" },
  { value: "marla", label: "marla" },
  { value: "kanal", label: "kanal" },
  { value: "acre", label: "acre" },
  { value: "ha", label: "ha" },
];

const CATEGORY_OPTIONS = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Amenity", label: "Amenity" },
];

// Field configuration for create/edit/view modes
const getFieldConfig = (record = {}) => [
  {
    id: "membershipNumber",
    label: "Membership No.",
    type: "text",
    value: record.membershipNumber || "",
    required: true,
    placeholder: "Enter membership number",
  },
  {
    id: "member.name",
    label: "Name",
    type: "text",
    value: record.member?.name || "",
    placeholder: "Enter member name",
    required: true,
  },
  {
    id: "member.guardianName",
    label: "Guardian Name",
    type: "text",
    value: record.member?.guardianName || "",
    placeholder: "Enter guardian name",
  },
  {
    id: "member.cnic",
    label: "CNIC",
    type: "cnic",
    value: record.member?.cnic || "",
    placeholder: "xxxxx-xxxxxxx-x",
    required: true,
  },
  {
    id: "member.address",
    label: "Address",
    type: "textarea",
    value: record.member?.address || "",
    placeholder: "Enter member address",
  },
  {
    id: "plot.number",
    label: "Plot No.",
    type: "text",
    value: record.plot?.number || "",
    placeholder: "Enter plot number",
    required: true,
  },
  {
    id: "plot.location.phase",
    label: "Phase",
    type: "select",
    value: record.plot?.location?.phase || "",
    placeholder: "Select plot phase",
    options: PHASE_OPTIONS,
    required: true,
  },
  {
    id: "plot.location.block",
    label: "Block",
    type: "text",
    value: record.plot?.location?.block || "",
    placeholder: "Enter plot block",
  },
  {
    id: "plot.area.value",
    label: "Area",
    type: "number",
    value: record.plot?.area?.value || "",
    placeholder: "Enter plot area",
    validate: (value) => (value < 0 ? "Area must be a positive number" : null),
  },
  {
    id: "plot.area.unit",
    label: "Area Unit",
    type: "select",
    value: record.plot?.area?.unit || "marla",
    placeholder: "Select plot area unit",
    options: AREA_UNIT_OPTIONS,
  },
  {
    id: "plot.category",
    label: "Category",
    type: "select",
    value: record.plot?.category || "Residential",
    placeholder: "Select plot category",
    options: CATEGORY_OPTIONS,
  },
];

// Field configuration for transfer mode
const transferRecordFields = [
  {
    id: "toMember.name",
    label: "Name",
    type: "text",
    placeholder: "Enter member name",
    required: true,
  },
  {
    id: "toMember.guardianName",
    label: "Guardian Name",
    type: "text",
    placeholder: "Enter guardian name",
  },
  {
    id: "toMember.cnic",
    label: "CNIC",
    type: "cnic",
    placeholder: "xxxxx-xxxxxxx-x",
    required: true,
  },
  {
    id: "date",
    label: "Transfer Date",
    type: "date",
    placeholder: "Enter transfer date",
    required: true,
  },
];

// Table columns configuration
const getColumns = (setTransferRecord, setEditingRecord, setViewingRecord) => [
  { accessorKey: "membershipNumber", header: "Membership No." },
  { accessorKey: "member.name", header: "Name" },
  { accessorKey: "member.cnic", header: "CNIC" },
  { accessorKey: "plot.number", header: "Plot No" },
  { accessorKey: "plot.location.phase", header: "Phase" },
  { accessorKey: "plot.location.block", header: "Block" },
  { accessorKey: "plot.category", header: "Category" },
  { accessorKey: "plot.area.valueWithUnit", header: "Area" },
  { accessorKey: "status", header: "Status" },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const record = row.original;
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
            <DropdownMenuItem onClick={() => setTransferRecord(record)}>
              Transfer Plot
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingRecord(record)}>
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewingRecord(record)}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function MemberPlotRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [transferRecord, setTransferRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
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

  // Memoized columns to prevent unnecessary re-renders
  const columns = useMemo(
    () => getColumns(setTransferRecord, setEditingRecord, setViewingRecord),
    []
  );

  // Memoized filters for DataTable
  const tableFilters = useMemo(
    () => [
      {
        id: "status",
        type: "select",
        label: "Status",
        placeholder: "Search by Status",
        options: STATUS_OPTIONS,
      },
    ],
    []
  );

  // Fetch member plot records
  const fetchMemberPlotRecords = async () => {
    setIsLoading(true);
    try {
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };
      const response = await getMemberPlotRecords(queryParams);
      setData(response?.data?.data || []);
      setPageCount(response?.data?.meta?.pagination?.totalPages || 0);
    } catch (error) {
      console.error("Error fetching records:", error);
      toast({
        title: "Failed to Fetch Records",
        description:
          error?.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle create record
  const handleCreateSubmit = async (data) => {
    try {
      const response = await createMemberPlotRecord(data);
      if (response.status === 201) {
        setData((prev) => [response.data.data, ...prev]);
        toast({
          title: "Record Created",
          description: "Member plot record has been successfully created.",
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

  // Handle update record
  const handleEditSubmit = async (data) => {
    try {
      const response = await updateMemberPlotRecord(editingRecord._id, data);
      if (response.status === 200) {
        const updatedRecord = response.data.data;
        setData((prev) =>
          prev.map((record) =>
            record._id === editingRecord._id
              ? { ...record, ...updatedRecord }
              : record
          )
        );
        toast({
          title: "Record Updated",
          description: "Member plot record has been successfully updated.",
        });
        setEditingRecord(null);
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

  // Handle transfer plot
  const handleTransferPlot = async (data) => {
    try {
      data.fromMemberPlotRecordId = transferRecord._id;
      const response = await transferPlot(data);
      if (response.status === 200) {
        const { fromRecord, toRecord } = response.data.data;
        setData((prev) => [
          toRecord,
          ...prev.map((record) =>
            record._id === transferRecord._id
              ? { ...record, ...fromRecord }
              : record
          ),
        ]);
        toast({
          title: "Plot Transferred",
          description: "Plot has been successfully transferred.",
        });
        setTransferRecord(null);
      } else {
        throw new Error(response?.data?.message || "Transfer failed.");
      }
    } catch (error) {
      console.error("Transfer submission error:", error);
      toast({
        title: "Transfer Failed",
        description:
          error?.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.",
        variant: "destructive",
      });
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

  // Fetch records on pagination or filter change
  useEffect(() => {
    fetchMemberPlotRecords();
  }, [pagination.pageIndex, pagination.pageSize, filters]);

  return (
    <div className="mt-4">
      <DataTable
        heading="Member Plot Records"
        columns={columns}
        data={data}
        enableFilters
        enableColumnVisibility
        filterableField="membershipNumber"
        filterableFieldLabel="Membership Number"
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
        importButton={{
          onClick: () => {
            dismiss();
            setImportModalOpen(true);
          },
          label: "Import",
        }}
      />

      <DynamicSheet
        mode="create"
        title="Create Record"
        description="Add a new member plot record."
        fields={getFieldConfig()}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingRecord && (
        <DynamicSheet
          mode="edit"
          title="Edit Record"
          description="Make changes to the member plot record."
          fields={getFieldConfig(editingRecord)}
          onSubmit={handleEditSubmit}
          open={!!editingRecord}
          onOpenChange={(open) => !open && setEditingRecord(null)}
        />
      )}

      {viewingRecord && (
        <DynamicSheet
          mode="view"
          title="View Record"
          description="View member plot record details."
          fields={getFieldConfig(viewingRecord)}
          onSubmit={() => {}}
          open={!!viewingRecord}
          onOpenChange={(open) => !open && setViewingRecord(null)}
        />
      )}

      {transferRecord && (
        <DynamicSheet
          mode="transfer"
          title="Transfer Plot"
          description="Transfer plot to another member."
          fields={transferRecordFields}
          onSubmit={handleTransferPlot}
          open={!!transferRecord}
          onOpenChange={(open) => !open && setTransferRecord(null)}
        />
      )}

      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={fetchMemberPlotRecords}
      />
    </div>
  );
}
