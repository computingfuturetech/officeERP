import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Eye,
  FolderOpen,
  Folder,
  FileText,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";

const TreeNode = ({
  node,
  level = 0,
  onEdit,
  onView,
  onAddChild,
  onDelete,
  expandedNodes,
  onToggleExpand,
  allAccounts = [],
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node._id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getTypeIcon = (hasChildren, isExpanded) => {
    if (hasChildren) {
      return isExpanded ? (
        <FolderOpen className="h-4 w-4" />
      ) : (
        <Folder className="h-4 w-4" />
      );
    }
    return <FileText className="h-4 w-4" />;
  };

  const handleToggle = () => {
    if (hasChildren) {
      onToggleExpand(node._id);
    }
  };

  const handleActionsClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer group ${
          isMenuOpen ? "bg-gray-50" : "hover:bg-gray-50"
        }`}
        onClick={handleToggle}
        style={{ paddingLeft: `${level * 24 + 8}px` }}
      >
        {/* Expand/Collapse button */}
        <div className="flex items-center justify-center w-4 h-4">
          {hasChildren ? (
            <button
              className="flex items-center justify-center w-4 h-4 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* Type icon */}
        <div className="flex items-center justify-center w-4 h-4 text-gray-500">
          {getTypeIcon(hasChildren, isExpanded)}
        </div>

        {/* Account details */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="font-medium text-sm truncate">{node.code}</span>
          <span className="text-sm text-gray-700 truncate">{node.name}</span>
        </div>

        {/* Actions */}
        <div
          className={`${
            isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          } transition-opacity`}
          onClick={handleActionsClick}
        >
          <DropdownMenu onOpenChange={(open) => setIsMenuOpen(open)}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4 text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(node)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(node)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddChild(node)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Child Account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(node)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {node.children.map((child) => (
            <TreeNode
              key={child._id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onView={onView}
              onAddChild={onAddChild}
              onDelete={onDelete}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              allAccounts={allAccounts}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;