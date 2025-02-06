import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/components/data-table";
import { Button } from "@/components/components/ui/button";
import { DynamicSheet } from "@/components/components/dynamic-sheet";
import { useToast } from "@/components/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import {
  createSiteExpense,
  getExpenseHead,
  getSiteExpense,
  updateSiteExpense,
} from "../../services/siteExpense";
import { set } from "react-hook-form";
import { months } from "../../assets/options";

export default function SiteExpense() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSiteExpense, setEditingSiteExpense] = useState(null);
  const [viewingSiteExpense, setViewingSiteExpense] = useState(null);
  const [originalFilters, setOriginalFilters] = useState({});
  const { toast, dismiss } = useToast();
  const [pagination, setPagination] = useState({
    pageIndex: parseInt(searchParams.get("page")) - 1 || 0,
    pageSize: parseInt(searchParams.get("limit")) || 50,
  });
  const [pageCount, setPageCount] = useState(0);
  const [formValues, setFormValues] = useState({});
  const [headOfAccounts, setHeadOfAccounts] = useState([]);
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
  const [formKey, setFormKey] = useState(0);
  const [selectedEndPoint, setSelectedEndPoint] = useState("");

  const handleEditSubmit = async (data) => {
    try {
      const selectedEndPoint = headOfAccounts.find(
        (head) => head._id === data.mainHeadOfAccount
      ).endPoints;
      const response = await updateSiteExpense(
        selectedEndPoint,
        editingSiteExpense._id,
        data
      );
      if (response.status === 200) {
        fetchSiteExpense();
        toast({
          title: "Site Expense updated",
          description: "Site Expense has been successfully updated.",
        });
        setEditingSiteExpense(null);
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
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-PK", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };
  const handleCreateSubmit = async (formData) => {
    try {
      const selectedEndPoint = headOfAccounts.find(
        (head) => head._id === formData.mainHeadOfAccount
      ).endPoints;
      if (formData.check === "Cash") {
        delete formData.bank;
        delete formData.chequeNumber;
      }
      const response = await createSiteExpense(selectedEndPoint, formData);

      if (response.status === 201) {
        fetchSiteExpense();
        toast({
          title: "Site Expense created",
          description: "Site Expense has been successfully created.",
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
  const expenseHead = async () => {
    try {
      const response = await getExpenseHead();

      const fieldsMap = response?.data?.fields || {};
      const endPoints = response?.data?.endPoints || {};

      const formattedData =
        response?.data?.data?.map((item) => ({
          _id: item?._id || "",
          headOfAccount: item?.headOfAccount || "",
          subHeadOfAccount:
            item?.subExpenseHeads?.map((sub) => ({
              _id: sub?._id || "",
              headOfAccount: sub?.headOfAccount || "",
            })) || [],
          fields: fieldsMap[item?.headOfAccount] || [],
          endPoints: endPoints[item?.headOfAccount] || "",
        })) || [];

      setHeadOfAccounts(formattedData);
    } catch (error) {
      console.error("Error fetching expense heads:", error);
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
    expenseHead();
    fetchSiteExpense();
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
  useEffect(() => {
    if (editingSiteExpense || viewingSiteExpense) {
      const expense = editingSiteExpense || viewingSiteExpense;
      const selectedHead = headOfAccounts.find(
        (head) => head._id === expense.mainHeadOfAccount?._id
      );
      setSelectedHeadOfAccount(selectedHead);
      setFormValues(prepareInitialValues(expense));
      setFormKey((prev) => prev + 1);
    }
  }, [editingSiteExpense, viewingSiteExpense, headOfAccounts]);

  const prepareInitialValues = (expense) => {
    if (!expense) return {};

    const initialValues = {
      mainHeadOfAccount: expense.mainHeadOfAccount?._id || "",
      subHeadOfAccount: expense.subHeadOfAccount?._id || "",
      amount: expense.amount || "",
      check: expense.check || "",
      challanNo: expense.challanNo || "",
      vendor: expense.vendor || "",
      description: expense.description || "",
      plotNumber: expense.plotNumber || "",
      fuelLitre: expense.fuelLitre || "",
      vehicleNumber: expense.vehicleNumber || "",
      vehicleType: expense.vehicleType || "",
      paidDate: expense.paidDate
        ? // ? new Date(expense.paidDate).toISOString().split("T")[0]
          new Date(expense.paidDate)
        : "",
      bank: expense.bank || "",
      chequeNumber: expense.chequeNumber || "",
      month: expense.month || "",
      year: expense.year || "",
      billReference: expense.billReference || "",
      billingMonth: expense.billingMonth || "",
      salaryType: expense.salaryType || "",
      employeeName: expense.employeeName || "",
      particular: expense.particular || "",
      advTax: expense.advTax || "",
    };

    return initialValues;
  };

  const transformFieldsForSheet = () => {
    const fields = [
      {
        id: "mainHeadOfAccount",
        label: "Head of Account",
        type: "select",
        required: true,
        readOnly: true,
        placeholder: "Select head of account",
        options: headOfAccounts.map((head) => ({
          value: head._id,
          label: head.headOfAccount,
        })),
      },
    ];

    if (formValues.mainHeadOfAccount) {
      const selectedHead = headOfAccounts.find(
        (head) => head._id === formValues.mainHeadOfAccount
      );

      if (selectedHead) {
        const selectedSubHead = selectedHead.subHeadOfAccount.find(
          (sub) => sub._id === formValues.subHeadOfAccount
        );
        if (selectedHead.subHeadOfAccount?.length > 0) {
          fields.push({
            id: "subHeadOfAccount",
            label: "Sub Head of Account",
            placeholder: "Select sub head of account",
            type: "select",
            readOnly: true,
            required: true,
            options: selectedHead.subHeadOfAccount.map((sub) => ({
              value: sub._id,
              label: sub.headOfAccount,
            })),
          });

          if (formValues.subHeadOfAccount) {
            // Check if 'check' field exists in the fields array
            const hasCheckField = selectedHead.fields?.some(
              (field) => field.name === "check"
            );

            selectedHead.fields?.forEach((field) => {
              if (field.name === "check") {
                fields.push({
                  id: field.name,
                  label: field.label || field.name,
                  type: "select",
                  readOnly: true,
                  required: field.required || false,
                  placeholder: `Select ${field.label || field.name}`,
                  options: [
                    { value: "Bank", label: "Bank" },
                    { value: "Cash", label: "Cash" },
                  ],
                });
              } else if (field.name === "vendor") {
                if (
                  selectedHead.headOfAccount === "Purchase of Land" ||
                  selectedHead.headOfAccount === "Development Expenditure"
                ) {
                } else {
                  fields.push({
                    id: field.name,
                    label: field.label || field.name,
                    type: field.type,
                    required: field.required || false,
                    placeholder: `Enter ${field.label || field.name}`,
                  });
                }
              } else if (
                field.name === "vehicleNumber" ||
                field.name === "vehicleType"
              ) {
                if (selectedSubHead?.headOfAccount !== "Disposal") {
                  fields.push({
                    id: field.name,
                    label: field.label || field.name,
                    type: field.type,
                    required: field.required || false,
                    placeholder: `Enter ${field.label || field.name}`,
                  });
                }
              } else if (field.name === "plotNumber") {
                if (selectedHead?.headOfAccount === "Miscellaneous") {
                  if (selectedSubHead?.headOfAccount === "Demarcation") {
                    fields.push({
                      id: field.name,
                      label: field.label || field.name,
                      type: field.type,
                      required: field.required || false,
                      placeholder: `Enter ${field.label || field.name}`,
                    });
                  }
                } else {
                  fields.push({
                    id: field.name,
                    label: field.label || field.name,
                    type: field.type,
                    required: field.required || false,
                    placeholder: `Enter ${field.label || field.name}`,
                  });
                }
              } else if (field.name === "description") {
                fields.push({
                  id: field.name,
                  label: field.label || field.name,
                  type: "textarea",
                  required: field.required || false,
                  placeholder: `Enter ${field.label || field.name}`,
                });
              } else if (field.name === "year") {
                const currentYear = new Date().getFullYear();
                const yearOptions = Array.from(
                  { length: 100 },
                  (_, i) => currentYear - i
                ).map((year) => ({
                  value: year.toString(),
                  label: year.toString(),
                }));

                fields.push({
                  id: field.name,
                  label: field.label || field.name,
                  type: "select",
                  required: field.required || false,
                  placeholder: `Select ${field.label || field.name}`,
                  options: yearOptions,
                });
              } else if (
                field.name === "month" ||
                field.name === "billingMonth"
              ) {
                fields.push({
                  id: field.name,
                  label: field.label || field.name,
                  type: "select",
                  required: field.required || false,
                  placeholder: `Select ${field.label || field.name}`,
                  options: months,
                });
              } else if (field.name === "bank") {
                // Show bank field if there's no check field or if check is "Bank"
                if (!hasCheckField || formValues.check === "Bank") {
                  fields.push({
                    id: field.name,
                    label: field.label || field.name,
                    type: "select",
                    required: field.required || false,
                    placeholder: `Select ${field.label || field.name}`,
                    options:
                      originalFilters?.bankList?.map((bank) => ({
                        value: bank._id,
                        label: bank.bankName + " - " + bank.accountNo,
                      })) || [],
                  });
                }
              } else if (field.name === "chequeNumber") {
                // Show cheque number field if there's no check field or if check is "Bank"
                if (!hasCheckField || formValues.check === "Bank") {
                  fields.push({
                    id: field.name,
                    label: field.label || field.name,
                    type: field.type,
                    required: field.required || false,
                    placeholder: `Enter ${field.label || field.name}`,
                  });
                }
              } else if (field.name !== "_id" && field.name !== "__v") {
                fields.push({
                  id: field.name,
                  label: field.label || field.name,
                  type:
                    field.type === "number"
                      ? "number"
                      : field.type === "date"
                      ? "date"
                      : "text",
                  required: field.required || false,
                  placeholder: `Enter ${field.label || field.name}`,
                });
              }
            });
          }
        } else {
          // Same logic for when there's no subHeadOfAccount
          const hasCheckField = selectedHead.fields?.some(
            (field) => field.name === "check"
          );
          const selectedSubHead = selectedHead.subHeadOfAccount.find(
            (sub) => sub._id === formValues.subHeadOfAccount
          );

          selectedHead.fields?.forEach((field) => {
            if (field.name === "check") {
              fields.push({
                id: field.name,
                label: field.label || field.name,
                type: "select",
                required: field.required || false,
                readOnly: true,
                placeholder: `Select ${field.label || field.name}`,
                options: [
                  { value: "Bank", label: "Bank" },
                  { value: "Cash", label: "Cash" },
                ],
              });
            } else if (field.name === "vendor") {
              if (
                selectedHead.headOfAccount === "Purchase of Land" ||
                selectedHead.headOfAccount === "Development Expenditure"
              ) {
              } else {
                fields.push({
                  id: field.name,
                  label: field.label || field.name,
                  type: field.type,
                  required: field.required || false,
                  placeholder: `Enter ${field.label || field.name}`,
                });
              }
            } else if (
              field.name === "vehicleNumber" ||
              field.name === "vehicleType"
            ) {
              if (selectedSubHead?.headOfAccount !== "Disposal") {
                fields.push({
                  id: field.name,
                  label: field.label || field.name,
                  type: field.type,
                  required: field.required || false,
                  placeholder: `Enter ${field.label || field.name}`,
                });
              }
            } else if (field.name === "plotNumber") {
              if (selectedHead?.headOfAccount === "Miscellaneous") {
                if (selectedSubHead?.headOfAccount === "Demarcation") {
                  fields.push({
                    id: field.name,
                    label: field.label || field.name,
                    type: field.type,
                    required: field.required || false,
                    placeholder: `Enter ${field.label || field.name}`,
                  });
                }
              } else {
                fields.push({
                  id: field.name,
                  label: field.label || field.name,
                  type: field.type,
                  required: field.required || false,
                  placeholder: `Enter ${field.label || field.name}`,
                });
              }
            } else if (field.name === "description") {
              fields.push({
                id: field.name,
                label: field.label || field.name,
                type: "textarea",
                required: field.required || false,
                placeholder: `Enter ${field.label || field.name}`,
              });
            } else if (field.name === "year") {
              const currentYear = new Date().getFullYear();
              const yearOptions = Array.from(
                { length: 100 },
                (_, i) => currentYear - i
              ).map((year) => ({
                value: year.toString(),
                label: year.toString(),
              }));

              fields.push({
                id: field.name,
                label: field.label || field.name,
                type: "select",
                required: field.required || false,
                placeholder: `Select ${field.label || field.name}`,
                options: yearOptions,
              });
            } else if (
              field.name === "month" ||
              field.name === "billingMonth"
            ) {
              fields.push({
                id: field.name,
                label: field.label || field.name,
                type: "select",
                required: field.required || false,
                placeholder: `Select ${field.label || field.name}`,
                options: months,
              });
            } else if (field.name === "bank") {
              // Show bank field if there's no check field or if check is "Bank"
              if (!hasCheckField || formValues.check === "Bank") {
                fields.push({
                  id: field.name,
                  label: field.label || field.name,
                  type: "select",
                  required: field.required || false,
                  placeholder: `Select ${field.label || field.name}`,
                  options:
                    originalFilters?.bankList?.map((bank) => ({
                      value: bank._id,
                      label: bank.bankName + " - " + bank.accountNo,
                    })) || [],
                });
              }
            } else if (field.name === "chequeNumber") {
              // Show cheque number field if there's no check field or if check is "Bank"
              if (!hasCheckField || formValues.check === "Bank") {
                fields.push({
                  id: field.name,
                  label: field.label || field.name,
                  type: field.type,
                  required: field.required || false,
                  placeholder: `Enter ${field.label || field.name}`,
                });
              }
            } else if (field.name !== "_id" && field.name !== "__v") {
              fields.push({
                id: field.name,
                label: field.label || field.name,
                type:
                  field.type === "number"
                    ? "number"
                    : field.type === "date"
                    ? "date"
                    : "text",
                required: field.required || false,
                placeholder: `Enter ${field.label || field.name}`,
              });
            }
          });
        }
      }
    }

    return fields;
  };
  const fetchSiteExpense = async () => {
    try {
      setIsLoading(true);
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };
      const response = await getSiteExpense(queryParams);
      const formattedData = response?.data?.data.map((item) => ({
        ...item,
        paidDate: formatDate(item.paidDate),
      }));

      setData(formattedData);
      setOriginalFilters(response?.data?.filters);
      setPageCount(response?.data?.pagination?.totalPages);
    } catch (error) {
      console.error("Error fetching site expense:", error);
      toast({
        title: "Error",
        description: "Failed to fetch site expense data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const columns = [
    {
      accessorKey: "mainHeadOfAccount.headOfAccount",
      header: "Head of Account",
    },
    {
      accessorKey: "challanNo",
      header: "Challan No",
    },
    {
      accessorKey: "check",
      header: "Payment Type",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "paidDate",
      header: "Paid Date",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const bankProfit = row.original;
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
              <DropdownMenuItem
                onClick={() => {
                  setEditingSiteExpense(bankProfit);
                }}
              >
                Edit Site Expense
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewingSiteExpense(bankProfit)}
              >
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  const filterConfig = [
    // {
    //   id: "bank",
    //   label: "Bank Name",
    //   type: "select",
    //   mode: "single",
    //   options:
    //     originalFilters?.bankList?.map((bank) => ({
    //       value: bank._id,
    //       label: bank.bankName + " - " + bank.accountNo,
    //     })) || [],
    // },
  ];
  const [selectedHeadOfAccount, setSelectedHeadOfAccount] = useState(null);
  const handleFormValueChange = (values) => {
    setFormValues((prevValues) => {
      const newValues = { ...prevValues, ...values };

      if (
        values.check !== prevValues.check ||
        values.subHeadOfAccount !== prevValues.subHeadOfAccount ||
        values.mainHeadOfAccount !== prevValues.mainHeadOfAccount
      ) {
        setFormKey((prev) => prev + 1);
      }

      if (values.mainHeadOfAccount !== prevValues.mainHeadOfAccount) {
        const selectedHead = headOfAccounts.find(
          (head) => head._id === values.mainHeadOfAccount
        );
        setSelectedHeadOfAccount(selectedHead);
      }

      return newValues;
    });
  };

  return (
    <div>
      <div className="mt-4">
        <DataTable
          heading="Site Expense"
          columns={columns}
          data={data}
          enableFilters={false}
          enableColumnVisibility={true}
          filters={filterConfig}
          onFilterChange={handleFilterChange}
          pagination={pagination}
          pageCount={pageCount}
          onPaginationChange={setPagination}
          createButton={{
            onClick: () => {
              dismiss();
              setIsCreateOpen(true);
              setFormValues({});
              setFormKey((prev) => prev + 1);
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
        title="Create Site Expense"
        description="Add a new site expense to the system."
        fields={transformFieldsForSheet(selectedHeadOfAccount)}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onValueChange={handleFormValueChange}
        initialValues={formValues}
      />

      {editingSiteExpense && selectedHeadOfAccount && (
        <DynamicSheet
          mode="edit"
          title="Edit Site Expense"
          description="Make changes to the site expense details."
          fields={transformFieldsForSheet()}
          onSubmit={handleEditSubmit}
          open={!!editingSiteExpense}
          onOpenChange={(open) => {
            if (!open) {
              setEditingSiteExpense(null);
              setFormValues({});
              setSelectedHeadOfAccount(null);
            }
          }}
          onValueChange={handleFormValueChange}
          initialValues={formValues}
          key={formKey}
        />
      )}

      {viewingSiteExpense && selectedHeadOfAccount && (
        <DynamicSheet
          mode="view"
          title="View Site Expense"
          description="View site expense details."
          fields={transformFieldsForSheet()}
          onSubmit={() => {}}
          open={!!viewingSiteExpense}
          onOpenChange={(open) => {
            if (!open) {
              setViewingSiteExpense(null);
              setFormValues({});
              setSelectedHeadOfAccount(null);
            }
          }}
          onValueChange={handleFormValueChange}
          initialValues={formValues}
          key={formKey}
        />
      )}
    </div>
  );
}
