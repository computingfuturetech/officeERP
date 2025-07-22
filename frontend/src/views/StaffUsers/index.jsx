import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/components/data-table";
import { Button } from "@/components/components/ui/button";
import { DynamicSheet } from "@/components/components/dynamic-sheet";
import { useToast } from "@/components/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
} from "@/services/staffUsers";
import { formatDate } from "@/utils/commonUtils";

// Constants for role options
const ROLE_OPTIONS = [
  { value: "Admin", label: "Admin" },
  { value: "Employee", label: "Employee" },
  { value: "Super Admin", label: "Super Admin" },
];

// Default pagination values
const DEFAULT_PAGINATION = {
  pageIndex: 0,
  pageSize: 20,
};

// Field configuration for the form
const getFieldConfig = (staffUser = {}) => [
  {
    id: "firstName",
    label: "First Name",
    type: "text",
    value: staffUser.firstName || "",
    required: true,
    placeholder: "Enter first name",
  },
  {
    id: "lastName",
    label: "Last Name",
    type: "text",
    value: staffUser.lastName || "",
    placeholder: "Enter last name",
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    value: staffUser.email || "",
    placeholder: "Enter email",
    required: true,
  },
  {
    id: "role",
    label: "Role",
    type: "select",
    value: staffUser.role || "Employee",
    placeholder: "Select Role",
    options:
      staffUser.role === "Super Admin"
        ? ROLE_OPTIONS
        : ROLE_OPTIONS.filter((option) => option.value !== "Super Admin"),
    required: true,
    readOnly: staffUser.role === "Super Admin",
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    value: "",
    placeholder: "Enter password",
    required: !staffUser._id,
  },
];

// Table columns configuration
const getColumns = (setEditingStaffUser, setViewingStaffUser) => [
  { accessorKey: "firstName", header: "First Name" },
  { accessorKey: "lastName", header: "Last Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "createdAt", header: "Member Since" },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const staffUser = row.original;
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
            <DropdownMenuItem onClick={() => setEditingStaffUser(staffUser)}>
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setViewingStaffUser(staffUser)}>
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function StaffUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStaffUser, setEditingStaffUser] = useState(null);
  const [viewingStaffUser, setViewingStaffUser] = useState(null);
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
    () => getColumns(setEditingStaffUser, setViewingStaffUser),
    []
  );

  // Fetch staff users
  const fetchStaffUsers = async () => {
    setIsLoading(true);
    try {
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };
      const response = await getStaffUsers(queryParams);
      setData(
        response?.data?.data.map((staffUser) => ({
          ...staffUser,
          createdAt: formatDate(staffUser.createdAt),
        }))
      );
      setPageCount(response?.data?.meta?.pagination?.totalPages || 0);
    } catch (error) {
      console.error("Error fetching staff users:", error);
      toast({
        title: "Failed to Fetch Staff Users",
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

  // Handle create staff user
  const handleCreateSubmit = async (data) => {
    try {
      const response = await createStaffUser(data);
      if (response.status === 201) {
        setData((prev) => [
          {
            ...response.data.data,
            createdAt: formatDate(response.data.data.createdAt),
          },
          ...prev,
        ]);
        toast({
          title: "Staff User Created",
          description: "Staff user has been successfully created.",
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

  // Handle update staff user
  const handleEditSubmit = async (data) => {
    try {
      const response = await updateStaffUser(editingStaffUser._id, data);
      if (response.status === 200) {
        const updatedStaffUser = {
          ...response.data.data,
          createdAt: formatDate(response.data.data.createdAt),
        };
        setData((prev) =>
          prev.map((staffUser) =>
            staffUser._id === editingStaffUser._id
              ? { ...staffUser, ...updatedStaffUser }
              : staffUser
          )
        );
        toast({
          title: "Staff User Updated",
          description: "Staff user has been successfully updated.",
        });
        setEditingStaffUser(null);
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

  // Fetch data when pagination or filters change
  useEffect(() => {
    fetchStaffUsers();
  }, [pagination.pageIndex, pagination.pageSize, filters]);

  return (
    <div className="mt-4">
      <DataTable
        heading="Staff Users"
        columns={columns}
        data={data}
        enableFilters={false}
        enableColumnVisibility
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
        }}
      />

      <DynamicSheet
        mode="create"
        title="Create Staff User"
        description="Add a new staff user to the system."
        open={isCreateOpen}
        fields={getFieldConfig()}
        onSubmit={handleCreateSubmit}
        onOpenChange={setIsCreateOpen}
      />

      {editingStaffUser && (
        <DynamicSheet
          mode="edit"
          title="Edit Staff User"
          description="Make changes to the staff user details."
          open={!!editingStaffUser}
          fields={getFieldConfig(editingStaffUser)}
          onSubmit={handleEditSubmit}
          onOpenChange={(open) => !open && setEditingStaffUser(null)}
        />
      )}

      {viewingStaffUser && (
        <DynamicSheet
          mode="view"
          title="View Staff User"
          description="View staff user details."
          open={!!viewingStaffUser}
          fields={getFieldConfig(viewingStaffUser)}
          onSubmit={() => {}}
          onOpenChange={(open) => !open && setViewingStaffUser(null)}
        />
      )}
    </div>
  );
}
