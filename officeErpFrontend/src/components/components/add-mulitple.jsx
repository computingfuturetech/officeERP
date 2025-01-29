import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "../lib/utils";
import { format } from "date-fns";

const AddMultiple = ({
  title = "Dynamic Form",
  fields = [],
  initialData = {},
  onSubmit,
  submitButtonText = "Save",
  addNewButtonText = "+ Add New",
  enableMultiple = true,
  gridCols = "grid-cols-3",
  className = "",
}) => {
  const [formEntries, setFormEntries] = React.useState([{ ...initialData }]);
  const [errors, setErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleInputChange = (index, field) => (e) => {
    const newEntries = [...formEntries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: e.target.value,
    };
    setFormEntries(newEntries);

    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const handleDateSelect = (index, field) => (date) => {
    const newEntries = [...formEntries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: date,
    };
    setFormEntries(newEntries);
  };

  const handleSelectChange = (index, field) => (value) => {
    const newEntries = [...formEntries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: value,
    };
    setFormEntries(newEntries);
  };

  const handleAddNew = () => {
    setFormEntries([...formEntries, { ...initialData }]);
  };

  const handleRemoveEntry = (index) => {
    if (formEntries.length > 1) {
      const newEntries = formEntries.filter((_, i) => i !== index);
      setFormEntries(newEntries);

      const newErrors = {};
      Object.entries(errors).forEach(([errorIndex, errorMessage]) => {
        const numericIndex = parseInt(errorIndex);
        if (numericIndex < index) {
          newErrors[numericIndex] = errorMessage;
        } else if (numericIndex > index) {
          newErrors[numericIndex - 1] = errorMessage;
        }
      });
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await onSubmit(formEntries);

      const successfulIndices = new Set();
      const newErrors = {};

      response.data.data.forEach((result, index) => {
        if (result.status === "error") {
          newErrors[index] = result.message;
        } else {
          successfulIndices.add(index);
        }
      });

      const newEntries = formEntries.filter(
        (_, index) => !successfulIndices.has(index)
      );

      const adjustedErrors = {};
      let offset = 0;

      Object.entries(newErrors).forEach(([index, message]) => {
        const precedingSuccessful = Array.from(successfulIndices).filter(
          (successIndex) => successIndex < parseInt(index)
        ).length;

        const newIndex = parseInt(index) - precedingSuccessful;
        adjustedErrors[newIndex] = message;
      });

      setErrors(adjustedErrors);
      setFormEntries(newEntries.length > 0 ? newEntries : [{ ...initialData }]);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field, entry, index) => {
    switch (field.type) {
      case "text":
      case "number":
        return (
          <Input
            type={field.type}
            required={field.required}
            value={entry[field.id] || ""}
            onChange={handleInputChange(index, field.id)}
            placeholder={field.placeholder}
            readOnly={field.readOnly}
          />
        );

      case "select":
        return (
          <Select
            value={entry[field.id] || ""}
            onValueChange={handleSelectChange(index, field.id)}
            disabled={field.readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem
                  key={option.value || option}
                  value={option.value || option}
                >
                  {option.label || option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !entry[field.id] && "text-muted-foreground"
                )}
                disabled={field.readOnly}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {entry[field.id]
                  ? format(entry[field.id], "PPP")
                  : field.placeholder || "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={entry[field.id]}
                onSelect={handleDateSelect(index, field.id)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formEntries.map((entry, index) => (
            <div
              key={index}
              className="relative border rounded-lg p-4 space-y-6"
            >
              {enableMultiple && formEntries.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={() => handleRemoveEntry(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {errors[index] && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />

                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{errors[index]}</AlertDescription>
                </Alert>
              )}

              <div className={cn("grid gap-4", gridCols)}>
                {fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-sm font-medium">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    {renderField(field, entry, index)}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-4">
            {enableMultiple && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAddNew}
                className="w-32"
              >
                {addNewButtonText}
              </Button>
            )}
            <Button type="submit" className="w-32" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitButtonText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddMultiple;
