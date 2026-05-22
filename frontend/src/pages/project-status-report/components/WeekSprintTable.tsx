// WeekSprintTable.tsx — full replacement

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ikon-react-components-lib";
import { Info, Search } from "lucide-react";

type SprintRow = {
  name: string;
  progress: number;
};

type Props = {
  title: string;
  data: SprintRow[];
};

const WeekSprintTable: React.FC<Props> = ({ title, data }) => {
  const [search, setSearch] = React.useState("");

  const filteredData = React.useMemo(() => {
    if (!search.trim()) return data;
    return data.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, data]);

  return (
    <Card className="pb-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="font-medium">{title}</CardTitle>
          <Info size={16} />
        </div>
        <div className="flex items-center border rounded-md px-3 ">
          <Search size={16} />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none focus-visible:ring-0 dark:bg-transparent!"
          />
        </div>
      </CardHeader>

      <CardContent className="h-[300px]">
        {/* Sticky header */}
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2 text-left">Sprint Name</TableHead>
              <TableHead className="w-1/2 text-left">Progress</TableHead>
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
                      <div className="flex items-center gap-2">
                        <div className="w-24">
                          <Progress value={item.progress} />
                        </div>
                        <span className="text-sm">{item.progress}%</span>
                      </div>
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