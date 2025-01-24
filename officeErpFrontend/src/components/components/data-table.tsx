import React, { useState } from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    VisibilityState,
    ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useNavigate } from "react-router-dom"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
    MultiSelect,
} from "./ui/multi-selector"
import { Plus } from "lucide-react"

export interface DataTableFilter {
    id: string;
    label: string;
    options: { value: string; label: string }[];
    type: 'select' | 'multiselect' | 'input';
    mode?: 'single' | 'multiple';
}

interface DataTableProps<TData, TValue> {
    heading: string
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    enableFilters?: boolean
    enableColumnVisibility?: boolean
    createButton?: any
    seeAllPath?: string
    filters?: DataTableFilter[]
    onFilterChange?: (filters: Record<string, string[] | string>) => void
    filterableField?: string;
}

export function DataTable<TData, TValue>({
    heading,
    columns,
    data,
    createButton,
    enableFilters = true,
    enableColumnVisibility = true,
    seeAllPath,
    filters = [],
    onFilterChange,
    filterableField,
}: DataTableProps<TData, TValue>) {
    const navigate = useNavigate()
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [searchTerm, setSearchTerm] = useState(""); // State for the input field
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Debounced value
    const [currentFilters, setCurrentFilters] = React.useState<Record<string, string[] | string>>({})

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 10 },
        },
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: enableFilters ? getFilteredRowModel() : undefined,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            columnFilters,
            columnVisibility,
        },
    })

    const handleFilterChange = (filterId: string, values: string[]) => {
        const newFilters = {
            ...currentFilters,
            [filterId]: values.length ? values : undefined,
        }

        const cleanedFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, v]) => v !== undefined)
        )

        setCurrentFilters(cleanedFilters)
        onFilterChange?.(cleanedFilters)
    }
    const handleInputFilterChange = (value: string) => {
        if (!filterableField) return;

        const newFilters = {
            ...currentFilters,
            [filterableField]: value || undefined,
        };

        const cleanedFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, v]) => v !== undefined)
        );

        setCurrentFilters(cleanedFilters);
        onFilterChange?.(cleanedFilters);
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold">{heading}</h2>
            <div className="flex items-center pb-4 gap-4">
                {enableFilters && filterableField && (
                    <Input
                        placeholder={`Filter by ${filterableField}...`}
                        value={(currentFilters[filterableField] as string) ?? ""}
                        onChange={(event) => handleInputFilterChange(event.target.value)}
                        className="max-w-sm"
                    />
                )}

                <div className="flex items-center ml-auto gap-2">
                    {filters.map((filter) => (
                        <div key={filter.id} className="flex items-center space-x-2">
                            {(filter.type === 'select' || filter.type === 'multiselect') && (
                                <MultiSelect
                                    options={filter.options}
                                    onValueChange={(values) => handleFilterChange(filter.id, values)}
                                    defaultValue={currentFilters[filter.id] as string[]}
                                    placeholder={`Select ${filter.label}`}
                                    variant="inverted"
                                    animation={2}
                                    maxCount={filter.mode === 'single' ? 1 : 3}
                                />
                            )}
                        </div>
                    ))}

                    {enableColumnVisibility && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="ml-auto">
                                    Columns
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {
                        createButton && (
                            <Button
                                variant="default"
                                onClick={createButton.onClick}
                            >
                                <Plus color="white" /> {createButton.label}
                            </Button>
                        )
                    }

                    {seeAllPath && (
                        <Button
                            variant="default"
                            onClick={() => navigate(seeAllPath)}
                        >
                            See All
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}