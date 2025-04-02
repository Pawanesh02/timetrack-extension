import * as React from "react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/time-utils";

export interface TimeDisplayProps {
  seconds: number;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  compact?: boolean;
  className?: string;
}

export function TimeDisplay({
  seconds,
  showHours = true,
  showMinutes = true,
  showSeconds = false,
  compact = false,
  className,
}: TimeDisplayProps) {
  const formattedTime = formatTime(seconds, { showHours, showMinutes, showSeconds, compact });

  return (
    <span className={cn("font-medium", className)}>
      {formattedTime}
    </span>
  );
}
