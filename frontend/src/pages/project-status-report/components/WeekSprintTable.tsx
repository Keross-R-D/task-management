import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ikon-react-components-lib";
import { Info, Search } from "lucide-react";

type Sprint = {
  name: string;
  endDate: string | Date;
};

type Props = {
  title: string;
  data: Sprint[];
  formatDate: (date?: string | Date | null) => string;
};

const WeekSprintTable: React.FC<Props> = ({ title, data, formatDate }) => {
  const [search, setSearch] = React.useState("");

  const filteredData = React.useMemo(() => {
    if (!search.trim()) return data;
    return data.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, data]);

  return (
    <Card className="pb-2">
      <CardHeader className="flex flex-row items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-2">
          <CardTitle className="font-medium">{title}</CardTitle>
          <Info size={16} />
        </div>

        {/* RIGHT SEARCH */}
        <div className="flex items-center border rounded-md px-3 dark:bg-[#0a0a0a]">
          <Search size={16} />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none focus-visible:ring-0 dark:bg-[#0a0a0a]"
          />
        </div>
      </CardHeader>

      <CardContent className="h-[300px]">
        {/* Sticky header — outside the scroll container */}
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2 text-left">Sprint Name</TableHead>
              <TableHead className="w-1/2 text-left">Planned End Date</TableHead>
            </TableRow>
          </TableHeader>
        </Table>

        {/* Scrollable body */}
        <div
          className="max-h-[260px] overflow-y-auto"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          <Table className="w-full">
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-1/2">{item.name}</TableCell>
                    <TableCell className="w-1/2">
                      {formatDate(item.endDate)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekSprintTable;