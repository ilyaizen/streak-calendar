import { CompleteControls } from "@/components/ui/complete-controls";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getCompletionColorClass } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useState } from "react";

import { Id } from "@server/convex/_generated/dataModel";

import { XIcon } from "../ui/x-icon";

/**
 * DayCell Component
 * Renders an interactive cell representing a single day in a habit tracking calendar.
 * Features a popover menu for updating completion counts and visual feedback for completion status.
 */

/**
 * Props for the DayCell component
 * @interface DayCellProps
 * @property {Id<"habits">} habitId - Unique identifier for the habit
 * @property {string} date - ISO date string representing the cell's date
 * @property {number} count - Number of completions for this date
 * @property {(count: number) => Promise<void>} onCountChange - Callback for updating completion count
 * @property {string} colorClass - Base color theme for visual feedback (e.g., "bg-red-500")
 * @property {boolean} [gridView] - Optional flag for grid view display mode
 * @property {boolean} [disabled] - Optional flag to disable interactions (e.g., for dates outside query range)
 * @property {string} [label] - Optional label to display instead of date number
 * @property {"small" | "medium" | "large"} [size] - Optional size of the cell
 * @property {boolean} [isUpdating] - Whether this cell is currently being updated
 */
interface DayCellProps {
  habitId: Id<"habits">;
  date: string; // ISO date string for the day this completion represents
  count: number; // Current number of completions for this date
  onCountChange: (count: number) => Promise<void>; // Callback when completion count changes
  colorClass: string; // Base color theme (e.g., "bg-red-500") for visual feedback
  gridView?: boolean; // Whether to display in grid view (affects sizing)
  disabled?: boolean; // Whether the completion menu is disabled (outside query range)
  label?: string; // Optional label to display instead of date number
  size?: "small" | "medium" | "large"; // Optional size of the cell
  isUpdating?: boolean; // Whether this cell is currently being updated
}

/**
 * DayCell component for displaying and managing daily habit completions
 * Includes a clickable button that shows completion status and a popover menu for updating counts
 */
export const DayCell = memo(
  ({
    date,
    count,
    onCountChange,
    colorClass,
    disabled,
    label,
    size = "medium",
    isUpdating = false,
    habitId,
  }: DayCellProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const t = useTranslations("calendar");

    // Extract color name from class and determine fill color based on completion count
    const colorMatch = colorClass.match(/bg-(\w+)-500/);
    const fillClass = count > 0 && colorMatch ? getCompletionColorClass(colorClass, count) : "";

    const dateObj = new Date(date);
    const formattedDate = t("dateFormat.short", {
      month: t(`monthNames.${format(dateObj, "MMMM").toLowerCase()}`),
      day: dateObj.getDate(),
    });

    const completionText = t("completions", {
      count,
      date: formattedDate,
    });

    const sizeClasses = {
      small: "h-6 w-6",
      medium: "h-9 w-9",
      large: "h-12 w-12",
    };

    const iconSizeClasses = {
      small: "!h-[24px] !w-[24px]",
      medium: "!h-[36px] !w-[36px]",
      large: "!h-[48px] !w-[48px]",
    };

    const loaderSizeClasses = {
      small: "h-3 w-3",
      medium: "h-5 w-5",
      large: "h-6 w-6",
    };

    return (
      <TooltipProvider>
        <Tooltip>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  onClick={() => !disabled && setIsOpen(true)}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full",
                    sizeClasses[size],
                    count === 0 ? "bg-muted" : "bg-transparent",
                    disabled ? "cursor-not-allowed !bg-zinc-100 dark:!bg-zinc-800" : "",
                    "relative p-0"
                  )}
                  disabled={disabled}
                >
                  {isUpdating ? (
                    <Loader2 className={cn("animate-spin text-muted-foreground", loaderSizeClasses[size])} />
                  ) : count > 0 ? (
                    <div className="absolute">
                      <XIcon key={`${count}-${fillClass}`} className={`${iconSizeClasses[size]} ${fillClass}`} />
                    </div>
                  ) : (
                    <span
                      className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${
                        disabled ? "text-zinc-500/30" : "text-zinc-600/50 dark:text-zinc-400/50"
                      } ${size === "small" ? "scale-90" : ""}`}
                    >
                      {label ?? new Date(date).getDate()}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{completionText}</p>
            </TooltipContent>
            {/* Popover menu for updating completion count */}
            <PopoverContent
              align="center"
              className="w-auto rounded-[15px] border bg-white/60 px-4 py-2 backdrop-blur-sm dark:bg-black/60"
            >
              <div className="flex flex-col items-center gap-2">
                {/* Display full date in popover */}
                <div className="text-xs">
                  {t("dateFormat.long", {
                    weekday: t(`weekDays.${format(dateObj, "eee").toLowerCase()}`),
                    month: t(`monthNames.${format(dateObj, "MMMM").toLowerCase()}`),
                    day: dateObj.getDate(),
                  })}
                </div>
                {/* Completion controls for incrementing/decrementing count */}
                <div className="flex justify-center">
                  <CompleteControls
                    count={count}
                    onIncrement={() => onCountChange(count + 1)}
                    onDecrement={() => onCountChange(count - 1)}
                    variant="default"
                    disabled={isUpdating}
                    habitId={habitId}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </Tooltip>
      </TooltipProvider>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.date === nextProps.date &&
      prevProps.count === nextProps.count &&
      prevProps.colorClass === nextProps.colorClass &&
      prevProps.gridView === nextProps.gridView &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.label === nextProps.label &&
      prevProps.size === nextProps.size &&
      prevProps.isUpdating === nextProps.isUpdating &&
      prevProps.habitId === nextProps.habitId
    );
  }
);
DayCell.displayName = "DayCell";
