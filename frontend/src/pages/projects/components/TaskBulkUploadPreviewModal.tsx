import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
} from "ikon-react-components-lib";
import { DataTableLayout } from "ikon-react-components-lib";

interface Props {
  open: boolean;
  data: any[];
  onBack: () => void;
  onImport: () => void;
  isLoading?: boolean;
}

export default function TaskBulkUploadPreviewModal({
  open,
  data,
  onBack,
  onImport,
  isLoading,
}: Props) {
  const columns = useMemo(
    () => [
      { accessorKey: "epicName", header: "Epic" },
      { accessorKey: "sprintName", header: "Sprint" },
      { accessorKey: "title", header: "Title" },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "priority", header: "Priority" },
      { accessorKey: "estimatedHours", header: "Estimated Hours" },
      { accessorKey: "plannedDuration", header: "Planned Duration" },
    ],
    [],
  );

  return (
    <Dialog open={open} onOpenChange={onBack}>
      <DialogContent className="!w-[60vw] !max-w-[60vw] !h-auto max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Preview Parsed Data</DialogTitle>
          <p className="text-sm text-gray-400">{data.length} rows parsed</p>
        </DialogHeader>

        <div className="mt-4 overflow-auto max-h-[60vh]">
          <DataTableLayout
            data={data}
            columns={columns}
            keyExtractor={(row: any, index: number) => index}
            extraTools={{
              totalPages: 1,
              currentPage: 1,
              isLoading: false,
            }}
          />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="secondary" onClick={onBack}>
            Back
          </Button>

          <Button onClick={onImport} disabled={isLoading}>
            {isLoading ? "Importing..." : `Import ${data.length} Rows`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
