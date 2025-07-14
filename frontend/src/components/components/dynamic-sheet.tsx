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
import { Plus, Trash2 } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
};

export type FieldConfig = {
  id: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "number"
    | "date"
    | "select"
    | "cnic"
    | "textarea"
    | "fieldSet"
    | "custom";
  value: any;
  required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  validate?: (value: string) => string | null;
  options?: SelectOption[];
  fieldSetTemplate?: FieldConfig[];
  showWhen?: { field: string; value: string };
  gridColumns?: number;
  onChange?: (value: any) => void; // Add this
  component: any;
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
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [initialized, setInitialized] = useState(false);

  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";

  const setNestedValue = (obj: any, path: string, value: any) => {
    const keys = path.split(".");
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    return { ...obj };
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((current, key) => {
      return current?.[key];
    }, obj);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.type === "fieldSet" && field.fieldSetTemplate) {
        const fieldSetValues = formValues[field.id] || [];
        fieldSetValues.forEach((fieldSetItem: any, index: number) => {
          field.fieldSetTemplate.forEach((templateField) => {
            if (
              templateField.showWhen &&
              getNestedValue(fieldSetItem, templateField.showWhen.field) !==
                templateField.showWhen.value
            ) {
              return;
            }

            const value = getNestedValue(fieldSetItem, templateField.id) ?? "";
            const errorKey = `${field.id}.${index}.${templateField.id}`;

            if (templateField.required && !value.toString().trim()) {
              errors[errorKey] = `${templateField.label} is required`;
            }

            if (templateField.validate && !errors[errorKey]) {
              const customError = templateField.validate(value.toString());
              if (customError) {
                errors[errorKey] = customError;
              }
            }
          });
        });
      } else {
        if (field.showWhen) {
          const value = getNestedValue(formValues, field.showWhen.field);
          if (value !== field.showWhen.value) {
            return;
          }
        }
        const value = getNestedValue(formValues, field.id) || "";
        if (field.required && !value.toString().trim()) {
          errors[field.id] = `${field.label} is required`;
        }
        if (field.validate && !errors[field.id]) {
          const customError = field.validate(value.toString());
          if (customError) {
            errors[field.id] = customError;
          }
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleValueChange = (fieldId: string, value: any) => {
    const newValues = setNestedValue(formValues, fieldId, value);
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
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`${fieldId}.`)) {
          delete newErrors[key];
        }
      });
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
      if (result !== undefined && result !== false) {
        onOpenChange?.(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addField = (fieldSetId: string) => {
    const fieldSet = fields.find((f) => f.id === fieldSetId);
    if (!fieldSet || !fieldSet.fieldSetTemplate) return;

    const newField = {};
    fieldSet.fieldSetTemplate.forEach((templateField) => {
      setNestedValue(newField, templateField.id, templateField.value || "");
    });

    handleValueChange(fieldSetId, [
      ...(formValues[fieldSetId] || []),
      newField,
    ]);
  };

  const removeField = (fieldSetId: string, index: number) => {
    const newFields = (formValues[fieldSetId] || []).filter(
      (_: any, i: number) => i !== index
    );
    handleValueChange(fieldSetId, newFields);
  };

  const updateField = (fieldSetId: string, index: number, fieldData: any) => {
    const newFields = [...(formValues[fieldSetId] || [])];
    newFields[index] = fieldData;
    handleValueChange(fieldSetId, newFields);
  };

  const renderFieldSet = (fieldSet: FieldConfig) => {
    if (!fieldSet.fieldSetTemplate) return null;

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>{fieldSet.label}</Label>
          {!isViewMode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addField(fieldSet.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        {formValues[fieldSet.id]?.map((field: any, index: number) => (
          <div key={index} className="border p-4 rounded-md space-y-2">
            <div
              className={`grid grid-cols-${fieldSet.gridColumns || 2} gap-4`}
            >
              {fieldSet.fieldSetTemplate.map((templateField) => {
                if (
                  templateField.showWhen &&
                  getNestedValue(field, templateField.showWhen.field) !==
                    templateField.showWhen.value
                ) {
                  return null;
                }

                const fieldValue =
                  getNestedValue(field, templateField.id) ??
                  templateField.value ??
                  "";
                const error =
                  validationErrors[
                    `${fieldSet.id}.${index}.${templateField.id}`
                  ];

                switch (templateField.type) {
                  case "select":
                    return (
                      <div key={templateField.id} className="space-y-1">
                        <Label
                          htmlFor={`${fieldSet.id}.${index}.${templateField.id}`}
                          className="capitalize"
                        >
                          {templateField.label}
                          {templateField.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                        <Select
                          value={fieldValue?.toString()}
                          onValueChange={(value) =>
                            updateField(
                              fieldSet.id,
                              index,
                              setNestedValue(field, templateField.id, value)
                            )
                          }
                          disabled={isViewMode}
                        >
                          <SelectTrigger
                            className={`col-span-3 ${
                              error ? "border-red-500" : ""
                            }`}
                          >
                            <SelectValue
                              placeholder={templateField.placeholder}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {templateField.options?.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
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
                  case "textarea":
                    return (
                      <div key={templateField.id} className="space-y-1">
                        <Label
                          htmlFor={`${fieldSet.id}.${index}.${templateField.id}`}
                          className="capitalize"
                        >
                          {templateField.label}
                          {templateField.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                        <Textarea
                          id={`${fieldSet.id}.${index}.${templateField.id}`}
                          value={fieldValue}
                          onChange={(e) =>
                            updateField(
                              fieldSet.id,
                              index,
                              setNestedValue(
                                field,
                                templateField.id,
                                e.target.value
                              )
                            )
                          }
                          className={`col-span-3 ${
                            error ? "border-red-500" : ""
                          }`}
                          required={templateField.required}
                          placeholder={templateField.placeholder}
                          disabled={isViewMode}
                        />
                        {error && (
                          <p className="text-red-500 text-sm">{error}</p>
                        )}
                      </div>
                    );
                  case "date":
                    return (
                      <div key={templateField.id} className="space-y-1">
                        <Label
                          htmlFor={`${fieldSet.id}.${index}.${templateField.id}`}
                          className="capitalize"
                        >
                          {templateField.label}
                          {templateField.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                        <DatePicker
                          value={fieldValue ? new Date(fieldValue) : undefined}
                          onChange={(date) =>
                            updateField(
                              fieldSet.id,
                              index,
                              setNestedValue(
                                field,
                                templateField.id,
                                date?.toISOString() ?? ""
                              )
                            )
                          }
                          disabled={isViewMode}
                          maxDate={new Date()}
                        />
                        {error && (
                          <p className="text-red-500 text-sm">{error}</p>
                        )}
                      </div>
                    );
                  default:
                    return (
                      <div key={templateField.id} className="space-y-1">
                        <Label
                          htmlFor={`${fieldSet.id}.${index}.${templateField.id}`}
                          className="capitalize"
                        >
                          {templateField.label}
                          {templateField.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                        <Input
                          id={`${fieldSet.id}.${index}.${templateField.id}`}
                          type={templateField.type || "text"}
                          value={fieldValue}
                          onChange={(e) =>
                            updateField(
                              fieldSet.id,
                              index,
                              setNestedValue(
                                field,
                                templateField.id,
                                e.target.value
                              )
                            )
                          }
                          className={`col-span-3 ${
                            error ? "border-red-500" : ""
                          }`}
                          required={templateField.required}
                          placeholder={templateField.placeholder}
                          disabled={isViewMode}
                        />
                        {error && (
                          <p className="text-red-500 text-sm">{error}</p>
                        )}
                      </div>
                    );
                }
              })}
            </div>
            {!isViewMode && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeField(fieldSet.id, index)}
                className="mt-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderField = (field: FieldConfig) => {
    if (field.type === "fieldSet") {
      return renderFieldSet(field);
    }

    if (field.showWhen) {
      const value = getNestedValue(formValues, field.showWhen.field);
      if (value !== field.showWhen.value) {
        return null;
      }
    }

    const isReadOnly = field.readOnly;
    const isDisabled = isReadOnly || isViewMode;
    const error = validationErrors[field.id];
    const value = getNestedValue(formValues, field.id) ?? field.value ?? "";

    switch (field.type) {
      case "date":
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-left capitalize">
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <DatePicker
              value={value ? new Date(value) : undefined}
              onChange={(date) =>
                handleValueChange(field.id, date?.toISOString() ?? "")
              }
              disabled={isDisabled}
              maxDate={new Date()}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
      case "select":
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="text-left capitalize">
              {field.label}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Select
              value={value?.toString()}
              onValueChange={(newValue) => {
                handleValueChange(field.id, newValue);
                if (field.onChange) field.onChange(newValue);
              }}
              disabled={isDisabled}
            >
              <SelectTrigger
                className={`col-span-3 ${error ? "border-red-500" : ""}`}
              >
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
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
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
              disabled={isDisabled}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
      default:
        return (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={field.id} className="capitalize">
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
              className={`col-span-3 ${error ? "border-red-500" : ""}`}
              required={field.required}
              placeholder={field.placeholder}
              readOnly={isReadOnly}
              disabled={isDisabled}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
      case "custom":
        return field.component;
    }
  };

  useEffect(() => {
    if (open && !initialized) {
      let initialValues1: Record<string, any> = {};
      fields.forEach((field) => {
        setNestedValue(
          initialValues1,
          field.id,
          field.value ?? (field.type === "fieldSet" ? [] : "")
        );
      });

      initialValues1 = { ...initialValues1, ...initialValues };
      setFormValues(initialValues1);
      setInitialized(true);
      onValueChange?.(initialValues1);
    } else if (!open) {
      setInitialized(false);
    }
  }, [open, fields, initialized, initialValues]);

  return (
    <Sheet open={open} onOpenChange={(newOpen) => onOpenChange?.(newOpen)}>
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
          <div className="grid gap-4 py-4">{fields.map(renderField)}</div>
          <SheetFooter>
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="mr-2"
              >
                {isViewMode ? "Close" : "Cancel"}
              </Button>
            </SheetClose>
            {!isViewMode && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Submitting..."
                  : isCreateMode
                  ? "Create"
                  : "Save changes"}
              </Button>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
