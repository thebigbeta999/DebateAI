import { useTimer } from "@/hooks/use-timer";
import { Button } from "@/components/ui/button";
import { Pause, Play, Square } from "lucide-react";

interface TimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  onTick?: (seconds: number) => void;
  phase?: string;
}

export function Timer({ initialSeconds, onComplete, onTick, phase }: TimerProps) {
  const { 
    formattedTime, 
    progress, 
    isRunning, 
    start, 
    pause, 
    stop 
  } = useTimer({
    initialSeconds,
    onComplete,
    onTick,
  });

  const strokeDasharray = `${progress * 100}, 100`;
  const strokeColor = progress > 0.5 ? "#2563eb" : progress > 0.2 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex items-center space-x-6">
      <div className="text-center">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
              fill="none"
              stroke="hsl(20, 5.9%, 90%)"
              strokeWidth="2"
            />
            <path
              d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
              fill="none"
              stroke={strokeColor}
              strokeWidth="2"
              strokeDasharray={strokeDasharray}
              className={progress < 0.2 && isRunning ? "animate-pulse" : ""}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-mono font-bold text-slate-900">
              {formattedTime}
            </span>
          </div>
        </div>
        {phase && (
          <div className="text-xs text-slate-500 mt-1 capitalize">
            {phase.replace("-", " ")}
          </div>
        )}
      </div>
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={isRunning ? pause : start}
          className="h-8 w-8"
        >
          {isRunning ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={stop}
          className="h-8 w-8"
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
