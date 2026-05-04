import { Card, CardTitle, CardDescription } from "ikon-react-components-lib";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    description: string;
    value: number | string;
    color?: string;
    bg?: string;
    Icon?: LucideIcon;
}

export default function StatsCard({
    title,
    description,
    value,
    color = "text-indigo-500",
    bg = "bg-indigo-500/10",
    Icon,
}: StatsCardProps) {
    return (
        <Card className="p-4">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div>
                        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                        <CardDescription className="text-sm">{description}</CardDescription>
                    </div>

                    <p className={`text-2xl font-semibold ${color}`}>{value}</p>
                </div>

                <div className={`p-2 rounded-lg ${bg}`}>
                    {Icon && <Icon className={`h-5 w-5 ${color}`} />}
                </div>
            </div>
        </Card>
    );
}
