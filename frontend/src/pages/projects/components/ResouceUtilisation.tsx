"use client";

import { Card, CardContent } from "ikon-react-components-lib";
import { Users } from "lucide-react";

export default function ResourceUtilization() {
  return (
    <Card className="w-full  border border-dashed  rounded-2xl mt-4">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        {/* Icon */}
        <div className="mb-4 flex items-center justify-center rounded-full border  p-3">
          <Users className="h-6 w-6" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium ">No resource data available</h3>

        {/* Subtitle */}
        <p className="mt-2 text-sm  max-w-md">
          Assign tasks to team members to see their utilization in this project.
        </p>
      </CardContent>
    </Card>
  );
}
