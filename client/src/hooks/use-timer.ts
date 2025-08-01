import { useState, useEffect, useRef, useCallback } from "react";

export interface TimerConfig {
  initialSeconds: number;
  onComplete?: () => void;
  onTick?: (seconds: number) => void;
}

export function useTimer({ initialSeconds, onComplete, onTick }: TimerConfig) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  const reset = useCallback((newSeconds?: number) => {
    setIsRunning(false);
    setSeconds(newSeconds ?? initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev - 1;
          onTick?.(newSeconds);
          
          if (newSeconds <= 0) {
            setIsRunning(false);
            onComplete?.();
            return 0;
          }
          
          return newSeconds;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, seconds, onComplete, onTick]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const progress = seconds / initialSeconds;

  return {
    seconds,
    minutes,
    remainingSeconds,
    progress,
    isRunning,
    start,
    pause,
    stop,
    reset,
    formattedTime: `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`,
  };
}
