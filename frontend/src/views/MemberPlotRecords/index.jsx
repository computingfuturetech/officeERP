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
import {
  createMemberPlotRecord,
  getMemberPlotRecords,
  updateMemberPlotRecord,
  transferPlot,
} from "../../services/memberPlotRecords";
import { useNavigate, useSearchParams } from "react-router-dom";
import ImportModal from "@/components/components/import-modal";

export default function MemberPlotRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [transferRecord, setTransferRecord] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
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
  const [modalVisible, setModalVisible] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFileData, setImportFileData] = useState(null);

  const handleEditSubmit = async (data) => {
    const response = await updateMemberPlotRecord(editingRecord._id, data);
    try {
      if (response.status === 200) {
        setData((prev) =>
          prev.map((record) =>
            record._id === editingRecord._id ? { ...record, ...data } : record
          )
        );
        toast({
          title: "Record updated",
          description: "Member plot record has been successfully updated.",
        });
        setEditingRecord(null);
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
      const response = await createMemberPlotRecord(data);

      if (response.status === 201) {
        setData((prev) => [response?.data?.data, ...prev]);
        toast({
          title: "Record created",
          description: "Member plot record has been successfully created.",
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
    fetchMemberPlotRecords();
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

  const getFieldConfig = (record) => [
    {
      id: "membershipNumber",
      label: "Membership No.",
      type: "text",
      value: record?.membershipNumber || "",
      required: true,
      placeholder: "Enter membership number",
    },
    {
      id: "member.name",
      label: "Name",
      type: "text",
      value: record?.member?.name || "",
      placeholder: "Enter member name",
      required: true,
    },
    {
      id: "member.guardianName",
      label: "Guardian Name",
      type: "text",
      value: record?.member?.guardianName || "",
      placeholder: "Enter guardian name",
    },
    {
      id: "member.cnic",
      label: "CNIC",
      type: "cnic",
      value: record?.member?.cnic || "",
      placeholder: "xxxxx-xxxxxxx-x",
      required: true,
    },
    {
      id: "member.address",
      label: "Address",
      type: "textarea",
      value: record?.member?.address || "",
      placeholder: "Enter member address",
    },
    {
      id: "plot.number",
      label: "Plot No.",
      type: "text",
      value: record?.plot?.number || "",
      placeholder: "Enter plot number",
      required: true,
    },
    {
      id: "plot.location.phase",
      label: "Phase",
      type: "select",
      value: record?.plot?.location?.phase || "",
      placeholder: "Select plot phase",
      options: [
        { value: "I", label: "I" },
        { value: "II", label: "II" },
        { value: "III", label: "III" },
        { value: "IV", label: "IV" },
        { value: "V", label: "V" },
      ],
      required: true,
    },

    {
      id: "plot.location.block",
      label: "Block",
      type: "text",
      value: record?.plot?.location?.block || "",
      placeholder: "Enter plot block",
    },
    {
      id: "plot.area.value",
      label: "Area",
      type: "number",
      value: record?.plot?.area?.value,
      placeholder: "Enter plot area",
      validate: (value) => {
        if (value < 0) {
          return "Area must be a positive number";
        }
        return null;
      },
    },
    {
      id: "plot.area.unit",
      label: "Area Unit",
      type: "select",
      value: record?.plot?.area?.unit || "marla",
      placeholder: "Select plot area unit",
      options: [
        { value: "sq ft", label: "sq ft" },
        { value: "sq yd", label: "sq yd" },
        { value: "sq m", label: "sq m" },
        { value: "marla", label: "marla" },
        { value: "kanal", label: "kanal" },
        { value: "acre", label: "acre" },
        { value: "ha", label: "ha" },
      ],
    },
    {
      id: "plot.category",
      label: "Category",
      type: "select",
      value: record?.plot?.category || "Residential",
      placeholder: "Select plot category",
      options: [
        { value: "Residential", label: "Residential" },
        { value: "Commercial", label: "Commercial" },
        { value: "Amenity", label: "Amenity" },
      ],
    },
  ];

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

  const fetchMemberPlotRecords = async () => {
    try {
      setIsLoading(true);
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await getMemberPlotRecords(queryParams);

      setData(response?.data?.data);
      setPageCount(response?.data?.meta?.pagination?.totalPages);
    } catch (error) {
      console.error("Error fetching records:", error);
      toast({
        title: "Error",
        description: "Failed to fetch records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const transferRecords = async (data) => {
    try {
      data.fromMemberPlotRecordId = transferRecord._id;
      const response = await transferPlot(data);
      const fromRecord = response?.data?.data?.fromRecord;
      const toRecord = response?.data?.data?.toRecord;

      if (response.status === 200) {
        setData((prev) => {
          const newData = prev.map((record) =>
            record._id === transferRecord._id
              ? { ...record, ...fromRecord }
              : record
          );
          newData.push(toRecord);
          return newData;
        });
        toast({
          title: "Member transferred",
          description: "Membership has been successfully transferred.",
        });
        setTransferRecord(null);
      } else {
        toast({
          title: "Transfer Failed",
          description:
            response?.data?.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Transfer submission error:", error);
      toast({
        title: "Transfer Failed",
        description:
          error?.response?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      accessorKey: "membershipNumber",
      header: "Membership No.",
    },
    {
      accessorKey: "member.name",
      header: "Name",
    },
    {
      accessorKey: "member.cnic",
      header: "CNIC",
    },
    {
      accessorKey: "plot.number",
      header: "Plot No",
    },
    {
      accessorKey: "plot.location.phase",
      header: "Phase",
    },
    {
      accessorKey: "plot.location.block",
      header: "Block",
    },
    {
      accessorKey: "plot.category",
      header: "Category",
    },
    {
      accessorKey: "plot.area.valueWithUnit",
      header: "Area",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
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

  const importMembers = () => {
    // Implement export functionality here
    toast({
      title: "Export",
      description: "Export functionality is not implemented yet.",
    });
  };

  const handleFileImport = (fileData) => {
    setImportFileData(fileData);
    setImportModalOpen(true);
  };

  return (
    <div>
      <div className="mt-4">
        <DataTable
          heading="Member Plot Records"
          columns={columns}
          data={data}
          enableFilters={true}
          enableColumnVisibility={true}
          filterableField="membershipNumber"
          filterableFieldLabel="Membership Number"
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
              id: "status",
              type: "select",
              label: "Status",
              placeholder: "Search by Status",
              options: [
                {
                  label: "Active",
                  value: "Active",
                },
                {
                  label: "Transferred",
                  value: "Transferred",
                },
              ],
            },
          ]}
          importButton={{
            onClick: () => {
              dismiss();
              setImportModalOpen(true);
            },
            label: "Import",
          }}
          exportButton={{
            onClick: importMembers,
            label: "Export",
          }}
        />
      </div>

      <DynamicSheet
        mode="create"
        title="Create Record"
        description="Add a new record."
        fields={getFieldConfig()}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingRecord && (
        <DynamicSheet
          mode="edit"
          title="Edit Record"
          description="Make changes to the record."
          fields={getFieldConfig(editingRecord)}
          onSubmit={handleEditSubmit}
          open={!!editingRecord}
          onOpenChange={(open) => !open && setEditingRecord(null)}
        />
      )}

      {transferRecord && (
        <DynamicSheet
          mode="transfer"
          title="Transfer Plot To"
          description="Transfer plot to another person."
          fields={transferRecordFields}
          onSubmit={transferRecords}
          open={!!transferRecord}
          onOpenChange={(open) => !open && setTransferRecord(null)}
        />
      )}

      {viewingRecord && (
        <DynamicSheet
          mode="view"
          title="View Record"
          description="View record details."
          fields={getFieldConfig(viewingRecord)}
          onSubmit={() => {}}
          open={!!viewingRecord}
          onOpenChange={(open) => !open && setViewingRecord(null)}
        />
      )}
      <ImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onSuccess={fetchMemberPlotRecords} // Add this line to pass the refresh function
      />
    </div>
  );
}
