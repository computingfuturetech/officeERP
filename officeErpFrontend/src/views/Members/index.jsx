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
import { createMember, getMembers, updateMember } from "../../services/members";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Members() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
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
      const response = await updateMember(editingMember._id, data);

      if (response.status === 200) {
        setData((prev) =>
          prev.map((member) =>
            member._id === editingMember._id ? { ...member, ...data } : member
          )
        );
        toast({
          title: "Member updated",
          description: "Member has been successfully updated.",
        });
        setEditingMember(null);
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
      const response = await createMember(data);
      console.log("Create response:", response);

      if (response.status === 201) {
        setData((prev) => [response?.data?.data, ...prev]);
        toast({
          title: "Member created",
          description: "Member has been successfully created.",
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
    fetchMembers();
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

  const getFieldConfig = (member) => [
    {
      id: "msNo",
      label: "Member No",
      type: "text",
      value: member?.msNo || "",
      required: true,
      placeholder: "Enter member number",
      readOnly: true,
    },
    {
      id: "purchaseName",
      label: "Name",
      type: "text",
      value: member?.purchaseName || "",
      placeholder: "Enter member name",
      required: true,
      validate: (value) => {
        if (value.length < 3) {
          return "Name must be at least 3 characters long";
        }
        return null;
      },
    },
    {
      id: "guardianName",
      label: "Guardian Name",
      type: "text",
      value: member?.guardianName || "",
      placeholder: "Enter guardian name",
    },
    {
      id: "phase",
      label: "Phase",
      type: "text",
      value: member?.phase || "",
      placeholder: "Enter phase",
      required: true,
    },
    {
      id: "plotNo",
      label: "Plot No",
      type: "text",
      value: member?.plotNo || "",
      placeholder: "Enter plot number",
    },
    {
      id: "block",
      label: "Block",
      type: "text",
      value: member?.block || "",
      placeholder: "Enter block",
    },
    {
      id: "cnicNo",
      label: "CNIC No",
      type: "cnic",
      value: member?.cnicNo || "",
      placeholder: "Enter CNIC number",
      required: true,
    },
    {
      id: "address",
      label: "Address",
      type: "text",
      value: member?.address || "",
      placeholder: "Enter address",
      required: true,
    },
    {
      id: "category",
      label: "Category",
      type: "select",
      value: member?.category || "",
      placeholder: "Select category",
      options: [
        { value: "Residential", label: "Residential" },
        { value: "Commercial", label: "Commercial" },
      ],
    },
    {
      id: "area",
      label: "Area",
      type: "number",
      value: member?.area || 0,
      placeholder: "Enter area",
    },
  ];

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await getMembers(queryParams);

      setData(response.data.data);
      setPageCount(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to fetch members data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "msNo",
      header: "Member No",
    },
    {
      accessorKey: "purchaseName",
      header: "Name",
    },
    {
      accessorKey: "phase",
      header: "Phase",
    },
    {
      accessorKey: "plotNo",
      header: "Plot No",
    },
    {
      accessorKey: "block",
      header: "Block",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "area",
      header: "Area",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original;
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
              <DropdownMenuItem onClick={() => setEditingMember(member)}>
                Edit Member
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewingMember(member)}>
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
          heading="Members"
          columns={columns}
          data={data}
          enableFilters={true}
          enableColumnVisibility={true}
          filterableField="msNo"
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
        title="Create Member"
        description="Add a new member to the system."
        fields={getFieldConfig()}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingMember && (
        <DynamicSheet
          mode="edit"
          title="Edit Member"
          description="Make changes to the member details."
          fields={getFieldConfig(editingMember)}
          onSubmit={handleEditSubmit}
          open={!!editingMember}
          onOpenChange={(open) => !open && setEditingMember(null)}
        />
      )}

      {viewingMember && (
        <DynamicSheet
          mode="view"
          title="View Member"
          description="View member details."
          fields={getFieldConfig(viewingMember)}
          onSubmit={() => {}}
          open={!!viewingMember}
          onOpenChange={(open) => !open && setViewingMember(null)}
        />
      )}
    </div>
  );
}
