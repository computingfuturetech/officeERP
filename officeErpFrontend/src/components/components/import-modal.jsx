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
  validateMembersFile,
  uploadMembersFile,
  downloadErrorFile,
} from "@/services/members";
import { toast } from "../hooks/use-toast";
import PropTypes from "prop-types";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ImportModal = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [checkResults, setCheckResults] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [validationDetails, setValidationDetails] = useState(null);
  const [uploadResults, setUploadResults] = useState(null);

  const resetStates = () => {
    setLoading(false);
    setCheckResults(null);
    setUploadProgress(0);
    setError(null);
    setFileData(null);
    setIsDragging(false);
    setSelectedFileName("");
    setIsUploading(false);
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
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      setCheckResults(null);
      setValidationDetails(null);

      const response = await validateMembersFile(file, (progress) => {
        setUploadProgress(progress);
      });

      setUploadProgress(100);
      setFileData(file);
      setValidationDetails(response);

      const results = {
        complete: response.total - response.invalidCount,
        incomplete: response.invalidCount,
        wrong: response.invalidCount,
        empty: response.invalidRecords.filter((r) =>
          Object.values(r).every((v) => v === "" || v === null)
        ).length,
      };

      setCheckResults(results);
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to validate file");
    } finally {
      setIsUploading(false);
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
      setLoading(true);
      setError(null);
      setUploadProgress(0);
      setUploadResults(null);

      const response = await uploadMembersFile(fileData, (progress) => {
        setUploadProgress(progress);
      });

      setUploadProgress(100);
      setUploadResults(response);

      if (response.status === "success") {
        // Call onSuccess immediately after successful import
        onSuccess?.();

        toast({
          title: "Import Complete",
          description: `${response.inserted} records inserted, ${response.rejected} records rejected.`,
          variant: response.rejected === 0 ? "success" : "warning",
        });

        // Close modal only if there are no rejected records
        if (response.rejected === 0) {
          onOpenChange(false);
          resetStates();
        }
      } else {
        setError("Import failed. Please try again.");
      }
    } catch (err) {
      setError("Import failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderProgress = () => (
    <div className="w-full space-y-2 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-sm text-gray-600">
            {isUploading
              ? `Validating: ${selectedFileName}`
              : `Importing: ${selectedFileName}`}
          </p>
        </div>
        <span className="text-xs font-medium text-gray-700">
          {uploadProgress}%
        </span>
      </div>
      <div className="relative w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
          style={{
            width: `${uploadProgress}%`,
            transition: "width 0.3s ease-in-out",
          }}
        />
      </div>
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
      const filePath = uploadResults.errorFile;
      console.log("Attempting to download:", filePath);

      const blob = await downloadErrorFile(filePath);

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
            <span>Inserted: {uploadResults.inserted}</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>Rejected: {uploadResults.rejected}</span>
          </div>
        </div>
        {uploadResults.errorFile && (
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

  useEffect(() => {
    console.log(
      "Upload progress:",
      uploadProgress,
      "Is uploading:",
      isUploading
    );
  }, [uploadProgress, isUploading]);

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
          {!fileData ? (
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
              {(isUploading || loading) && renderProgress()}

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Show validation results after validation is complete */}
              {validationDetails &&
                !isUploading &&
                !loading &&
                !uploadResults && (
                  <>
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium">Validation Results</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>
                            Valid:{" "}
                            {validationDetails.total -
                              validationDetails.invalidCount}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span>Invalid: {validationDetails.invalidCount}</span>
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
                        disabled={loading || validationDetails.total === 0}
                        className="relative"
                      >
                        {loading && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        Import File
                      </Button>
                    </div>
                  </>
                )}

              {/* Show upload results after import is complete */}
              {uploadResults && !loading && renderUploadResults()}
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
