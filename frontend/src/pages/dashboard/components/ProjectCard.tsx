import { useGetTasksByProjectQuery } from "@/features/tasks/tasksApiSlice";
import { Progress } from "ikon-react-components-lib";

type Props = {
    id: string;
    name: string;
    status: string;
};

const ProjectCard = ({ id, name, status }: Props) => {
    const { data: tasks = [], isLoading } = useGetTasksByProjectQuery(id);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "DONE").length;

    const percentage =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="p-4 border rounded-xl bg-card space-y-3">

            {/* Header */}
            <div className="flex justify-between">
                <h3 className="font-semibold">{name}</h3>
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400">
                    {status}
                </span>
            </div>

            {/* Progress */}
            {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
                <>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <Progress value={percentage} className="[&>div]:bg-indigo-500"/>
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {completedTasks}/{totalTasks} tasks completed
                    </p>
                </>
            )}
        </div>
    );
};

export default ProjectCard;