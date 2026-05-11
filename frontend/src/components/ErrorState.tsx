import { AlertTriangle } from "lucide-react";
import { Button } from "ikon-react-components-lib";
type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6">
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />

          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold mb-2">
          Oops! Something went wrong{"   "}
        </h2>

        {/* Description */}
        <p className="text-muted-foreground mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onRetry && onRetry()}
            className="cursor-pointer"
          >
            try again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;
