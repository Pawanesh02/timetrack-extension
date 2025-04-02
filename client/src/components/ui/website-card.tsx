import * as React from "react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/time-utils";

export interface WebsiteCardProps {
  domain: string;
  icon?: string;
  category: string;
  time: number; // in seconds
  percentage: number;
  color?: string;
  className?: string;
}

export function WebsiteCard({
  domain,
  icon,
  category,
  time,
  percentage,
  color = "red",
  className,
}: WebsiteCardProps) {
  // Calculate initials for domain if no icon
  const initials = domain
    .replace(/\.[^/.]+$/, "") // Remove TLD
    .split(".")
    .pop()
    ?.substring(0, 2)
    .toUpperCase();

  return (
    <div className={cn("mb-4 last:mb-0", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={`w-8 h-8 bg-${color}-100 rounded-full flex items-center justify-center mr-3`}>
            {icon ? (
              <img src={icon} alt={domain} className="w-4 h-4" />
            ) : (
              <span className={`text-${color}-600 text-xs`}>{initials}</span>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-neutral-700">{domain}</h4>
            <p className="text-xs text-neutral-500">{category}</p>
          </div>
        </div>
        <span className="text-sm font-medium">{formatTime(time)}</span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-1.5">
        <div
          className={`bg-${color}-500 h-1.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
