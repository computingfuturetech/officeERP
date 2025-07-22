import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/components/ui/card";
import { DynamicSheet } from "@/components/components/dynamic-sheet";
import DeleteModal from "@/components/components/delete-modal";
import { useToast } from "@/components/hooks/use-toast";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from "@/services/chartOfAccounts";
import TreeNode from "./TreeNode";
import { buildHierarchy } from "@/utils/chartOfAccounts";

// Constants
const ACCOUNT_TYPES = [
  { label: "Asset", value: "Asset" },
  { label: "Liability", value: "Liability" },
  { label: "Equity", value: "Equity" },
  { label: "Revenue", value: "Revenue" },
  { label: "Expense", value: "Expense" },
];

// Field configuration for create/edit/view modes
const getFieldConfig = (
  account = null,
  parentForNewAccount = null,
  allAccounts = []
) => [
  {
    id: "name",
    label: "Name",
    type: "text",
    value: account?.name || "",
    required: true,
    placeholder: "Enter account name",
  },
  {
    id: "type",
    label: "Type",
    type: "select",
    value: account?.type || parentForNewAccount?.type || "",
    readOnly: (!account && !!parentForNewAccount) || !!account,
    options: ACCOUNT_TYPES,
    placeholder: "Select account type",
    required: true,
  },
  {
    id: "parent",
    label: "Parent Account",
    type: "select",
    value: account?.parent || parentForNewAccount?._id || "",
    readOnly: (!account && !!parentForNewAccount) || !!account,
    options: allAccounts.map((acc) => ({
      label: `${acc.code} - ${acc.name}`,
      value: acc._id,
    })),
    placeholder: "Select parent account (optional)",
    required: false,
  },
  {
    id: "description",
    label: "Description",
    type: "textarea",
    value: account?.description || "",
    required: false,
    placeholder: "Enter account description",
  },
];

const ChartOfAccountsTree = () => {
  const { toast } = useToast();
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [accountsData, setAccountsData] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [viewingAccount, setViewingAccount] = useState(null);
  const [parentForNewAccount, setParentForNewAccount] = useState(null);
  const [deletingAccount, setDeletingAccount] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAccounts({ pagination: false });
      const accounts = response?.data?.data || [];
      setAllAccounts(accounts);
      setAccountsData(buildHierarchy(accounts));
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast({
        title: "Failed to Fetch Accounts",
        description:
          error?.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Toggle node expansion
  const handleToggleExpand = useCallback((nodeId) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Expand all nodes
  const handleExpandAll = useCallback(() => {
    const getAllNodeIds = (nodes) =>
      nodes.reduce((ids, node) => {
        ids.push(node._id);
        if (node.children?.length) {
          ids.push(...getAllNodeIds(node.children));
        }
        return ids;
      }, []);
    setExpandedNodes(new Set(getAllNodeIds(accountsData)));
  }, [accountsData]);

  // Collapse all nodes
  const handleCollapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  // Handle create account
  const handleCreateSubmit = useCallback(
    async (data) => {
      try {
        const response = await createAccount({
          ...data,
          parent: data.parent || null,
        });
        if (response.status === 201) {
          toast({
            title: "Account Created",
            description: "Account has been successfully created.",
          });
          setIsCreateOpen(false);
          setParentForNewAccount(null);
          await fetchAccounts();
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
    },
    [fetchAccounts, toast]
  );

  // Handle update account
  const handleEditSubmit = useCallback(
    async (data) => {
      try {
        const response = await updateAccount(editingAccount._id, {
          ...data,
          parent: data.parent || null,
        });
        if (response.status === 200) {
          toast({
            title: "Account Updated",
            description: "Account has been successfully updated.",
          });
          setEditingAccount(null);
          await fetchAccounts();
          return true;
        }
        throw new Error(response?.data?.message || "Update failed.");
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
        return false;
      }
    },
    [editingAccount, fetchAccounts, toast]
  );

  // Handle delete account
  const handleDelete = useCallback(
    async (account) => {
      setIsDeleteLoading(true);
      try {
        const response = await deleteAccount(account._id);
        if (response.status === 200) {
          toast({
            title: "Account Deleted",
            description: "Account has been successfully deleted.",
          });
          setDeletingAccount(null);
          await fetchAccounts();
        } else {
          throw new Error(response?.data?.message || "Deletion failed.");
        }
      } catch (error) {
        console.error("Delete submission error:", error);
        toast({
          title: "Deletion Failed",
          description:
            error?.response?.data?.message ||
            error.message ||
            "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsDeleteLoading(false);
      }
    },
    [fetchAccounts, toast]
  );

  // Memoized field configuration
  const fieldConfig = useMemo(
    () =>
      getFieldConfig(
        editingAccount || viewingAccount,
        parentForNewAccount,
        allAccounts
      ),
    [editingAccount, viewingAccount, parentForNewAccount, allAccounts]
  );

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading Chart of Accounts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold">
              Chart of Accounts
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpandAll}
                className="text-sm"
              >
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCollapseAll}
                className="text-sm"
              >
                Collapse All
              </Button>
              <Button
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="text-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {accountsData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No accounts found. Click "Add Account" to create your first
              account.
            </div>
          ) : (
            <div className="space-y-1">
              {accountsData.map((rootNode) => (
                <TreeNode
                  key={rootNode._id}
                  node={rootNode}
                  level={0}
                  onEdit={setEditingAccount}
                  onView={setViewingAccount}
                  onAddChild={(parentAccount) => {
                    setParentForNewAccount(parentAccount);
                    setIsCreateOpen(true);
                  }}
                  onDelete={setDeletingAccount}
                  expandedNodes={expandedNodes}
                  onToggleExpand={handleToggleExpand}
                  allAccounts={allAccounts}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DynamicSheet
        mode="create"
        title={
          parentForNewAccount
            ? `Add Child Account to ${parentForNewAccount.name}`
            : "Create Account"
        }
        description={
          parentForNewAccount
            ? `Add a new child account under ${parentForNewAccount.code} - ${parentForNewAccount.name}`
            : "Add a new account to the chart of accounts."
        }
        fields={fieldConfig}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setParentForNewAccount(null);
        }}
      />

      {editingAccount && (
        <DynamicSheet
          mode="edit"
          title="Edit Account"
          description="Make changes to the account details."
          fields={fieldConfig}
          onSubmit={handleEditSubmit}
          open={!!editingAccount}
          onOpenChange={(open) => !open && setEditingAccount(null)}
        />
      )}

      {viewingAccount && (
        <DynamicSheet
          mode="view"
          title="View Account"
          description="View account details."
          fields={fieldConfig}
          onSubmit={() => {}}
          open={!!viewingAccount}
          onOpenChange={(open) => !open && setViewingAccount(null)}
        />
      )}

      {deletingAccount && (
        <DeleteModal
          open={!!deletingAccount}
          onOpenChange={(open) => !open && setDeletingAccount(null)}
          title={`Delete ${deletingAccount.name}`}
          description={`Are you sure you want to delete the account "${deletingAccount.code} - ${deletingAccount.name}"? All descendant accounts and related vouchers will also be deleted. This action cannot be undone.`}
          onConfirm={() => handleDelete(deletingAccount)}
          onCancel={() => setDeletingAccount(null)}
          isLoading={isDeleteLoading}
        />
      )}
    </div>
  );
};

export default ChartOfAccountsTree;
