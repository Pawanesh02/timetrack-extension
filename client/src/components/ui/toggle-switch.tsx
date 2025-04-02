import * as React from "react";
import { cn } from "@/lib/utils";

export interface ToggleSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

const ToggleSwitch = React.forwardRef<HTMLInputElement, ToggleSwitchProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <div className={cn("flex items-center", className)}>
        {(label || description) && (
          <div className="mr-3">
            {label && <span className="text-sm font-medium text-neutral-500">{label}</span>}
            {description && <p className="text-xs text-neutral-400">{description}</p>}
          </div>
        )}
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only switch-checkbox"
            ref={ref}
            {...props}
          />
          <div className="switch-toggle w-11 h-6 bg-neutral-300 rounded-full p-1 flex items-center">
            <div className="switch-dot bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out"></div>
          </div>
        </label>
      </div>
    );
  }
);

ToggleSwitch.displayName = "ToggleSwitch";

export { ToggleSwitch };
