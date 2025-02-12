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
  createTransferIncome,
  getTransferIncome,
  updateTransferIncome,
} from "../../services/transferIncome";

export default function TransferIncome() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTransferIncome, setEditingTransferIncome] = useState(null);
  const [viewingTransferIncome, setViewingTransferIncome] = useState(null);
  const [originalFilters, setOriginalFilters] = useState({});
  const { toast, dismiss } = useToast();
  const [pagination, setPagination] = useState({
    pageIndex: parseInt(searchParams.get("page")) - 1 || 0,
    pageSize: parseInt(searchParams.get("limit")) || 50,
  });
  const [pageCount, setPageCount] = useState(0);
  const [formValues, setFormValues] = useState({});
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

  const handleEditSubmit = async (data) => {
    try {
      const transformedData = transformFormData(data);
      const response = await updateTransferIncome(
        editingTransferIncome._id,
        transformedData
      );
      if (response.status === 200) {
        fetchTransferIncomeData();
        toast({
          title: "Transfer Income updated",
          description: "Transfer Income has been successfully updated.",
        });
        setEditingTransferIncome(null);
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
      const transformedData = transformFormData(formData);
      const response = await createTransferIncome(transformedData);

      if (response.status === 201) {
        fetchTransferIncomeData();
        toast({
          title: "Transfer Income created",
          description: "Transfer Income has been successfully created.",
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
    fetchTransferIncomeData();
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
  const prepareInitialValues = (transferIncome) => {
    if (!transferIncome) return {};

    const initialValues = {
      msNo: transferIncome.msNo?.msNo || "",
      challanNo: transferIncome.challanNo || "",
      type: transferIncome.type || "",
      address: transferIncome.address || "",
      // paidDate: transferIncome.paidDate
      //   ? new Date(transferIncome.paidDate).toISOString().split("T")[0]
      //   : "",
      paymentDetail: {},
    };

    if (
      transferIncome.paymentDetail &&
      Array.isArray(transferIncome.paymentDetail)
    ) {
      transferIncome.paymentDetail.forEach((detail) => {
        const hoaId = detail.incomeHeadOfAccount?._id;

        if (hoaId) {
          initialValues.paymentDetail[hoaId] = {
            paidDate: detail.paidDate,
            incomeHeadOfAccount: hoaId,
            amount: detail.amount,
            check: detail.check,
            particular: detail.particular || "",
            bank: detail.check === "Bank" ? detail.bank?._id : "",
            chequeNumber: detail.check === "Bank" ? detail.chequeNumber : "",
          };
        }
      });
    }

    return initialValues;
  };
  const getFieldConfig = (transferIncome = null, currentValues = null) => {
    const currentType = transferIncome?.type || currentValues?.type;
    const headOfAccounts =
      currentType === "Seller"
        ? originalFilters?.listOfSellerIncomeHeadOfAccount || []
        : originalFilters?.listOfPurchaserIncomeHeadOfAccount || [];

    const formattedDate = transferIncome?.paidDate
      ? new Date(transferIncome.paidDate).toISOString().split("T")[0]
      : "";

    const baseFields = [
      {
        id: "msNo",
        label: "Member No",
        type: "text",
        value: currentValues?.msNo || transferIncome?.msNo?.msNo || "",
        required: true,
        placeholder: "Enter member number",
        readOnly: true,
      },
      {
        id: "challanNo",
        label: "Challan No",
        type: "text",
        value: currentValues?.challanNo || transferIncome?.challanNo || "",
        required: true,
        placeholder: "Enter challan number",
      },
      {
        id: "type",
        label: "Type",
        type: "select",
        value: currentValues?.type || transferIncome?.type || "",
        required: true,
        options: [
          { value: "Seller", label: "Seller" },
          { value: "Purchaser", label: "Purchaser" },
        ],
        readOnly: true,
        onChange: (e) =>
          handleFormValueChange({ ...currentValues, type: e.target.value }),
        placeholder: "Select type",
      },
      {
        id: "address",
        label: "Address",
        type: "text",
        value: currentValues?.address || transferIncome?.address || "",
        placeholder: "Enter address",
      },
      // {
      //   id: "paidDate",
      //   label: "Paid Date",
      //   type: "date",
      //   value: currentValues?.paidDate || formattedDate || "",
      //   required: true,
      //   placeholder: "Select paid date",
      // },
    ];

    const paymentDetailFields =
      currentType &&
      headOfAccounts.flatMap((head) => {
        const hoaId = head._id;

        const existingPayment = transferIncome?.paymentDetail?.find(
          (pd) => pd.incomeHeadOfAccount?._id === hoaId
        );

        const currentPayment = {
          paidDate: currentValues?.[`paymentDetail.${hoaId}.paidDate`],
          amount: currentValues?.[`paymentDetail.${hoaId}.amount`],
          check: currentValues?.[`paymentDetail.${hoaId}.check`],
          particular: currentValues?.[`paymentDetail.${hoaId}.particular`],
          bank: currentValues?.[`paymentDetail.${hoaId}.bank`],
          chequeNumber: currentValues?.[`paymentDetail.${hoaId}.chequeNumber`],
        };
        const fields = [
          {
            id: `paymentDetail.${hoaId}.incomeHeadOfAccount`,
            label: head.headOfAccount,
            type: "hidden",
            value: hoaId,
          },
          {
            id: `paymentDetail.${hoaId}.paidDate`,
            label: `Paid Date for ${head.headOfAccount}`,
            type: "date",
            value: currentPayment?.paidDate || existingPayment?.paidDate || "",
            readOnly: existingPayment?.paidDate,
            placeholder: "Select paid date",
          },
          {
            id: `paymentDetail.${hoaId}.amount`,
            label: `Amount for ${head.headOfAccount}`,
            type: "number",
            value: currentPayment.amount || existingPayment?.amount || "",
            placeholder: "Enter amount",
            readOnly: existingPayment?.amount,
          },
          {
            id: `paymentDetail.${hoaId}.check`,
            label: `Payment Type`,
            type: "select",
            placeholder: "Select payment type",
            value: currentPayment.check || existingPayment?.check,
            options: [
              { value: "Cash", label: "Cash" },
              { value: "Bank", label: "Bank" },
            ],
            readOnly: existingPayment?.check && editingTransferIncome !== null,
          },
          {
            id: `paymentDetail.${hoaId}.particular`,
            label: `Particular`,
            type: "text",
            value:
              currentPayment.particular || existingPayment?.particular || "",
            placeholder: "Enter particular",
            readOnly: existingPayment?.particular,
          },
        ];

        const isBank =
          (currentPayment.check || existingPayment?.check) === "Bank";
        if (isBank) {
          fields.push(
            {
              id: `paymentDetail.${hoaId}.bank`,
              label: `Bank Account`,
              type: "select",
              placeholder: "Select bank account",
              value: currentPayment.bank || existingPayment?.bank?._id || "",
              options:
                originalFilters?.bankList?.map((b) => ({
                  value: b._id,
                  label: `${b.bankName} (${b.accountNo})`,
                })) || [],
              readOnly: existingPayment?.bank?._id,
            },
            {
              id: `paymentDetail.${hoaId}.chequeNumber`,
              label: `Cheque Number`,
              type: "text",
              value:
                currentPayment.chequeNumber ||
                existingPayment?.chequeNumber ||
                "",
              placeholder: "Enter cheque number",
              readOnly: existingPayment?.chequeNumber,
            }
          );
        }

        return fields;
      });

    return [...baseFields, ...(paymentDetailFields || [])];
  };
  const transformFormData = (formData) => {
    const transformedData = {
      msNo: formData.msNo,
      challanNo: formData.challanNo,
      type: formData.type,
      address: formData.address,
      // paidDate: formData.paidDate,
      paymentDetail: [],
    };

    const paymentDetailsMap = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (key.startsWith("paymentDetail.")) {
        const parts = key.split(".");
        if (parts.length < 3) return;

        const index = parts[1];
        const field = parts[2];

        if (!paymentDetailsMap[index]) {
          paymentDetailsMap[index] = {
            incomeHeadOfAccount: index,
            amount: null,
            check: null,
            particular: null,
            bank: null,
            chequeNumber: null,
            paidDate: null,
          };
        }

        paymentDetailsMap[index][field] = value;
      }
    });

    transformedData.paymentDetail = Object.values(paymentDetailsMap)
      .filter((detail) => {
        return (
          detail.amount &&
          detail.check &&
          detail.incomeHeadOfAccount &&
          // detail.bank &&
          // detail.chequeNumber &&
          // detail.particular &&
          detail.paidDate
        );
      })
      .map((detail) => ({
        paidDate: detail.paidDate || "",
        incomeHeadOfAccount: detail.incomeHeadOfAccount || "",
        amount: Number(detail.amount) || 0,
        check: detail.check,
        particular: detail.particular || "",
        bank: detail.check === "Bank" ? detail.bank : null,
        chequeNumber: detail.check === "Bank" ? detail.chequeNumber : null,
      }));

    if (formData.paymentDetail && typeof formData.paymentDetail === "object") {
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "paymentDetail" && typeof value === "object") {
          Object.entries(value).forEach(([_, paymentDetail]) => {
            transformedData.paymentDetail.push({
              paidDate: paymentDetail.paidDate,
              incomeHeadOfAccount: paymentDetail.incomeHeadOfAccount,
              amount: paymentDetail.amount,
              check: paymentDetail.check,
              particular: paymentDetail.particular,
              bank: paymentDetail.bank,
              chequeNumber: paymentDetail.chequeNumber,
            });
          });
        }
      });
    }

    return transformedData;
  };
  const fetchTransferIncomeData = async () => {
    try {
      setIsLoading(true);
      const queryParams = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      };

      const response = await getTransferIncome(queryParams);
      const formattedData = response?.data?.data.map((item) => ({
        ...item,
        // paidDate: formatDate(item.paidDate),
      }));

      setData(formattedData);
      setOriginalFilters(response?.data?.filters);
      setPageCount(response?.data?.pagination?.totalPages);
    } catch (error) {
      console.error("Error fetching transferIncome:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transfer income data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const columns = [
    {
      accessorKey: "msNo.msNo",
      header: "Member No",
    },
    {
      accessorKey: "msNo.purchaseName",
      header: "Member Name",
    },
    {
      accessorKey: "challanNo",
      header: "Challan No",
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    // {
    //   accessorKey: "paidDate",
    //   header: "Paid Date",
    // },
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
                  setEditingTransferIncome(bankProfit);
                }}
              >
                Edit Transfer Income
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setViewingTransferIncome(bankProfit)}
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
    {
      id: "bank",
      label: "Bank Name",
      type: "select",
      mode: "single",
      options:
        originalFilters?.bankList?.map((bank) => ({
          value: bank._id,
          label: bank.bankName + " - " + bank.accountNo,
        })) || [],
    },
  ];
  const handleFormValueChange = (values) => {
    setFormValues(values);
    if (values.type !== formValues.type) {
      setFormKey((prev) => prev + 1);
    }
  };

  return (
    <div>
      <div className="mt-4">
        <DataTable
          heading="Transfer Income"
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
        title="Create Transfer Income"
        description="Add a new transfer income to the system."
        fields={getFieldConfig(null, formValues)}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onValueChange={handleFormValueChange}
      />

      {editingTransferIncome && (
        <DynamicSheet
          mode="edit"
          title="Edit Transfer Income"
          description="Make changes to the transfer income details."
          fields={getFieldConfig(editingTransferIncome, formValues)}
          onSubmit={handleEditSubmit}
          open={!!editingTransferIncome}
          onOpenChange={(open) => {
            if (!open) {
              setEditingTransferIncome(null);
              setFormValues({});
            }
          }}
          onValueChange={handleFormValueChange}
          initialValues={prepareInitialValues(editingTransferIncome)}
        />
      )}

      {viewingTransferIncome && (
        <DynamicSheet
          mode="view"
          title="View Transfer Income"
          description="View transfer income details."
          fields={getFieldConfig(viewingTransferIncome)}
          onSubmit={() => {}}
          open={!!viewingTransferIncome}
          onOpenChange={(open) => {
            if (!open) {
              setViewingTransferIncome(null);
            }
          }}
          initialValues={prepareInitialValues(viewingTransferIncome)}
        />
      )}
    </div>
  );
}
