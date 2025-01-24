import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";
import { MoreHorizontal, MoreVertical, Plus } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/components/data-table";
import RevenueCard from "@/components/components/revenue-card";
import DailyTransactionDisplay from "@/components/components/transaction-card";
import { Button } from "@/components/components/ui/button";
import { DynamicSheet } from "@/components/components/dynamic-sheet";
import { useToast } from "@/components/hooks/use-toast";

export default function Members() {
  const [currentFilters, setCurrentFilters] = useState({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [viewingMember, setViewingMember] = useState(null);
  const { toast } = useToast();
  const { dismiss } = useToast();

  const handleEditSubmit = (data) => {
    console.log("Edit data:", data);
    setEditingMember(null);
    // Handle edit logic
  };
  const handleCreateSubmit = async (data) => {
    try {
      console.log("Create data:", data);
      // Simulate an API call or processing
      // Return true if successful, false otherwise
      // Replace this with your actual create logic
      const response = await someCreateMemberAPI(data);

      if (response.success) {
        toast({
          title: "Member created",
          description: "Member has been successfully created.",
        });
        setIsCreateOpen(false);
        return true;
      } else {
        toast({
          title: "Creation Failed",
          description: "There was an error creating the member.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Create submission error:", error);
      toast({
        title: "Creation Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getFieldConfig = (member) => [
    {
      id: "memberNo",
      label: "Member No",
      type: "number",
      value: member?.memberNo || "",
      required: true,
      placeholder: "Enter member number",
      readOnly: true,
    },
    {
      id: "name",
      label: "Name",
      type: "text",
      value: member?.name || "",
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
      required: true,
      validate: (value) => {
        if (value.length < 3) {
          return "Guardian name must be at least 3 characters long";
        }
        return null;
      },
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
      required: true,
    },
    {
      id: "block",
      label: "Block",
      type: "text",
      value: member?.block || "",
      placeholder: "Enter block",
      required: true,
    },
    {
      id: "cnicNo",
      label: "CNIC No",
      type: "text",
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
      id: "status",
      label: "Status",
      type: "select",
      value: member?.status || "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
  ];

  const columns = [
    {
      accessorKey: "memberNo",
      header: "Member No",
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
      id: "actions",
      header: "Actions",
      size: 50,
      maxSize: 80,
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

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setEditingMember(member);
                }}
              >
                Edit Member
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setViewingMember(member);
                }}
              >
                View details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const data = [
    {
      memberNo: 1,
      phase: "A",
      plotNo: "A-1",
    },
    {
      memberNo: 2,
      phase: "B",
      plotNo: "B-1",
    },
    {
      memberNo: 3,
      phase: "C",
      plotNo: "C-1",
    },
    {
      memberNo: 4,
      phase: "D",
      plotNo: "D-1",
    },
    {
      memberNo: 5,
      phase: "E",
      plotNo: "E-1",
      status: "inactive",
    },
  ];

  const handleFilterChange = (filters) => {
    console.log("Filters updated:", filters);
    setCurrentFilters(filters);
    // Implement your filtering logic here
  };

  return (
    <div>
      <div className="mt-4">
        <DataTable
          heading="Members"
          columns={columns}
          data={data}
          enableFilters={true}
          enableColumnVisibility={true}
          filterableField="memberNo"
          onFilterChange={handleFilterChange}
          createButton={{
            onClick: () => {
              dismiss();
              setIsCreateOpen(true);
            },
            label: "Create",
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

// Placeholder functions - replace with actual API calls
async function someCreateMemberAPI(data) {
  // Simulate an API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: false });
    }, 1000);
  });
}
