import React, { ReactNode, useState, useRef, useEffect } from "react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { DatePicker } from "./date-picker";
import { Textarea } from "./ui/textarea";

export type SelectOption = {
    value: string;
    label: string;
};

export type FieldConfig = {
    id: string;
    label: string;
    type?: "text" | "email" | "number" | "date" | "select" | "cnic" | "textarea";
    value: string | number | Date | undefined;
    required?: boolean;
    placeholder?: string;
    readOnly?: boolean;
    validate?: (value: string) => string | null;
    options?: SelectOption[];
};

type SheetMode = "create" | "edit" | "view";

interface DynamicSheetProps {
    mode: SheetMode;
    title: string;
    description?: string;
    fields: FieldConfig[];
    trigger?: ReactNode;
    onSubmit: (data: Record<string, any>) => Promise<boolean> | boolean;
    onCancel?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onValueChange?: (values: Record<string, any>) => void;
    initialValues?: Record<string, any>;
}

export function DynamicSheet({
    mode,
    title,
    description,
    fields,
    trigger,
    onSubmit,
    onCancel,
    open,
    onOpenChange,
    onValueChange,
    initialValues = {},
}: DynamicSheetProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const formRef = useRef<HTMLFormElement>(null);
    const [initialized, setInitialized] = useState(false);

    const isViewMode = mode === "view";
    const isCreateMode = mode === "create";

    const setNestedValue = (obj: any, path: string, value: any) => {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in current)) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        return obj;
    };
    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((current, key) => {
            return current?.[key];
        }, obj);
    };


    useEffect(() => {
        if (open && !initialized) {
            let initialValues1: Record<string, any> = {};
            fields.forEach((field) => {
                setNestedValue(initialValues1, field.id, field.value ?? "");
            });

            initialValues1 = { ...initialValues1, ...initialValues };
            setFormValues(initialValues1);
            setInitialized(true);
            onValueChange?.(initialValues1);
        } else if (!open) {
            setInitialized(false);
        }
    }, [open, fields, initialized, initialValues]);

    const validateForm = () => {
        const errors: Record<string, string> = {};
        fields.forEach((field) => {
            const value = formValues[field.id] || "";
            if (field.required && !value.toString().trim()) {
                errors[field.id] = `${field.label} is required`;
            }
            if (field.validate && !errors[field.id]) {
                const customError = field.validate(value.toString());
                if (customError) {
                    errors[field.id] = customError;
                }
            }
        });
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleValueChange = (fieldId: string, value: any) => {
        const newValues = {
            ...formValues,
            [fieldId]: value,
        };
        setFormValues(newValues);

        if (onValueChange) {
            onValueChange(newValues);
        }

        clearFieldError(fieldId);
    };

    const clearFieldError = (fieldId: string) => {
        setValidationErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldId];
            return newErrors;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!validateForm() || isSubmitting) {
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await onSubmit(formValues);
            if (result !== false) {
                onOpenChange?.(false);
            }
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderField = (field: FieldConfig) => {
        const isReadOnly = mode === "edit" && field.readOnly;
        const error = validationErrors[field.id];
        const value = getNestedValue(formValues, field.id) ?? field?.value ?? "";

        switch (field.type) {
            case "date":
                return (
                    <div key={field.id} className="space-y-1">
                        <Label htmlFor={field.id} className="text-left capitalize">
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <DatePicker
                            value={value ? new Date(value) : undefined}
                            onChange={(date) => handleValueChange(field.id, date?.toISOString() ?? "")}
                            disabled={isReadOnly || isViewMode}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );
            case "select":
                return (
                    <div key={field.id} className="space-y-1">
                        <Label htmlFor={field.id} className="text-left capitalize">
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Select
                            value={value?.toString()}
                            onValueChange={(newValue) => handleValueChange(field.id, newValue)}
                            disabled={isReadOnly || isViewMode}
                        >
                            <SelectTrigger className={`col-span-3 ${error ? "border-red-500" : ""}`}>
                                <SelectValue placeholder={field.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                                {field.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );
            case "textarea":
                return (
                    <div key={field.id} className="space-y-1">
                        <Label htmlFor={field.id} className="capitalize">
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Textarea
                            id={field.id}
                            name={field.id}
                            value={value}
                            onChange={(e) => handleValueChange(field.id, e.target.value)}
                            className={`col-span-3 ${error ? "border-red-500" : ""}`}
                            required={field.required}
                            placeholder={field.placeholder}
                            readOnly={isReadOnly}
                            disabled={isReadOnly || isViewMode}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );
            default:
                return (
                    <div key={field.id} className="space-y-1">
                        <Label htmlFor={field.id} className="capitalize">
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                            id={field.id}
                            name={field.id}
                            type={field.type || "text"}
                            value={value}
                            onChange={(e) => handleValueChange(field.id, e.target.value)}
                            className={`col-span-3 ${error ? "border-red-500" : ""}`}
                            required={field.required}
                            placeholder={field.placeholder}
                            readOnly={isReadOnly}
                            disabled={isReadOnly || isViewMode}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                );
        }
    };

    return (
        <Sheet
            open={open}
            onOpenChange={(newOpen) => onOpenChange?.(newOpen)}
        >
            {!open && trigger && (
                <SheetTrigger asChild>
                    {trigger || (
                        <Button variant={isViewMode ? "ghost" : "outline"}>
                            {isCreateMode ? "Create New" : isViewMode ? "View" : "Edit"}
                        </Button>
                    )}
                </SheetTrigger>
            )}
            <SheetContent>
                <form onSubmit={handleSubmit} ref={formRef}>
                    <SheetHeader>
                        <SheetTitle>{title}</SheetTitle>
                        {description && <SheetDescription>{description}</SheetDescription>}
                    </SheetHeader>
                    <div className="grid gap-2 py-4">
                        {fields.map(renderField)}
                    </div>
                    <SheetFooter>
                        {!isViewMode && (
                            <SheetClose asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    className="mr-2"
                                >
                                    Cancel
                                </Button>
                            </SheetClose>
                        )}
                        <Button type="submit" disabled={isViewMode || isSubmitting}>
                            {isSubmitting
                                ? "Submitting..."
                                : isCreateMode
                                    ? "Create"
                                    : isViewMode
                                        ? "Close"
                                        : "Save changes"}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}