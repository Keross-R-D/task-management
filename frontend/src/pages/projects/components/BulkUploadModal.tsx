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
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { Epic as EpicType } from "@/features/epics/epicsApiSlice";
import type { Sprint } from "@/features/sprints/sprintsApiSlice";
import { useUserMap } from "@/utils/userMap";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface Props {
  open: boolean;
  epics: EpicType[];
  sprints: Sprint[];
  projectId: string;
  onClose: () => void;
}

export default function BulkUploadModal({
  open,
  epics,
  sprints,
  projectId,
  onClose,
}: Props) {
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const { allUsers } = useUserMap();

  const [bulkUploadTasks, { isLoading }] = useBulkUploadTasksMutation();

const downloadTemplate = async () => {
  const wb = new ExcelJS.Workbook();

  wb.creator = "TaskFlow Pro";
  wb.lastModifiedBy = "Task Manager";
  wb.created = new Date();
  wb.modified = new Date();

  const DATA_ROWS = 200;
  const FIRST_DATA_ROW = 2;
  const LAST_DATA_ROW = FIRST_DATA_ROW + DATA_ROWS - 1;
  const FREEZE_FROM_ROW = LAST_DATA_ROW + 1;

  const sheet = wb.addWorksheet("Tasks");

  sheet.columns = [
    { header: "Epic Name", width: 25 },
    { header: "Epic Start Date", width: 20 },
    { header: "Epic End Date", width: 20 },
    { header: "Sprint Name", width: 30 },
    { header: "Sprint Goal", width: 30 },
    { header: "Sprint Status", width: 20 },
    { header: "Sprint Start Date", width: 20 },
    { header: "Sprint End Date", width: 20 },
    { header: "Task Title", width: 30 },
    { header: "Task Description", width: 30 },
    { header: "Task Type", width: 15 },
    { header: "Task Status", width: 20 },
    { header: "Task Priority", width: 15 },
    { header: "Task Assignee", width: 20 },
    { header: "Task Estimated Hours", width: 18 },
    { header: "Task Start Date", width: 20 },
    { header: "Task End Date", width: 20 },
    { header: "Task Planned Duration", width: 20 },
    { header: "Helper", width: 20 },
  ];

  // Header styling - base font and alignment
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  headerRow.height = 28;

  // Epic header cells (A-C) - dark orange
  ["A", "B", "C"].forEach((col) => {
    sheet.getCell(`${col}1`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2C5563" } };
  });

  // Sprint header cells (D-H) - dark teal
  ["D", "E", "F", "G", "H"].forEach((col) => {
    sheet.getCell(`${col}1`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2E7994" } };
  });

  // Task header cells (I-R) - dark purple
  ["I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"].forEach((col) => {
    sheet.getCell(`${col}1`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF298EB3" } };
  });

  // Helper header (S) - keep neutral dark
  sheet.getCell(`S1`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF444444" } };

  // Add border to header
  for (let i = 1; i <= 19; i++) {
    const cell = headerRow.getCell(i);
    cell.border = {
      top: { style: "thin", color: { argb: "FFB4C6E7" } },
      bottom: { style: "medium", color: { argb: "FF1E3E5F" } },
      left: { style: "thin", color: { argb: "FFB4C6E7" } },
      right: { style: "thin", color: { argb: "FFB4C6E7" } },
    };
  }

  // Date column formatting
  ["B", "C", "G", "H", "P", "Q"].forEach((col) => {
    sheet.getColumn(col).numFmt = "yyyy-mm-dd";
  });

  for (let i = FIRST_DATA_ROW; i <= LAST_DATA_ROW; i++) {
    for (let col = 1; col <= 19; col++) {
      sheet.getCell(`${String.fromCharCode(64 + col)}${i}`).alignment = {
        horizontal: "left",
        vertical: "middle",
      };
    }
  }

  sheet.getColumn("S").hidden = true;

  // META SHEET
  const meta = wb.addWorksheet("Meta");
  meta.columns = [
    { header: "SprintName", width: 25 },
    { header: "EpicName", width: 25 },
    { header: "Goal", width: 30 },
    { header: "Status", width: 20 },
    { header: "SprintStart", width: 20 },
    { header: "SprintEnd", width: 20 },
  ];
  const metaHeader = meta.getRow(1);
  metaHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  metaHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4A7C59" } };
  ["E", "F"].forEach((col) => { meta.getColumn(col).numFmt = "yyyy-mm-dd"; });
  meta.state = "hidden";

  // EPIC META SHEET
  const epicMeta = wb.addWorksheet("EpicMeta");
  epicMeta.columns = [
    { header: "EpicName", width: 25 },
    { header: "EpicStart", width: 20 },
    { header: "EpicEnd", width: 20 },
  ];
  const epicMetaHeader = epicMeta.getRow(1);
  epicMetaHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  epicMetaHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF8B5A2B" } };
  ["B", "C"].forEach((col) => { epicMeta.getColumn(col).numFmt = "yyyy-mm-dd"; });
  epicMeta.state = "hidden";

  // SPRINT LOOKUP SHEET
  const sprintLookup = wb.addWorksheet("SprintLookup");
  sprintLookup.columns = [
    { header: "EpicName", width: 25 },
    { header: "SprintName", width: 30 },
    { header: "SprintGoal", width: 30 },
    { header: "SprintStatus", width: 20 },
    { header: "SprintStart", width: 20 },
    { header: "SprintEnd", width: 20 },
  ];
  const sprintLookupHeader = sprintLookup.getRow(1);
  sprintLookupHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  sprintLookupHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3A6EA5" } };
  sprintLookup.state = "hidden";

  const epicMap = new Map();
  epics.forEach((epic) => epicMap.set(epic.id, epic));

  // Sort sprints by epic name to ensure proper grouping
  const sortedSprints = [...sprints].sort((a, b) => {
    const epicA = epicMap.get(a.epicId)?.name || "";
    const epicB = epicMap.get(b.epicId)?.name || "";
    return epicA.localeCompare(epicB);
  });

  let rowIndex = 2;
  sortedSprints.forEach((sprint) => {
    const epic = epicMap.get(sprint.epicId);
    console.log("Adding sprint to lookup:", sprint.name, "under epic:", epic?.name);
    sprintLookup.getCell(`A${rowIndex}`).value = epic?.name || "";
    sprintLookup.getCell(`B${rowIndex}`).value = sprint.name || "";
    sprintLookup.getCell(`C${rowIndex}`).value = sprint.goal || "";
    sprintLookup.getCell(`D${rowIndex}`).value = sprint.status || "";
    sprintLookup.getCell(`E${rowIndex}`).value = sprint.startDate ? new Date(sprint.startDate) : "";
    sprintLookup.getCell(`F${rowIndex}`).value = sprint.endDate ? new Date(sprint.endDate) : "";
    rowIndex++;
  });

  // USER LOOKUP SHEET
  const userLookup = wb.addWorksheet("UserLookup");
  userLookup.columns = [
    { header: "UserName", width: 30 },
    { header: "UserId", width: 40 },
  ];
  const userLookupHeader = userLookup.getRow(1);
  userLookupHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  userLookupHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF5D6D7E" } };
  if (allUsers && allUsers.length > 0) {
    allUsers.forEach((user, idx) => {
      userLookup.getCell(`A${idx + 2}`).value = user.name || "";
      userLookup.getCell(`B${idx + 2}`).value = user.id || "";
    });
  }
  userLookup.state = "hidden";

  // POPULATE META DATA with sorted sprints
  sortedSprints.forEach((sprint) => {
    const epic = epicMap.get(sprint.epicId);
    meta.addRow([
      sprint.name || "",
      epic?.name || "",
      sprint.goal || "",
      sprint.status || "",
      sprint.startDate ? new Date(sprint.startDate) : "",
      sprint.endDate ? new Date(sprint.endDate) : "",
    ]);
  });
  for (let i = 2; i <= meta.rowCount; i++) {
    const row = meta.getRow(i);
    if (i % 2 === 0) {
      row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF0F8FF" } };
    }
  }

  // POPULATE EPIC META DATA
  epics.forEach((epic) => {
    epicMeta.addRow([
      epic.name || "",
      epic.startDate ? new Date(epic.startDate) : "",
      epic.endDate ? new Date(epic.endDate) : "",
    ]);
  });
  for (let i = 2; i <= epicMeta.rowCount; i++) {
    const row = epicMeta.getRow(i);
    if (i % 2 === 0) {
      row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF4E6" } };
    }
  }

  // LISTS SHEET FOR EPIC DROPDOWN
  const listsSheet = wb.addWorksheet("Lists");
  listsSheet.columns = [{ header: "Available Epics", width: 30 }];
  const listsHeader = listsSheet.getRow(1);
  listsHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  listsHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF9370DB" } };
  epics.forEach((epic, idx) => {
    listsSheet.getCell(`A${idx + 2}`).value = epic.name || "";
  });
  listsSheet.state = "hidden";

  const uniqueEpics: string[] = [];
  epics.forEach((epic) => {
    if (epic.name && !uniqueEpics.includes(epic.name)) uniqueEpics.push(epic.name);
  });

  const assigneeCount = allUsers?.length || 0;
  const assigneeFormula =
    assigneeCount > 0
      ? `UserLookup!$A$2:$A$${assigneeCount + 1}`
      : '"No Users Available"';

  // APPLY VALIDATIONS, FORMULAS & STYLING PER ROW
  for (let i = FIRST_DATA_ROW; i <= LAST_DATA_ROW; i++) {
    const dataRow = sheet.getRow(i);
    dataRow.height = 22;

   const isEven = i % 2 === 0;

   // ── EPIC GROUP colors (A=dropdown deep, B/C=light) ──
   sheet.getCell(`A${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: "FF567782" },
   };
   sheet.getCell(`B${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: isEven ? "FFF2F2F2" : "FFFFFFFF" },
   };
   sheet.getCell(`C${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: isEven ? "FFF2F2F2" : "FFFFFFFF" },
   };

   // ── SPRINT GROUP colors (D/F=dropdown deep, E/G/H=light) ──
   sheet.getCell(`D${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: "B3298EB3" },
   };
   sheet.getCell(`E${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: isEven ? "FFF2F2F2" : "FFFFFFFF" },
   };
   sheet.getCell(`F${i}`).fill = {
     type: "pattern",
     pattern: "solid",
    fgColor: { argb: "B3298EB3" },
   };
   sheet.getCell(`G${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: isEven ? "FFF2F2F2" : "FFFFFFFF" },
   };
   sheet.getCell(`H${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: isEven ? "FFF2F2F2" : "FFFFFFFF" },
   };

   // ── TASK GROUP colors (K/L/M/N=dropdown deep, rest=light) ──
   sheet.getCell(`I${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: isEven ? "FFF2F2F2" : "FFFFFFFF" },
   };
   sheet.getCell(`J${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: isEven ? "FFF2F2F2" : "FFFFFFFF" },
   };
   sheet.getCell(`K${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: "FF6BB8D9" },
   };
   sheet.getCell(`L${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: "FF6BB8D9" },
   };
   sheet.getCell(`M${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: "FF6BB8D9" },
   };
   sheet.getCell(`N${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: "FF6BB8D9" },
   };
   sheet.getCell(`O${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: isEven ? "FFF2F2F2" : "FFFFFFFF" },
   };
   sheet.getCell(`P${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: isEven ? "FFF2F2F2" : "FFFFFFFF" },
   };
   sheet.getCell(`Q${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: isEven ? "FFF2F2F2" : "FFFFFFFF" },
   };
   sheet.getCell(`R${i}`).fill = {
     type: "pattern",
     pattern: "solid",
     fgColor: { argb: isEven ? "FFF2F2F2" : "FFFFFFFF" },
   };
   // ── Epic dropdown ──
   sheet.getCell(`A${i}`).dataValidation = {
     type: "list",
     allowBlank: true,
     showInputMessage: true,
     showErrorMessage: true,
     errorTitle: "Invalid Epic",
     error: "Please select a valid epic from the dropdown list",
     formulae: [`Lists!$A$2:$A$${uniqueEpics.length + 1}`],
   };

    // ── Auto-populated: Epic dates ──
    sheet.getCell(`B${i}`).value = { formula: `IFERROR(VLOOKUP(A${i},EpicMeta!A:C,2,FALSE),"")` };
    sheet.getCell(`C${i}`).value = { formula: `IFERROR(VLOOKUP(A${i},EpicMeta!A:C,3,FALSE),"")` };

    // ── Sprint dropdown ──
    const sprintDropdownFormula = `OFFSET(SprintLookup!$B$1, MATCH(A${i}, SprintLookup!$A:$A, 0)-1, 0, COUNTIF(SprintLookup!$A:$A, A${i}), 1)`;
    sheet.getCell(`D${i}`).dataValidation = {
      type: "list",
      allowBlank: true,
      showInputMessage: true,
      formulae: [sprintDropdownFormula],
    };

    // ── Auto-populated: Sprint goal ──
    sheet.getCell(`E${i}`).value = { formula: `IFERROR(VLOOKUP(D${i}, SprintLookup!B:C, 2, FALSE), "")` };

    // ── Auto-populated: Sprint status (also has dropdown) ──
    sheet.getCell(`F${i}`).value = { formula: `IFERROR(VLOOKUP(D${i}, SprintLookup!B:D, 3, FALSE), "")` };
    sheet.getCell(`F${i}`).dataValidation = {
      type: "list",
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "Invalid Sprint Status",
      error: "Please select a valid sprint status: PLANNED, ACTIVE, COMPLETED, or CANCELLED",
      formulae: ['"PLANNED,ACTIVE,COMPLETED,CANCELLED"'],
    };

    // ── Auto-populated: Sprint dates ──
    sheet.getCell(`G${i}`).value = { formula: `IFERROR(VLOOKUP(D${i}, SprintLookup!B:E, 4, FALSE), "")` };
    sheet.getCell(`H${i}`).value = { formula: `IFERROR(VLOOKUP(D${i}, SprintLookup!B:F, 5, FALSE), "")` };

    // ── Helper / validation status ──
    sheet.getCell(`S${i}`).value = {
      formula: `IF(OR(A${i}="",D${i}=""),"",IF(COUNTIFS(SprintLookup!A:A,A${i},SprintLookup!B:B,D${i})>0,"VALID",IF(COUNTIF(SprintLookup!A:A,A${i})=0,"MANUAL","MANUAL_SPRINT")))`,
    };

    // ── Type dropdown ──
    sheet.getCell(`K${i}`).dataValidation = {
      type: "list", allowBlank: true, showErrorMessage: true,
      errorTitle: "Invalid Task Type",
      error: "Please select: TASK, BUG, or STORY",
      formulae: ['"TASK,BUG,STORY"'],
    };

    // ── Status dropdown ──
    sheet.getCell(`L${i}`).dataValidation = {
      type: "list", allowBlank: true, showErrorMessage: true,
      errorTitle: "Invalid Task Status",
      error: "Please select: TO_DO, IN_PROGRESS, DONE, or BLOCKED",
      formulae: ['"TO_DO,IN_PROGRESS,DONE,BLOCKED"'],
    };

    // ── Priority dropdown ──
    sheet.getCell(`M${i}`).dataValidation = {
      type: "list", allowBlank: true, showErrorMessage: true,
      errorTitle: "Invalid Priority",
      error: "Please select: LOW, MEDIUM, HIGH, or CRITICAL",
      formulae: ['"LOW,MEDIUM,HIGH,CRITICAL"'],
    };

    // ── Assignee dropdown ──
    sheet.getCell(`N${i}`).dataValidation = {
      type: "list", allowBlank: true, showInputMessage: true, showErrorMessage: true,
      errorTitle: "Invalid Assignee",
      error: `Please select a valid assignee (${assigneeCount} users available)`,
      formulae: [assigneeFormula],
    };

    // ── Numeric validations ──
    sheet.getCell(`O${i}`).dataValidation = {
      type: "decimal", allowBlank: true, showErrorMessage: true,
      errorTitle: "Invalid Estimated Hours",
      error: "Must be a number. Example: 5, 2.5, 8.75",
      formulae: ["0"],
    };
    sheet.getCell(`R${i}`).dataValidation = {
      type: "decimal", allowBlank: true, showErrorMessage: true,
      errorTitle: "Invalid Planned Duration",
      error: "Must be a number. Example: 3, 1.5, 10.25",
      formulae: ["0"],
    };

    // ── Date validations ──
    sheet.getCell(`B${i}`).dataValidation = {
      type: "custom", allowBlank: true, showInputMessage: true,
      promptTitle: "Epic Start Date",
      prompt: "Enter date as YYYY-MM-DD.\nThis field is auto-populated from the epic.",
      showErrorMessage: true,
      errorTitle: "Invalid Date",
      error: "Please enter a valid date. Text is not allowed.",
      formulae: [`=IF(ISBLANK(B${i}), TRUE, ISNUMBER(B${i}))`],
    };

    sheet.getCell(`C${i}`).dataValidation = {
      type: "custom", allowBlank: true, showInputMessage: true,
      promptTitle: "Epic End Date",
      prompt: "Enter date as YYYY-MM-DD.\nThis field is auto-populated from the epic.",
      showErrorMessage: true,
      errorTitle: "Invalid Date",
      error: "Please enter a valid date. Text is not allowed.",
      formulae: [`=IF(ISBLANK(C${i}), TRUE, ISNUMBER(C${i}))`],
    };

    sheet.getCell(`G${i}`).dataValidation = {
      type: "custom", allowBlank: true, showInputMessage: true,
      promptTitle: "Sprint Start Date",
      prompt: "Enter date as YYYY-MM-DD.\nMust be within epic start and end dates.",
      showErrorMessage: true,
      errorTitle: "Invalid Sprint Start Date",
      error: "Sprint start date must be within epic start and end dates.",
      formulae: [
        `=IF(ISBLANK(G${i}), TRUE,
           IF(AND(ISNUMBER(G${i}), ISNUMBER(B${i}), ISNUMBER(C${i})),
              AND(G${i}>=B${i}, G${i}<=C${i}),
              FALSE))`,
      ],
    };

    sheet.getCell(`H${i}`).dataValidation = {
      type: "custom", allowBlank: true, showInputMessage: true,
      promptTitle: "Sprint End Date",
      prompt: "Enter date as YYYY-MM-DD.\nMust be within epic range and after sprint start date.",
      showErrorMessage: true,
      errorTitle: "Invalid Sprint End Date",
      error: "Sprint end date must be within epic range and after sprint start date.",
      formulae: [
        `=IF(ISBLANK(H${i}), TRUE,
           IF(AND(ISNUMBER(H${i}), ISNUMBER(B${i}), ISNUMBER(C${i})),
              AND(H${i}>=B${i}, H${i}<=C${i},
                  IF(ISNUMBER(G${i}), H${i}>=G${i}, TRUE)),
              FALSE))`,
      ],
    };

    sheet.getCell(`P${i}`).dataValidation = {
      type: "custom", allowBlank: true, showInputMessage: true,
      promptTitle: "Task Start Date",
      prompt: "Enter date as YYYY-MM-DD.\nMust be within sprint start and end dates.",
      showErrorMessage: true,
      errorTitle: "Invalid Task Start Date",
      error: "Task start date must be within sprint range.",
      formulae: [
        `=IF(ISBLANK(P${i}), TRUE,
           IF(AND(ISNUMBER(P${i}), ISNUMBER(G${i}), ISNUMBER(H${i})),
              AND(P${i}>=G${i}, P${i}<=H${i}),
              FALSE))`,
      ],
    };

    sheet.getCell(`Q${i}`).dataValidation = {
      type: "custom", allowBlank: true, showInputMessage: true,
      promptTitle: "Task End Date",
      prompt: "Enter date as YYYY-MM-DD.\nMust be within sprint range and after task start date.",
      showErrorMessage: true,
      errorTitle: "Invalid Task End Date",
      error: "Task end date must be within sprint range and after task start date.",
      formulae: [
        `=IF(ISBLANK(Q${i}), TRUE,
           IF(AND(ISNUMBER(Q${i}), ISNUMBER(G${i}), ISNUMBER(H${i})),
              AND(Q${i}>=G${i}, Q${i}<=H${i},
                  IF(ISNUMBER(P${i}), Q${i}>=P${i}, TRUE)),
              FALSE))`,
      ],
    };

    // ── Cell protection ──
    ["B", "C", "E", "S"].forEach((col) => {
      sheet.getCell(`${col}${i}`).protection = { locked: true };
    });
    ["A", "D", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R"].forEach((col) => {
      sheet.getCell(`${col}${i}`).protection = { locked: false };
    });

    // ── Subtle borders on all data cells ──
    for (let col = 1; col <= 19; col++) {
      const cell = sheet.getCell(`${String.fromCharCode(64 + col)}${i}`);
      cell.border = {
        top: { style: "thin", color: { argb: "FFE0E0E0" } },
        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
        left: { style: "thin", color: { argb: "FFE0E0E0" } },
        right: { style: "thin", color: { argb: "FFE0E0E0" } },
      };
    }
  }

  // FREEZE & DISABLE ROWS 202+
  const disabledFill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE8EDF2" } };
  const disabledFont = { color: { argb: "FF8A99AA" }, italic: true, size: 10 };

  for (let r = FREEZE_FROM_ROW; r <= FREEZE_FROM_ROW + 98; r++) {
    const row = sheet.getRow(r);
    row.height = 20;
    for (let c = 1; c <= 19; c++) {
      const cell = row.getCell(c);
      cell.fill = disabledFill;
      cell.font = disabledFont;
      cell.protection = { locked: true };
    }
    if (r === FREEZE_FROM_ROW) {
      sheet.getCell(`A${r}`).value = "Data entry is limited to rows 2–200";
      sheet.getCell(`A${r}`).font = { bold: true, color: { argb: "FFC0392B" }, italic: false, size: 11 };
      const infoCell = sheet.getCell(`A${r}`);
      infoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF3E0" } };
    }
  }

  // Freeze top header row
  sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  // CONDITIONAL FORMATTING
  sheet.addConditionalFormatting({
    ref: `D2:D${LAST_DATA_ROW}`,
    rules: [
      {
        type: "expression",
        priority: 1,
        formulae: [`=AND($S2="INVALID",$S2<>"MANUAL",$S2<>"MANUAL_SPRINT",NOT(ISBLANK(D2)))`],
        style: {
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } },
          font: { color: { argb: "FF000000" } },
        },
      },
    ],
  });

  sheet.addConditionalFormatting({
    ref: `D2:D${LAST_DATA_ROW}`,
    rules: [
      {
        type: "expression",
        priority: 2,
        formulae: [`=AND($S2="MANUAL_SPRINT",NOT(ISBLANK(D2)))`],
        style: {
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6F3FF" } },
            font: { color: { argb: "FF000000" } },
        },
      },
    ],
  });

  // Highlight date validation errors
  sheet.addConditionalFormatting({
    ref: `G2:H${LAST_DATA_ROW}`,
    rules: [
      {
        type: "expression",
        priority: 3,
        formulae: [
          `=OR(AND(ISNUMBER($G2),ISNUMBER($B2),ISNUMBER($C2),OR($G2<$B2,$G2>$C2)),AND(ISNUMBER($H2),ISNUMBER($B2),ISNUMBER($C2),OR($H2<$B2,$H2>$C2)),AND(ISNUMBER($G2),ISNUMBER($H2),$H2<$G2))`,
        ],
        style: {
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFC7CE" } },
          font: { color: { argb: "FF9C0006" } },
        },
      },
    ],
  });

  sheet.addConditionalFormatting({
    ref: `P2:Q${LAST_DATA_ROW}`,
    rules: [
      {
        type: "expression",
        priority: 4,
        formulae: [
          `=OR(AND(ISNUMBER($P2),ISNUMBER($G2),ISNUMBER($H2),OR($P2<$G2,$P2>$H2)),AND(ISNUMBER($Q2),ISNUMBER($G2),ISNUMBER($H2),OR($Q2<$G2,$Q2>$H2)),AND(ISNUMBER($P2),ISNUMBER($Q2),$Q2<$P2))`,
        ],
        style: {
          fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFC7CE" } },
          font: { color: { argb: "FF9C0006" } },
        },
      },
    ],
  });

  // HEADER NOTES (updated with manual sprint info)
  const headers = [
    "Select epic from dropdown - Invalid entries will show popup error",
    "Auto-populated from EpicMeta",
    "Auto-populated from EpicMeta",
    "Select sprint from dropdown (existing sprints) OR type a new sprint name manually.\n\nFor existing sprints: Goal, Status, and dates auto-populate.\nFor new sprints: Manually enter Goal, Status, and dates below.\n\nTip: New sprint names will be highlighted with blue background.",
    "Sprint Goal\n\nAuto-populated for existing sprints selected from dropdown.\nFor manually entered new sprints: Enter the sprint goal here.",
    "Sprint Status\n\nOptions: PLANNED, ACTIVE, COMPLETED, CANCELLED\n\nFor existing sprints: Auto-populated (can be overridden)\nFor new sprints: Select from dropdown",
    "Sprint Start date (YYYY-MM-DD)\nAuto-populated for existing sprints (can be edited manually)\nMust be within epic range",
    "Sprint End date (YYYY-MM-DD)\nAuto-populated for existing sprints (can be edited manually)\nMust be within epic range and after start date",
    "Task title (optional - leave empty if you only want to create sprint. If provided, Task Type, Task Status, and Task Priority are required)",
    "Task description - optional details",
    "Select Task Type: TASK, BUG, STORY (Required if Task Title is provided)",
    "Select Task Status: TO_DO, IN_PROGRESS, DONE, BLOCKED (Required if Task Title is provided)",
    "Select Task Priority: LOW, MEDIUM, HIGH, CRITICAL (Required if Task Title is provided)",
    `Select Task Assignee from dropdown (${assigneeCount} users available) (Dropdown - Deep purple background)`,
    "Task Estimated hours - Must be a number (integer or decimal). Example: 5, 2.5, 8.75",
    "Task Start date (YYYY-MM-DD) - Must be within sprint range",
    "Task End date (YYYY-MM-DD) - Must be within sprint range",
    "Task Planned duration - Must be a number. Example: 3, 1.5, 10.25",
  ];

  for (let i = 0; i < headers.length; i++) {
    sheet.getCell(`${String.fromCharCode(65 + i)}1`).note = {
      texts: [{ text: headers[i] }],
    };
  }

  const buffer = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "TaskFlow_Pro_Template.xlsx");
};

  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith(".xlsx")) {
      setError("Only Excel (.xlsx) files allowed");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, {
          type: "array",
          cellDates: false,
        });

        const sheet = wb.Sheets[wb.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          raw: true,
        });

        const formatExcelDate = (value: any) => {
          if (!value) return "";
          if (typeof value === "number") {
            const date = XLSX.SSF.parse_date_code(value);
            if (date) {
              const year = date.y;
              const month = String(date.m).padStart(2, "0");
              const day = String(date.d).padStart(2, "0");
              return `${year}-${month}-${day}`;
            }
          }
          if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
          }
          return "";
        };

        // Helper function to get value by possible column names (with or without emojis)
     const getColumnValue = (row: any, possibleNames: string[]) => {
        for (const name of possibleNames) {
          // Check for exact match
          if (row[name] !== undefined && row[name] !== null && row[name] !== "") {
            return row[name];
          }
          // Check for case-insensitive match
          for (const key in row) {
            if (key.toLowerCase() === name.toLowerCase() || 
                key.replace(/[^a-zA-Z]/g, '').toLowerCase() === name.toLowerCase()) {
              return row[key];
            }
          }
        }
        return "";
      };

        const filteredData = jsonData.filter((row) => {
          return Object.values(row).some(
            (value) =>
              value !== null &&
              value !== undefined &&
              String(value).trim() !== ""
          );
        });

         const cleanedData = filteredData.map((row) => ({
        epicName: getColumnValue(row, ["epicName", "Epic Name", "EpicName"]),
        sprintName: getColumnValue(row, ["sprintName", "Sprint Name", "SprintName"]),
        sprintGoal: getColumnValue(row, ["sprintGoal", "Sprint Goal", "SprintGoal"]),
        sprintStatus: getColumnValue(row, ["sprintStatus", "Sprint Status", "SprintStatus"]),
        sprintStartDate: formatExcelDate(
          getColumnValue(row, ["sprintStartDate", "Sprint Start Date", "SprintStartDate"])
        ),
        sprintEndDate: formatExcelDate(
          getColumnValue(row, ["sprintEndDate", "Sprint End Date", "SprintEndDate"])
        ),
        title: getColumnValue(row, ["title", "Title", "Task Title", "TaskTitle", "Task Name", "TaskName"]),
        description: getColumnValue(row, ["description", "Description", "Task Description", "TaskDescription"]),
        type: getColumnValue(row, ["type", "Type", "Task Type", "TaskType"]),
        status: getColumnValue(row, ["status", "Status", "Task Status", "TaskStatus"]),
        priority: getColumnValue(row, ["priority", "Priority", "Task Priority", "TaskPriority"]),
        assignee: getColumnValue(row, ["assignee", "Assignee", "Task Assignee", "TaskAssignee"]),
        estimatedHours: getColumnValue(row, ["estimatedHours", "Estimated Hours", "EstimatedHours", "Task Estimated Hours", "TaskEstimatedHours"]),
        startDate: formatExcelDate(
          getColumnValue(row, ["startDate", "Start Date", "StartDate", "Task Start Date", "TaskStartDate"])
        ),
        endDate: formatExcelDate(
          getColumnValue(row, ["endDate", "End Date", "EndDate", "Task End Date", "TaskEndDate"])
        ),
        plannedDuration: getColumnValue(row, ["plannedDuration", "Planned Duration", "PlannedDuration", "Task Planned Duration", "TaskPlannedDuration"]),
      }));

        // Keep ALL rows including those without titles (for sprint-only creation)
        const validRows = cleanedData.filter((row) => {
          // At minimum, we need either a title OR sprint information
          const hasTaskInfo = row.title && row.title.trim() !== "";
          const hasSprintInfo = row.sprintName && row.sprintName.trim() !== "";
          return hasTaskInfo || hasSprintInfo;
        });
        
        if (validRows.length === 0) {
          setError("No valid data found. Please ensure each row has either a task title or sprint name.");
          return;
        }

        const tempSheet = XLSX.utils.json_to_sheet(validRows);
        const csv = XLSX.utils.sheet_to_csv(tempSheet);
        setCsvText(csv);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Invalid Excel file");
      }
    };

    reader.readAsArrayBuffer(file);
  };

