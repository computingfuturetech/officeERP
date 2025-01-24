import { ReactNode, useState, useRef } from "react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "./ui/select";
import React from "react";

export type SelectOption = {
    value: string;
    label: string;
};

export type FieldConfig = {
    id: string;
    label: string;
    type?: "text" | "email" | "number" | "date" | "select";
    value: string | number;
    required?: boolean;
    placeholder?: string;
    readOnly?: boolean;
    validate?: (value: string) => string | null;
    options?: SelectOption[]; // For select type
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
}: DynamicSheetProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const formRef = useRef<HTMLFormElement>(null);

    const isViewMode = mode === "view";
    const isCreateMode = mode === "create";

    const validateForm = () => {
        const errors: Record<string, string> = {};

        fields.forEach(field => {
            const value = formValues[field.id] || '';

            // Check required fields
            if (field.required && !value.trim()) {
                errors[field.id] = `${field.label} is required`;
            }

            // Custom validation if provided
            if (field.validate && !errors[field.id]) {
                const customError = field.validate(value);
                if (customError) {
                    errors[field.id] = customError;
                }
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // New function to clear error for a specific field
    const clearFieldError = (fieldId: string) => {
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldId];
            return newErrors;
        });
    };

    const handleValueChange = (fieldId: string, value: string) => {
        setFormValues(prev => ({
            ...prev,
            [fieldId]: value
        }));
        clearFieldError(fieldId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form first
        if (!validateForm()) {
            return;
        }

        // Prevent multiple submissions
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);

            // Use formValues instead of FormData
            const result = await onSubmit(formValues);

            // Close the sheet only if the submit is successful (returns true or doesn't return false)
            if (result !== false) {
                onOpenChange?.(false);
            }
        } catch (error) {
            // Optionally handle submission errors
            console.error("Submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Initialize form values when the sheet opens
    React.useEffect(() => {
        if (open) {
            const initialValues: Record<string, string> = {};
            fields.forEach(field => {
                initialValues[field.id] = String(field.value || '');
            });
            setFormValues(initialValues);
        }
    }, [open, fields]);

    const renderField = (field: FieldConfig) => {
        // Set readonly only for fields in edit mode with `readOnly` set to true
        const isReadOnly = mode === "edit" && field.readOnly;
        const error = validationErrors[field.id];
        const value = formValues[field.id] || '';

        // Render different input types
        switch (field.type) {
            case "select":
                return (
                    <div key={field.id} className="space-y-1">
                        <Label htmlFor={field.id} className="text-right">
                            {field.label}
                            {field.required && (
                                <span className="text-destructive ml-1">*</span>
                            )}
                        </Label>
                        <Select
                            value={value}
                            onValueChange={(newValue) => handleValueChange(field.id, newValue)}
                            disabled={isReadOnly || isViewMode}
                        >
                            <SelectTrigger className={`col-span-3 ${error ? 'border-red-500' : ''}`}>
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
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                    </div>
                );

            default:
                return (
                    <div key={field.id} className="space-y-1">
                        <Label htmlFor={field.id} className="text-right">
                            {field.label}
                            {field.required && (
                                <span className="text-destructive ml-1">*</span>
                            )}
                        </Label>
                        <Input
                            id={field.id}
                            name={field.id}
                            type={field.type || "text"}
                            value={value}
                            onChange={(e) => handleValueChange(field.id, e.target.value)}
                            className={`col-span-3 ${error ? 'border-red-500' : ''}`}
                            required={field.required}
                            placeholder={field.placeholder}
                            readOnly={isReadOnly}
                            disabled={isReadOnly || isViewMode}
                        />
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                    </div>
                );
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
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
                        <Button
                            type="submit"
                            disabled={isViewMode || isSubmitting}
                        >
                            {isSubmitting
                                ? "Submitting..."
                                : (isCreateMode
                                    ? "Create"
                                    : isViewMode
                                        ? "Close"
                                        : "Save changes")
                            }
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}