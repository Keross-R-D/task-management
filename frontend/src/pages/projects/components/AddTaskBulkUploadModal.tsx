import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
} from "ikon-react-components-lib";
import { useBulkUploadTasksMutation } from "@/features/tasks/bulkUploadTaskSlice";
import TaskBulkUploadPreviewModal from "./TaskBulkUploadPreviewModal";

interface Props {
  open: boolean;
  projectId: string;
  onClose: () => void;
}
interface CsvTask {
  epicName: string;
  epicDescription: string;
  epicStatus: string;
  epicStartDate: string;
  epicEndDate: string;

  sprintName: string;
  sprintGoal: string;
  sprintStatus: string;
  sprintStartDate: string;
  sprintEndDate: string;

  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;

  assigneeId: string | null;
  reporterId: string | null;

  estimatedHours: number;
  startDate: string;
  endDate: string;
  plannedDuration: number;

  projectId: string;
}

export default function AddTaskBulkUploadModal({
  open,
  projectId,
  onClose,
}: Props) {
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [parsedData, setParsedData] = useState<CsvTask[]>([]);

  const [bulkUploadTasks, { isLoading }] = useBulkUploadTasksMutation();

  const REQUIRED_FIELDS = [
    "epicName",
    "epicDescription",
    "epicStatus",
    "epicStartDate",
    "epicEndDate",

    "sprintName",
    "sprintGoal",
    "sprintStatus",
    "sprintStartDate",
    "sprintEndDate",

    "title",
    "description",
    "type",
    "status",
    "priority",

    "assigneeId",
    "reporterId",

    "estimatedHours",
    "startDate",
    "endDate",
    "plannedDuration",
  ];

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("Only CSV files are allowed");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);
      setError("");
    };

    reader.onerror = () => {
      setError("Failed to read file");
    };

    reader.readAsText(file);
  };

  const handleParse = () => {
    if (!csvText.trim()) {
      setError("CSV data is required");
      return;
    }

    try {
      const lines = csvText.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const missingFields = REQUIRED_FIELDS.filter(
        (field) => !headers.includes(field),
      );

      if (missingFields.length > 0) {
        setError(`Missing fields: ${missingFields.join(", ")}`);
        return;
      }

      const data: CsvTask[] = lines.slice(1).map((line, rowIndex) => {
        const values = line.split(",");

        if (values.length !== headers.length) {
          throw new Error(`Invalid column count at row ${rowIndex + 2}`);
        }

        const obj: Record<string, string | number> = {};

        headers.forEach((header, index) => {
          let value: string | number = values[index]?.trim();

          if (["estimatedHours", "plannedDuration"].includes(header)) {
            const num = parseFloat(value as string);
            if (isNaN(num)) {
              throw new Error(
                `${header} must be number at row ${rowIndex + 2}`,
              );
            }
            value = num;
          }

          obj[header] = value;
        });

        return {
          ...(obj as Omit<CsvTask, "projectId">),
          projectId,
        };
      });

      setParsedData(data);
      setPreviewOpen(true);
      setError("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid CSV format");
      }
    }
  };

  const handleImport = async () => {
    try {
      console.log(parsedData);
      await bulkUploadTasks(parsedData).unwrap();
      setPreviewOpen(false);
      handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Upload failed");
      }
    }
  };

  const handleClose = () => {
    setCsvText("");
    setError("");
    setParsedData([]);
    setPreviewOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="!w-[42vw] !max-w-[42vw] !h-auto max-h-[90vh] overflow-hidden">
          <DialogHeader className="my-3">
            <DialogTitle>Bulk Upload Tasks</DialogTitle>
            <p className="text-gray-400 text-sm">
              Upload CSV or paste data below
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* TEXTAREA */}
            <div>
              <label className="text-sm font-medium">
                CSV Data <span className="text-red-500">*</span>
              </label>

              <textarea
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  setError("");
                }}
                placeholder="epicName,epicDescription,epicStatus,epicStartDate,epicEndDate,sprintName,sprintGoal,sprintStatus,sprintStartDate,sprintEndDate,title,description,type,status,priority,assigneeId,reporterId,estimatedHours,startDate,endDate,plannedDuration"
                className="w-full min-h-[140px] max-h-[300px] border rounded-md p-2 text-xs font-mono overflow-x-auto overflow-y-hidden whitespace-nowrap resize-none"
              />

              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            {/* FILE */}
            <div>
              <label className="text-sm font-medium">Upload CSV File</label>

              <Input
                type="file"
                accept=".csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </div>

            {/* ACTION */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>

              <Button onClick={handleParse}>Parse & Preview</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PREVIEW MODAL */}
      <TaskBulkUploadPreviewModal
        open={previewOpen}
        data={parsedData}
        onBack={() => setPreviewOpen(false)}
        onImport={handleImport}
        isLoading={isLoading}
      />
    </>
  );
}
