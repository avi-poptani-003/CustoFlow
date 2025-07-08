// src/components/leads/ImportLeadsDialog.jsx
import { useState, useEffect, useRef } from "react";
import { FileUp, Download, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext"; // Assuming this path is correct

export function ImportLeadsDialog({ isOpen, onClose, onImport }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [file, setFile] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false); // Renamed from isUploading for clarity
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [error, setError] = useState(null);
  const [fileReady, setFileReady] = useState(false); // New state to indicate file is "processed" and ready

  const intervalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setIsProcessingFile(false);
      setSimulatedProgress(0);
      setError(null);
      setFileReady(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setFileReady(false); // Reset file ready state

    if (!selectedFile) {
      setFile(null);
      setError(null);
      setSimulatedProgress(0);
      setIsProcessingFile(false);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSimulatedProgress(0);
    setIsProcessingFile(true); // Start "processing"

    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];
    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.match(/\.(csv|xlsx|xls)$/i)
    ) {
      setError(
        `Invalid file type: ${
          selectedFile.type || "unknown"
        }. Please upload a CSV or Excel file.`
      );
      setFile(null);
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Simulate file processing for UI feedback
    let currentProgress = 0;
    intervalRef.current = setInterval(() => {
      currentProgress += 20;
      setSimulatedProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsProcessingFile(false); // Done "processing"
        setFileReady(true); // File is now "ready"
      }
    }, 150);
  };

  const handleRemoveFile = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setFile(null);
    setSimulatedProgress(0);
    setIsProcessingFile(false);
    setError(null);
    setFileReady(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleActualImport = () => {
    if (!file || !fileReady) {
      setError("No file selected or file is not ready for import.");
      return;
    }
    onImport(file); // Pass the actual file object
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Name,Email,Phone,Company,Position,Status,Source,Interest,Priority,Budget,Timeline,Requirements,Notes,Tags\n" +
      "Example Lead,lead@example.com,1234567890,Example Corp,Manager,New,Website,Product A,High,10000,Q1,Needs X Y Z,Initial contact,prospect";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xl bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div
        className={`${
          isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        } rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col`}
      >
        <div
          className={`p-6 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Import Leads</h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${
                isDark
                  ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Close dialog"
            >
              <X size={24} />
            </button>
          </div>
          <p
            className={`${
              isDark ? "text-gray-400" : "text-gray-500"
            } text-sm mt-1`}
          >
            Upload a CSV or Excel file to import multiple leads.
          </p>
        </div>

        <div className="p-6 space-y-6 flex-grow overflow-y-auto">
          {error && (
            <div
              className={`border px-4 py-3 rounded-md relative text-sm ${
                isDark
                  ? "bg-red-900/30 border-red-700 text-red-300"
                  : "bg-red-100 border-red-400 text-red-700"
              }`}
              role="alert"
            >
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <strong className="font-bold">Error:</strong>
              </div>
              <p className="ml-7">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="file-upload"
                className={`block text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Upload File
              </label>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className={`text-xs px-2.5 py-1.5 border rounded-md flex items-center gap-1.5 transition-colors ${
                  isDark
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Download className="h-3.5 w-3.5" />
                Download Template
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDark
                  ? "border-gray-600 hover:border-gray-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              {!file ? (
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <FileUp
                      className={`h-10 w-10 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Drag and drop or{" "}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="font-semibold text-blue-500 hover:text-blue-400"
                      >
                        click to browse
                      </button>
                    </p>
                    <p
                      className={`text-xs ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      } mt-1`}
                    >
                      Supports CSV, XLSX, XLS files
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-left">
                    <FileUp className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium truncate ${
                          isDark ? "text-gray-200" : "text-gray-800"
                        }`}
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className={`text-xs p-1 rounded-full ${
                        isDark
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                          : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                      }`}
                      aria-label="Remove file"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {(isProcessingFile || simulatedProgress > 0) &&
                    !fileReady && (
                      <div className="space-y-1 pt-2">
                        <div
                          className={`w-full ${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                          } rounded-full h-2 overflow-hidden`}
                        >
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-linear"
                            style={{ width: `${simulatedProgress}%` }}
                          ></div>
                        </div>
                        <p
                          className={`text-xs text-center ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {simulatedProgress < 100
                            ? `Processing file... ${simulatedProgress}%`
                            : "Finalizing..."}
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          {fileReady && file && !isProcessingFile && (
            <div className="space-y-3 animate-fadeIn">
              <div
                className={`border px-4 py-3 rounded-md text-sm ${
                  isDark
                    ? "bg-green-900/30 border-green-700 text-green-300"
                    : "bg-green-100 border-green-400 text-green-700"
                }`}
              >
                <div className="flex items-center">
                  <CheckCircle2
                    className={`h-5 w-5 mr-2 ${
                      isDark ? "text-green-400" : "text-green-500"
                    }`}
                  />
                  <span className="font-semibold">File Ready:</span>
                  <span className="ml-1">
                    "{file.name}" is ready for import.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={`p-6 border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
          } flex justify-end gap-3`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${
              isDark
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleActualImport}
            disabled={!file || !fileReady || isProcessingFile}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white flex items-center gap-2 ${
              isDark
                ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"
                : "bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400"
            } ${
              !file || !fileReady || isProcessingFile
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            Import File
          </button>
        </div>
      </div>
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