const handleParse = () => {
    if (!csvText.trim()) {
      setError("Data required");
      return;
    }

    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());

    const data = lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = values[i]?.trim();
      });
      return {
        ...obj,
        projectId,
      };
    });

    const duplicateIndices = new Set<number>();
    const duplicateRowNumbers: number[] = [];

    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        const isDuplicate =
          data[i].epicName === data[j].epicName &&
          data[i].sprintName === data[j].sprintName &&
          data[i].sprintGoal === data[j].sprintGoal &&
          data[i].sprintStatus === data[j].sprintStatus &&
          data[i].sprintStartDate === data[j].sprintStartDate &&
          data[i].sprintEndDate === data[j].sprintEndDate &&
          data[i].title === data[j].title &&
          data[i].description === data[j].description &&
          data[i].type === data[j].type &&
          data[i].status === data[j].status &&
          data[i].priority === data[j].priority &&
          data[i].assignee === data[j].assignee &&
          data[i].estimatedHours === data[j].estimatedHours &&
          data[i].startDate === data[j].startDate &&
          data[i].endDate === data[j].endDate &&
          data[i].plannedDuration === data[j].plannedDuration;

        if (isDuplicate) {
          if (!duplicateIndices.has(j)) {
            duplicateRowNumbers.push(j + 1);
          }
          duplicateIndices.add(j);
        }
      }
    }

    const availableEpicNames = epics.map((e) => e.name?.trim());
    const epicNameToIdMap = new Map();
    epics.forEach((epic) => {
      if (epic.name && epic.id) {
        epicNameToIdMap.set(epic.name.trim(), epic.id);
      }
    });

 const sprintMap = new Map();

