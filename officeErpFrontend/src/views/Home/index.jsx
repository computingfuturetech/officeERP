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

export default function Home() {
  const [currentFilters, setCurrentFilters] = useState({});
  const [editingPayment, setEditingPayment] = useState(null);
  const [viewingPayment, setViewingPayment] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreateSubmit = (data) => {
    console.log("Create data:", data);
    setIsCreateOpen(false);
    // Handle create logic
  };

  const handleEditSubmit = (data) => {
    console.log("Edit data:", data);
    setEditingPayment(null);
    // Handle edit logic
  };

  const getFieldConfig = (payment) => [
    {
      id: "email",
      label: "Email",
      type: "email",
      value: payment?.email || "",
      required: true,
      placeholder: "Enter email address",
      readOnly: true,
    },
    {
      id: "amount",
      label: "Amount",
      type: "number",
      value: payment?.amount || 0,
      required: true,
    },
    {
      id: "status",
      label: "Status",
      value: payment?.status || "pending",
      required: true,
    },
  ];

  const columns = [
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      id: "actions",
      header: "Actions",
      size: 50, // Explicitly set a smaller width
      maxSize: 80, // Maximum width
      cell: ({ row }) => {
        const payment = row.original;

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
                  setEditingPayment(payment);
                }}
              >
                Edit payment
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setViewingPayment(payment);
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
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
  ];

  const filters = [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
      type: "multiselect",
      mode: "multiple",
    },
    {
      id: "role",
      label: "Role",
      options: [
        { value: "admin", label: "Admin" },
        { value: "user", label: "User" },
      ],
      type: "select",
      mode: "single",
    },
  ];

  const handleFilterChange = (filters) => {
    console.log("Current filters:", filters);
  };

  const transactions = [
    { date: "Today", amount: 123.0 },
    { date: "Yesterday", amount: 123.0 },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RevenueCard title="Revenue" revenue={123.0} month="This month" />
        <RevenueCard title="Revenue" revenue={123.0} month="This month" />
        <DailyTransactionDisplay
          heading="Transaction History"
          transactions={transactions}
        />
      </div>
      <div className="mt-4">
        <DataTable
          heading="Payments"
          columns={columns}
          data={data}
          enableFilters={true}
          enableColumnVisibility={true}
          seeAllPath="/all-entries"
          filters={filters}
          createButton={{
            onClick: () => setIsCreateOpen(true),
            label: "Create",
          }}
          onFilterChange={handleFilterChange}
        />
      </div>

      <DynamicSheet
        mode="create"
        title="Create Payment"
        description="Add a new payment record."
        fields={getFieldConfig({})}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {editingPayment && (
        <DynamicSheet
          mode="edit"
          title="Edit Payment"
          description="Make changes to the payment details."
          fields={getFieldConfig(editingPayment)}
          onSubmit={handleEditSubmit}
          open={!!editingPayment}
          onOpenChange={(open) => !open && setEditingPayment(null)}
        />
      )}

      {viewingPayment && (
        <DynamicSheet
          mode="view"
          title="View Payment"
          description="View payment details."
          fields={getFieldConfig(viewingPayment)}
          onSubmit={() => {}}
          open={!!viewingPayment}
          onOpenChange={(open) => !open && setViewingPayment(null)}
        />
      )}
    </div>
  );
}
