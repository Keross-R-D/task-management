import React, { useState } from "react";
import { Button, ComboboxInput, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ikon-react-components-lib";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* TYPES */
type TimesheetRow = {
    name: string;
    entries: Record<string, number>;
};

/* HELPERS */
const getWeek = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return new Date(d);
    });
};

const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        weekday: "short",
    });

const toKey = (date: Date) => date.toISOString().split("T")[0];

/* COMPONENT */
const TimeSheet: React.FC = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [user, setUser] = useState("All Users");
    const [project, setProject] = useState("All Projects");

    const weekDates = getWeek(startDate);

    const users = [
        { label: "All Users", value: "All Users" },
        { label: "John Doe", value: "John Doe" },
        { label: "Alice Smith", value: "Alice Smith" },
    ];

    const projects = [
        { label: "All Projects", value: "All Projects" },
        { label: "Project 1", value: "Project 1" },
        { label: "Project 2", value: "Project 2" },
    ];

    const timesheetData: TimesheetRow[] = [
        {
            name: "John Doe",
            entries: {
                "2026-04-20": 5,
                "2026-04-21": 3,
            },
        },
        {
            name: "Alice Smith",
            entries: {
                "2026-04-24": 6,
                "2026-04-25": 4,
            },
        },
    ];

    const prevWeek = () => {
        const d = new Date(startDate);
        d.setDate(d.getDate() - 7);
        setStartDate(d);
    };

    const nextWeek = () => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + 7);
        setStartDate(d);
    };

    //Current week navigation
    const isSameWeek = (date1: Date, date2: Date) => {
        const getStart = (d: Date) => {
            const temp = new Date(d);
            temp.setDate(temp.getDate() - temp.getDay());
            temp.setHours(0, 0, 0, 0);
            return temp.getTime();
        };
        return getStart(date1) === getStart(date2);
    };

    const today = new Date();

    const isCurrentWeek = isSameWeek(startDate, today);

    const goToCurrentWeek = () => {
        setStartDate(new Date());
    };

    return (
        <>
        <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">

            {/* LEFT: Week Navigation */}
            <div className="flex items-center gap-2 flex-wrap justify-between md:justify-start">

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="font-medium whitespace-nowrap text-sm md:text-base">
                        {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
                    </span>

                    <Button variant="outline" size="icon" onClick={nextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {!isCurrentWeek && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToCurrentWeek}
                    >
                        This Week
                    </Button>
                )}
            </div>

            {/* RIGHT: Filters */}
            <div className="flex flex-col gap-2 w-full md:flex-row md:w-auto md:items-center">

                <div className="w-full md:w-[180px]">
                    <ComboboxInput
                        placeholder="All Users"
                        items={users}
                        defaultValue={user}
                        onSelect={(value) => setUser(value as string)}
                    />
                </div>

                <div className="w-full md:w-[180px]">
                    <ComboboxInput
                        placeholder="All Projects"
                        items={projects}
                        defaultValue={project}
                        onSelect={(value) => setProject(value as string)}
                    />
                </div>
            </div>
        </div>

        {/* Table */ }
        <div className="border rounded-lg overflow-hidden">
            <Table>
                {/* Table header */}
                <TableHeader className="h-11 bg-muted font-extrabold">
                    <TableRow>
                        <TableHead>Assignee</TableHead>

                        {weekDates.map((date) => (
                            <TableHead key={date.toISOString()}>
                                {formatDate(date)}
                            </TableHead>
                        ))}

                        <TableHead>Total</TableHead>
                    </TableRow>
                </TableHeader>

                {/* Table body */}
                <TableBody>
                    {timesheetData.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={weekDates.length + 2}
                                className="text-center"
                            >
                                No time logged
                            </TableCell>
                        </TableRow>
                    ) : (
                        timesheetData.map((row) => {
                            const total = weekDates.reduce((sum, date) => {
                                const key = toKey(date);
                                return sum + (row.entries[key] || 0);
                            }, 0);

                            return (
                                <TableRow key={row.name}>
                                    <TableCell>{row.name}</TableCell>

                                    {weekDates.map((date) => {
                                        const key = toKey(date);
                                        const hrs = row.entries[key] || 0;

                                        return (
                                            <TableCell key={key}>
                                                {hrs ? `${hrs}h` : "-"}
                                            </TableCell>
                                        );
                                    })}

                                    <TableCell className="font-semibold">
                                        {total}h
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
        </>
    );
};

export default TimeSheet;