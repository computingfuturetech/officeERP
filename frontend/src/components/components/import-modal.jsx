import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/components/ui/dialog";
import { Button } from "@/components/components/ui/button";
import { Alert, AlertDescription } from "@/components/components/ui/alert";
import {
  CheckCircle,
  Upload,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  validateMemberPlotRecordsFile,
  uploadMemberPlotRecordsFile,
  downloadMemberPlotRecordsErrorFile,
} from "@/services/memberPlotRecords";
import { toast } from "../hooks/use-toast";
import PropTypes from "prop-types";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ImportModal = ({ open, onOpenChange, onSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [checkResults, setCheckResults] = useState(null);
  const [error, setError] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [validationDetails, setValidationDetails] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);

  const resetStates = () => {
    setIsUploading(false);
    setIsValidating(false);
    setCheckResults(null);
    setError(null);
    setFileData(null);
    setIsDragging(false);
    setSelectedFileName("");
    setValidationDetails(null);
    setUploadResults(null);
  };

  useEffect(() => {
    if (!open) {
      resetStates();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      resetStates();
    };
  }, []);

  const handleFileUpload = async (file) => {
    try {
      setSelectedFileName(file.name);
      setIsValidating(true);
      setError(null);
      setCheckResults(null);
      setValidationDetails(null);

      const response = await validateMemberPlotRecordsFile(file);
      const data = response?.data?.data;

      setFileData(file);
      setValidationDetails(data);

      const results = {
        complete: data?.summary.validRecordsCount,
        incomplete: data?.summary.invalidRecordsCount,
        wrong: data?.summary.invalidRecordsCount,
        empty: data?.invalidRecords.filter((r) =>
          Object.values(r).every((v) => v === "" || v === null)
        ).length,
      };

      setCheckResults(results);
    } catch (error) {
      console.error("Validation error:", error);
      setError("Failed to validate file");
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleImport = async () => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadResults(null);

      const response = await uploadMemberPlotRecordsFile(fileData);
      const data = response?.data?.data;

      setUploadResults(data);

      // Call onSuccess immediately after successful import
      onSuccess?.();

      toast({
        title: "Import Complete",
        description: `${data.summary.successfulInserts} records inserted, ${data.summary.failedInserts} records rejected.`,
        variant: data.summary.failedInserts === 0 ? "success" : "warning",
      });

      // Close modal only if there are no rejected records
      if (data.summary.failedInserts === 0) {
        onOpenChange(false);
        resetStates();
      }
    } catch (err) {
      setError("Import failed. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const renderSpinLoading = (message) => (
    <div className="flex items-center justify-center p-8 space-x-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );

  const renderValidationDetails = () => {
    if (!validationDetails?.invalidRecords?.length) return null;

    return (
      <div className="mt-4 space-y-4">
        <h4 className="font-medium">Invalid Records Details:</h4>
        <div className="max-h-[200px] overflow-y-auto space-y-2">
          {validationDetails.invalidRecords.map((record, index) => (
            <div key={index} className="p-3 bg-red-50 rounded-lg space-y-1">
              <p className="text-sm font-medium">Record #{index + 1}</p>
              <p className="text-sm text-red-600">{record.Reasons}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                {Object.entries(record)
                  .filter(([key]) => key !== "Reasons")
                  .map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {value || "-"}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleDownloadError = async () => {
    try {
      const filePath = uploadResults.invalidRecordsCSVUrl;
      const blob = await downloadMemberPlotRecordsErrorFile(filePath);

      // Ensure the blob type is set to CSV
      const fileName = filePath.split("/").pop();
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "text/csv;charset=utf-8" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Error file downloaded successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download error file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderUploadResults = () => {
    if (!uploadResults) return null;

    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <h4 className="font-medium">Upload Results</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Inserted: {uploadResults.summary.successfulInserts}</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>Rejected: {uploadResults.summary.failedInserts}</span>
          </div>
        </div>
        {uploadResults.invalidRecordsCSVUrl && (
          <div className="flex justify-center p-3">
            <Button
              variant="outline"
              onClick={handleDownloadError}
              className="flex items-center gap-2 text-sm hover:bg-red-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Error Details
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4 min-h-fit">
          {!fileData && !isValidating && !isUploading  ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/10"
                  : "border-gray-300 hover:border-primary"
              }`}
              onClick={() => document.getElementById("file-upload").click()}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
              />
              <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600">
                Drag and drop your file here, or click to select
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Supports: CSV, Excel files
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show spin loading during validation */}
              {isValidating && renderSpinLoading(`Validating: ${selectedFileName}`)}

              {/* Show spin loading during import */}
              {isUploading && renderSpinLoading(`Importing: ${selectedFileName}`)}

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Show validation results after validation is complete */}
              {validationDetails &&
                !isValidating &&
                !isUploading &&
                !uploadResults && (
                  <>
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium">Validation Results</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>
                            Valid: {validationDetails.summary.validRecordsCount}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>
                            Invalid:{" "}
                            {validationDetails.summary.invalidRecordsCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {renderValidationDetails()}

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleImport}
                        disabled={
                          isUploading ||
                          validationDetails.summary.totalRecordsCount === 0
                        }
                        className="relative"
                      >
                        {isUploading && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Import File
                      </Button>
                    </div>
                  </>
                )}

              {/* Show upload results after import is complete */}
              {uploadResults && !isUploading && renderUploadResults()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Add PropTypes
ImportModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default ImportModal;