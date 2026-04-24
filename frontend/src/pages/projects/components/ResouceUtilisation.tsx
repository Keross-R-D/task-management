import TimeSheet from "@/pages/resource-utilisation/components/TimeSheet";
import { Card, CardContent } from "ikon-react-components-lib";

export default function ResourceUtilization() {
  return (
    <Card className="w-full border border-dashed  rounded-2xl mt-4">
      <CardContent className="w-full py-8 text-center">
        <TimeSheet />
      </CardContent>
    </Card>
  );
}
