import { Card, CardContent, CardHeader, CardTitle } from "ikon-react-components-lib";
import { ChevronLeft, FolderKanban, Info, TriangleAlert, Calendar, ChartColumn, Clock, Target, CircleCheck } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const data = {
    projectName: "Project",
    startDate: "Feb 2, 2026",
    endDate: "Dec 31, 2026",
    status: "NOT_STARTED",
    progress: 100,
    estimatedHours: 87,
    actualHours: 0,
    tasksTotal: 2,
    tasksDone: 2,
};

const ProjectStatusDetailPage: React.FC = () => {
    //const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="mb-3">
                <button className="flex gap-2 text-sm font-bold cursor-pointer" onClick={() => navigate(-1)}><ChevronLeft /><div className="flex items-center">Back to reports</div></button>
            </div>
            <div>
                <div className="grid grid-cols-1 lg:grid-cols-2! x gap-6">

                    {/* Project Details */}
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle className="text-2xl">Project Details</CardTitle>

                            <span className="px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-500 border-green-500">
                            On Time
                            </span>
                        </CardHeader>

                        <CardContent className="space-y-3 text-sm">

                            <p className="flex items-center gap-2"><span className="flex items-center gap-1 font-bold"><FolderKanban className="h-4"/> Project:</span> {data.projectName}</p>

                            <p className="flex items-center gap-2"><span className="flex items-center gap-1 font-bold"><Calendar className="h-4"/> Start Date:</span> {data.startDate}</p>

                            <p className="flex items-center gap-2"><span className="flex items-center gap-1 font-bold"><Calendar className="h-4"/> End Date:</span> {data.endDate}</p>

                            <p className="flex items-center gap-2">
                                <ChartColumn className="h-4"/>
                                <span className=" flex items-center gap-1font-bold">Status:</span>{" "}
                                <span className="text-sm">
                                    {data.status.replace("_", " ")}
                                </span>
                            </p>

                            <p className="flex items-center gap-2">
                                <Target className="h-4"/>
                                <span className="flex items-center gap-1 font-bold">Progress:</span>{" "}
                                <span className="text-green-500">{data.progress}%</span>
                            </p>

                            <div className="flex items-center gap-2">
                                <Clock className="h-4"/>
                                <span className="flex items-center gap-1 font-bold">Hours:</span>{" "}
                                {data.actualHours}h / {data.estimatedHours}h
                            </div>

                            <div className="pt-2">
                            <hr/>
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-4 text-xs pt-2">
                                <div className="text-sm text-green-500">● On Time</div>
                                <div className="text-sm text-yellow-500">● Slight Delay</div>
                                <div className="text-sm text-red-500">● Delay</div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Executive Summary */}
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle className="text-2xl">Executive Summary Report</CardTitle>

                            <span className="text-sm">
                            From: Apr 13, 2026 To: May 3, 2026
                            </span>
                        </CardHeader>

                        <CardContent className="space-y-4 text-sm">

                            <div className="space-y-2">
                            <p className="flex gap-2 font-semibold text-green-400">
                                <CircleCheck className="h-5"/> All sprint(s) are running on time.
                            </p>
                            <p className="flex gap-2 font-semibold text-yellow-400">
                                <TriangleAlert className="h-5"/> No risk(s) are associated with the project.
                            </p>
                            <p className="flex gap-2 font-semibold text-blue-400">
                                <Info className="h-5"/> All tasks have been completed.
                            </p>
                            </div>

                            {/* Stats */}
                            <div className="flex justify-around mt-8 pt-5 border-t">

                                <div className="text-center">
                                    <p className="text-2xl font-bold">
                                    {data.tasksTotal}
                                    </p>
                                    <p className="text-sm text-gray-400">Total Tasks</p>
                                </div>

                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-500">
                                    {data.tasksDone}
                                    </p>
                                    <p className="text-sm text-gray-400">Completed</p>
                                </div>

                                <div className="text-center">
                                    <p className="text-2xl font-bold text-yellow-500">
                                    {data.tasksTotal - data.tasksDone}
                                    </p>
                                    <p className="text-sm text-gray-400">Remaining</p>
                                </div>

                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Cards */}
                <div className="mt-4 mb-4">
                    <Card>
                        <CardHeader>
                        <CardTitle>Overdue Tasks</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-gray-400">
                        No data available in table
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3! gap-6">
                    <Card>
                    <CardHeader>
                        <CardTitle>Current Week</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-gray-400">
                        No data available in table
                    </CardContent>
                    </Card>

                    <Card>
                    <CardHeader>
                        <CardTitle>Previous Week</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-gray-400">
                        No data available in table
                    </CardContent>
                    </Card>

                    <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Week</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-gray-400">
                        No data available in table
                    </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default ProjectStatusDetailPage;