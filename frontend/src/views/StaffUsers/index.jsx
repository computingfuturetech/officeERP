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
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
} from "../../services/staffUsers";

export default function StaffUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStaffUser, setEditingStaffUser] = useState(null);
  const [viewingStaffUser, setViewingStaffUser] = useState(null);
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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-PK", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const handleEditSubmit = async (data) => {
    try {
      const response = await updateStaffUser(editingStaffUser._id, data);

      if (response.status === 200) {
        setData((prev) =>
          prev.map((staff_user) =>
            staff_user._id === editingStaffUser._id
              ? { ...staff_user, ...data }
              : staff_user
          )
        );
        toast({
          title: "Staff User updated",
          description: "Staff User has been successfully updated.",
        });
        setEditingStaffUser(null);
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
      const response = await createStaffUser(data);

      if (response.status === 200) {
        setData((prev) => [
          {
            ...response?.data?.result,
            createdAt: formatDate(response?.data?.result.createdAt),
          },
          ...prev,
        ]);
        toast({
          title: "Staff User created",
          description: "Staff User has been successfully created.",
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
    fetchStaffUsers();
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

  const getFieldConfig = (staff_user) => [
    {
      id: "firstName",
      label: "First Name",
      type: "text",
      value: staff_user?.firstName || "",
      required: true,
      placeholder: "Enter first name",
      validate: (value) => {
        if (value.length < 3) {
          return "First name must be at least 3 characters long";
        }
        return null;
      },
    },
    {
      id: "lastName",
      label: "Last Name",
      type: "text",
      value: staff_user?.lastName || "",
      placeholder: "Enter last name",
      // required: true,
      validate: (value) => {
        if (value.length < 3) {
          return "Last name must be at least 3 characters long";
        }
        return null;
      },
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      value: staff_user?.email || "",
      placeholder: "Enter email",
      required: true,
    },
    {
      id: "role",
      label: "Role",
      type: "select",
      value: staff_user?.role || "",
      placeholder: "Enter Role",
      options: [
        { value: "Admin", label: "Admin" },
        { value: "Employee", label: "Employee" },
      ],
      required: true,
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      value: staff_user?.password || "",
      placeholder: "Enter password",
      required: staff_user ? false : true,
    },
  ];

  const fetchStaffUsers = async () => {
    try {
      setIsLoading(true);
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await getStaffUsers(queryParams);

      setData(
        response?.data?.data.map((staff_user) => ({
          ...staff_user,
          createdAt: formatDate(staff_user.createdAt),
        }))
      );
      setPageCount(response?.data?.meta?.pagination?.totalPages);
    } catch (error) {
      console.error("Error fetching staff user:", error);
      toast({
        title: "Error",
        description: "Failed to fetch staff user data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      accessorKey: "firstName",
      header: "First Name",
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "createdAt",
      header: "Member Since",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const staff_user = row.original;
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
              <DropdownMenuItem onClick={() => setEditingStaffUser(staff_user)}>
                Edit Staff User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewingStaffUser(staff_user)}>
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
          heading="Staff Users"
          columns={columns}
          data={data}
          enableFilters={false}
          enableColumnVisibility={true}
          filterableField="msNo"
          filterableFieldLabel="Staff User No"
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
        title="Create Staff User"
        description="Add a new staff user to the system."
        fields={getFieldConfig()}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingStaffUser && (
        <DynamicSheet
          mode="edit"
          title="Edit Staff User"
          description="Make changes to the staff user details."
          fields={getFieldConfig(editingStaffUser)}
          onSubmit={handleEditSubmit}
          open={!!editingStaffUser}
          onOpenChange={(open) => !open && setEditingStaffUser(null)}
        />
      )}

      {viewingStaffUser && (
        <DynamicSheet
          mode="view"
          title="View Staff User"
          description="View staff user details."
          fields={getFieldConfig(viewingStaffUser)}
          onSubmit={() => {}}
          open={!!viewingStaffUser}
          onOpenChange={(open) => !open && setViewingStaffUser(null)}
        />
      )}
    </div>
  );
}