sprints.forEach((sprint) => {
  sprintMap.set(
    sprint.name?.trim(),
    {
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      epicId: sprint.epicId,
      epicName: epics.find((e) => e.id === sprint.epicId)?.name?.trim(),
    }
  );
});

    const epicDateMap = new Map();
    epics.forEach((epic) => {
      epicDateMap.set(epic.name, {
        startDate: epic.startDate,
        endDate: epic.endDate,
      });
    });

    const availableUserNames = allUsers?.map((user: { name: string; id: string }) => user.name?.trim()) || [];
    const userNameToIdMap = new Map();
    if (allUsers && allUsers.length > 0) {
      allUsers.forEach((user: { name: string; id: string }) => {
        if (user.name && user.id) {
          userNameToIdMap.set(user.name.trim(), user.id);
        }
      });
    }

    const rowErrors: Map<number, string[]> = new Map();

    // Check if any data exists
    if (data.length === 0) {
      rowErrors.set(0, ["No data found to parse"]);
    }

    if (duplicateRowNumbers.length > 0) {
      const rowNumbersStr = duplicateRowNumbers.join(", ");
      rowErrors.set(0, [`Duplicate tasks found at row(s): ${rowNumbersStr}. Please remove them.`]);
    }

    const formatDate = (date: string | undefined) => {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      return d;
    };

    data.forEach((row, index) => {
      const rowNumber = index + 1;
      const hasTaskData = row.title && row.title.trim() !== "" || row.description && row.description.trim() !== "" || row.type && row.type.trim() !== "" || row.status && row.status.trim() !== "" || row.priority && row.priority.trim() !== "" || row.assignee && row.assignee.trim() !== "" || row.estimatedHours && row.estimatedHours.toString().trim() !== "" || row.startDate && row.startDate.toString().trim() !== "" || row.endDate && row.endDate.toString().trim() !== "" || row.plannedDuration && row.plannedDuration.toString().trim() !== "";
      const hasSprintData = row.sprintName && row.sprintName.trim() !== "";
      const errorsForRow: string[] = [];

      if (duplicateIndices.has(index)) {
        return;
      }

      // Skip validation for rows that have only sprint data (no task)
      if (!hasTaskData && hasSprintData) {
        // Only validate sprint-related fields for sprint-only rows
        const epicName = row.epicName;
        if (epicName && !availableEpicNames.includes(epicName)) {
          errorsForRow.push(`Epic "${epicName}" does not exist`);
        }

        const epicData = epicDateMap.get(epicName);
        const epicStart = formatDate(epicData?.startDate);
        const epicEnd = formatDate(epicData?.endDate);
        const sprintStart = formatDate(row.sprintStartDate);
        const sprintEnd = formatDate(row.sprintEndDate);

        if (sprintStart && epicStart && sprintStart < epicStart) {
          errorsForRow.push(`Sprint start date must be inside epic range`);
        }

        if (sprintEnd && epicEnd && sprintEnd > epicEnd) {
          errorsForRow.push(`Sprint end date must be inside epic range`);
        }

        if (sprintStart && sprintEnd && sprintEnd < sprintStart) {
          errorsForRow.push(`Sprint end date cannot be before sprint start date`);
        }

        if (row.sprintName && sprintMap.has(row.sprintName)) {
          const sprintInfo = sprintMap.get(row.sprintName);
          if (epicName && sprintInfo?.epicName !== epicName) {
            errorsForRow.push(`Sprint "${row.sprintName}" does not belong to epic "${epicName}"`);
          }
        }

        const validSprintStatuses = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"];
        if (row.sprintStatus && !validSprintStatuses.includes(row.sprintStatus)) {
          errorsForRow.push(`Invalid sprint status "${row.sprintStatus}"`);
        }

        if (errorsForRow.length > 0) {
          rowErrors.set(rowNumber, errorsForRow);
        }
        return; // Skip task validation for sprint-only rows
      }

      // For rows with task data, perform full validation
      if (hasTaskData) {
        // Collect missing required fields
        const missingFields: string[] = [];
        
        if (!row.title || row.title.trim() === "") {
          missingFields.push("Title");
        }
        if (!row.type || row.type.trim() === "") {
          missingFields.push("Type");
        }
        if (!row.status || row.status.trim() === "") {
          missingFields.push("Status");
        }
        if (!row.priority || row.priority.trim() === "") {
          missingFields.push("Priority");
        }
        if (!row.description || row.description.trim() === "") {
          missingFields.push("Description");
        }
        if (!row.assignee || row.assignee.trim() === "") {
          missingFields.push("Assignee");
        }
        if (!row.estimatedHours || row.estimatedHours.toString().trim() === "") {
          missingFields.push("Estimated Hours");
        }
        if (!row.startDate || row.startDate.toString().trim() === "") {
          missingFields.push("Start Date");
        }
        if (!row.endDate || row.endDate.toString().trim() === "") {
          missingFields.push("End Date");
        }
        if (!row.plannedDuration || row.plannedDuration.toString().trim() === "") {
          missingFields.push("Planned Duration");
        }

        if (missingFields.length > 0) {
          errorsForRow.push(`Missing required fields: ${missingFields.join(", ")}`);
        }

        const epicName = row.epicName;
        if (epicName && !availableEpicNames.includes(epicName)) {
          errorsForRow.push(`Epic "${epicName}" does not exist`);
        }

        const epicData = epicDateMap.get(epicName);
        const epicStart = formatDate(epicData?.startDate);
        const epicEnd = formatDate(epicData?.endDate);
        const sprintStart = formatDate(row.sprintStartDate);
        const sprintEnd = formatDate(row.sprintEndDate);

        if (sprintStart && epicStart && sprintStart < epicStart) {
          errorsForRow.push(`Sprint start date must be inside epic range`);
        }

        if (sprintEnd && epicEnd && sprintEnd > epicEnd) {
          errorsForRow.push(`Sprint end date must be inside epic range`);
        }

        if (sprintStart && sprintEnd && sprintEnd < sprintStart) {
          errorsForRow.push(`Sprint end date cannot be before sprint start date`);
        }

        const taskStart = formatDate(row.startDate);
        const taskEnd = formatDate(row.endDate);

        if (taskStart && sprintStart && taskStart < sprintStart) {
          errorsForRow.push(`Task start date must be inside sprint range`);
        }

        if (taskStart && sprintEnd && taskStart > sprintEnd) {
          errorsForRow.push(`Task start date must be inside sprint range`);
        }

        if (taskEnd && sprintStart && taskEnd < sprintStart) {
          errorsForRow.push(`Task end date must be inside sprint range`);
        }

        if (taskEnd && sprintEnd && taskEnd > sprintEnd) {
          errorsForRow.push(`Task end date must be inside sprint range`);
        }

        if (taskStart && taskEnd && taskEnd < taskStart) {
          errorsForRow.push(`Task end date cannot be before task start date`);
        }

        if (row.sprintName && sprintMap.has(row.sprintName)) {
          const sprintInfo = sprintMap.get(row.sprintName);
          if (epicName && sprintInfo?.epicName !== epicName) {
            errorsForRow.push(`Sprint "${row.sprintName}" does not belong to epic "${epicName}"`);
          }
        }

        const assigneeName = row.assignee;
        if (assigneeName && !availableUserNames.includes(assigneeName)) {
          errorsForRow.push(`Assignee "${assigneeName}" does not exist`);
        }

        const validTaskStatuses = ["TO_DO", "IN_PROGRESS", "DONE", "BLOCKED"];
        if (row.status && !validTaskStatuses.includes(row.status)) {
          errorsForRow.push(`Invalid task status "${row.status}"`);
        }

        const validTaskPriorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
        if (row.priority && !validTaskPriorities.includes(row.priority)) {
          errorsForRow.push(`Invalid priority "${row.priority}"`);
        }

        const validTaskTypes = ["TASK", "BUG", "STORY"];
        if (row.type && !validTaskTypes.includes(row.type)) {
          errorsForRow.push(`Invalid task type "${row.type}"`);
        }

        const validSprintStatuses = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"];
        if (row.sprintStatus && !validSprintStatuses.includes(row.sprintStatus)) {
          errorsForRow.push(`Invalid sprint status "${row.sprintStatus}"`);
        }

        if (row.estimatedHours !== "" && isNaN(Number(row.estimatedHours))) {
          errorsForRow.push(`Estimated hours must be a number`);
        }

        if (row.plannedDuration !== "" && isNaN(Number(row.plannedDuration))) {
          errorsForRow.push(`Planned duration must be a number`);
        }
      }

      if (errorsForRow.length > 0) {
        rowErrors.set(rowNumber, errorsForRow);
      }
    });

    // Format final error message
    if (rowErrors.size > 0) {
      const errorMessages: string[] = [];
      
      for (const [rowNum, errors] of rowErrors.entries()) {
        if (rowNum === 0) {         
          errorMessages.push(...errors);
        } else {   
          errorMessages.push(`Row ${rowNum}: ${errors.join(". ")}`);
        }
      }
      
      setError(errorMessages.join("\n\n"));
      return;
    }
    setError("");

    const dataWithDuplicateInfo = data.map((item, index) => ({
      ...item,
      isDuplicate: duplicateIndices.has(index),
      rowNumber: index + 1,
      originalIndex: index,
      isSprintOnly: !item.title || item.title.trim() === "",
    }));

    setParsedData(dataWithDuplicateInfo);
    setPreviewOpen(true);
  };

  const handleImport = async () => {
    const epicNameToIdMap = new Map();
    epics.forEach((epic) => {
      if (epic.name && epic.id) {
        epicNameToIdMap.set(epic.name.trim(), epic.id);
      }
    });

    const userNameToIdMap = new Map();
    if (allUsers && allUsers.length > 0) {
      allUsers.forEach((user: { name: string; id: string }) => {
        if (user.name && user.id) {
          userNameToIdMap.set(user.name.trim(), user.id);
        }
      });
    }

    const payload = parsedData
      .filter((item) => !item.isDuplicate) // Skip duplicates
      .map((item) => ({
        epicId: epicNameToIdMap.get(item.epicName) || "",
        sprintName: item.sprintName,
        sprintGoal: item.sprintGoal,
        sprintStatus: item.sprintStatus,
        sprintStartDate: item.sprintStartDate,
        sprintEndDate: item.sprintEndDate,
        title: item.title || "", 
        description: item.description,
        type: item.type,
        status: item.status,
        priority: item.priority,
        assigneeId: userNameToIdMap.get(item.assignee) || "",
        estimatedHours: item.estimatedHours ? Number(item.estimatedHours) : null,
        startDate: item.startDate,
        endDate: item.endDate,
        plannedDuration: item.plannedDuration ? Number(item.plannedDuration) : null,
        projectId: projectId,
      }));

    console.log(payload, "Final payload for API with IDs");

    await bulkUploadTasks(payload).unwrap();

    setPreviewOpen(false);
    handleClose();
  };

  const handleClose = () => {
    setCsvText("");
    setError("");
    setParsedData([]);
    setPreviewOpen(false);
    setFileName("");
    onClose();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
   
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();

  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
 
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="!w-[70vw] !max-w-[90vw] h-auto  p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header with gradient background */}
            <DialogHeader className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5 " />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold ">
                      Bulk Upload Tasks
                    </DialogTitle>
                    <p className="text-sm mt-0.5">
                      Upload multiple tasks at once using our Excel template
                    </p>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Body with scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {/* Step 1: Download Template */}
           <div className="grid grid-cols-2 gap-6">

  {/* Step 1 */}
  <div className="border border-border rounded-xl p-5 flex flex-col gap-3 bg-background">
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-full border-[1.5px] border-border flex items-center justify-center text-[12px] font-bold shrink-0">
        1
      </div>
      <span className="text-sm font-medium">Download template</span>
    </div>
    <Button
      onClick={downloadTemplate}
      variant="outline"
      className="w-full h-12 border-dashed border-[1.5px] bg-muted/50 cursor-pointer"
    >
      <Download className="w-4 h-4 mr-2" />
      Download Excel template
    </Button>
    <p className="text-xs text-muted-foreground leading-relaxed pl-[34px]">
      Includes validation rules and dropdown lists for easy data entry.
      Leave title empty to create sprints only.
    </p>
  </div>

  {/* Step 2 */}
  <div className="border border-border rounded-xl p-5 flex flex-col gap-3 bg-background">
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-full border-[1.5px] border-border flex items-center justify-center text-[12px] font-bold shrink-0">
        2
      </div>
      <span className="text-sm font-medium">Upload your file</span>
    </div>
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex-1 border-[1.5px] border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-1.5 text-center cursor-pointer transition-colors duration-150 hover:bg-muted/50 hover:border-border/80"
      onClick={() => document.getElementById("file-upload")?.click()}
    >
      <Input
        type="file"
        accept=".xlsx"
        id="file-upload"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
      <Upload className="w-7 h-7 text-muted-foreground/60" />
      <p className="text-sm font-medium">
        {fileName ? (
          <span className="text-green-600">✓ {fileName}</span>
        ) : (
          "Click to upload or drag and drop"
        )}
      </p>
      <p className="text-[11px] text-muted-foreground">Only .xlsx files accepted</p>
    </div>
  </div>

</div>
              

              {/* Step 3: Review Data */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-[1.5px] border-border flex items-center justify-center text-[12px] font-bold shrink-0">
        3
      </div>                  
      <h3 className="text-sm font-semibold">Review & Validate</h3>
                </div>

                <div className="relative">
                  <textarea
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="Paste your data here or upload an Excel file above..."
                    className="w-full h-50 border rounded-lg p-3 text-sm font-mono focus:ring-2 resize-none"
                  />
                  {csvText && (
                    <div className="absolute bottom-2 right-2 text-xs">
                      {csvText.split("\n").length} rows
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700 whitespace-pre-wrap">
                        {error}
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleParse}
                  disabled={!csvText.trim()}
                  className="w-full  transition-all duration-200 h-11 cursor-pointer"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Parse & Preview Data
                </Button>
              </div>

              {/* Help section */}
              {!csvText && !error && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="text-lg ">
                      <p className="font-semibold mb-1">How to use:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Download the Excel template</li>
                       <li>Fill out the template - decide for each row whether you're creating a sprint or a task</li>
                        <li>
                          <strong>To create a Sprint only:</strong> Leave all
                          task-related fields empty, fill in only sprint details
                          (Sprint Name, Goal, Status, Start/End Dates), and
                           assign the sprint to an Epic (via Epic Dropdown) where you want the sprint to be created.
                        </li>
                        <li>
                          <strong>To create a Task:</strong> Select/assign the
                          Task to an Epic (via Epic Dropdown), associate it with an
                          existing sprint or a newly created sprint from the
                          same upload, and fill in all required task details
                        </li>
                        <li>
                          Upload the filled file using the upload area above
                        </li>
                        <li>
                          Click "Parse & Preview Data" to validate your entries
                        </li>
                        <li>
                          Review both sprints and tasks before confirming the
                          import
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with progress info */}
            {csvText && !error && (
              <div className="border-t px-6 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="">Ready to preview</span>
                  <span className=" font-medium">
                    {csvText.split("\n").length - 1} rows detected
                  </span>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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