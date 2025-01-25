"use client";

import { Button } from "@/components/ui/button";
import { ConfettiButton } from "@/components/ui/confetti";
import { xIconPath } from "@/components/ui/x-icon";
import NumberFlow from "@number-flow/react";
import confettiLib from "canvas-confetti";
import { useMutation, useQuery } from "convex/react";
import { Minus, Plus, Timer, TimerOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { api } from "@server/convex/_generated/api";
import { Id } from "@server/convex/_generated/dataModel";

/**
 * A versatile control component that handles completion tracking with optional timer functionality.
 * Supports increment/decrement operations and displays confetti animations on completion.
 */

interface CompleteControlsProps {
  /** Current count value */
  count: number;
  /** Callback to increment the count */
  onIncrement: () => Promise<void>;
  /** Callback to decrement the count */
  onDecrement: () => Promise<void>;
  /** Visual style variant for the buttons */
  variant?: "default" | "ghost";
  /** Timer duration in minutes (optional) */
  timerDuration?: number;
  /** Callback triggered on completion (increment/decrement/timer finish) */
  onComplete?: () => void;
  /** Name of the habit */
  habitName?: string;
  /** Whether the controls are disabled */
  disabled?: boolean;
  /** Habit ID */
  habitId: Id<"habits">;
}

export function CompleteControls({
  count,
  onIncrement,
  onDecrement,
  variant = "default",
  timerDuration,
  onComplete,
  disabled = false,
  habitId,
}: CompleteControlsProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerButtonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("calendar.controls");
  const schedule = useMutation(api.habits.scheduleHabitIncrement);
  const cancelSchedule = useMutation(api.habits.cancelScheduledIncrement);
  const habit = useQuery(api.habits.get, habitId ? { id: habitId } : "skip");

  const handleIncrement = useCallback(async () => {
    await onIncrement();
    onComplete?.();
  }, [onIncrement, onComplete]);

  const handleDecrement = useCallback(async () => {
    await onDecrement();
    onComplete?.();
  }, [onDecrement, onComplete]);

  const confettiShape = useMemo(() => confettiLib.shapeFromPath(xIconPath), []);

  const getConfettiOptions = useCallback(
    (origin?: { x: number; y: number }) => ({
      angle: 90 + (Math.random() - 0.5) * 90,
      particleCount: 17,
      spread: 45 + Math.random() * 75,
      startVelocity: 35,
      gravity: 0.7,
      decay: 0.9,
      ticks: 200,
      colors: ["#FF0000", "#FFA500", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF"],
      shapes: [confettiShape],
      scalar: 1.5,
      origin: origin || { x: 0.5, y: 1 },
      disableForReducedMotion: false,
    }),
    [confettiShape]
  );

  const handleStartTimer = useCallback(
    async (durationMs: number) => {
      if (!habitId) {
        console.error("Timer requires habitId");
        return;
      }

      setIsScheduling(true);

      try {
        // Cancel any existing timer first
        if (habit?.scheduledTimer) {
          await cancelSchedule({ habitId });
        }
        // Schedule new timer
        await schedule({
          habitId,
          durationMs,
          clientNow: Date.now(),
        });
      } catch (error) {
        console.error("Schedule mutation failed:", error);
      } finally {
        setIsScheduling(false);
      }
    },
    [habitId, schedule, cancelSchedule, habit]
  );

  const handleStopTimer = useCallback(async () => {
    if (habitId) {
      try {
        await cancelSchedule({ habitId });
        setTimeLeft(null);
        if (habit) {
          habit.timerEnd = undefined;
        }
      } catch (error) {
        console.error("Failed to cancel schedule:", error);
      }
    }
  }, [habitId, cancelSchedule, habit]);

  useEffect(() => {
    const updateTime = () => {
      if (!habit?.timerEnd) return;
      const remaining = habit.timerEnd - Date.now();
      setTimeLeft(remaining > 0 ? remaining : null);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [habit?.timerEnd]);

  if (!habitId) {
    console.error("CompleteControls requires habitId");
    return null;
  }

  // Timer mode with count = 0: Show start button
  if (timerDuration) {
    if (count === 0) {
      if (timeLeft !== null) {
        return (
          <div className="flex w-[96px] flex-col gap-px">
            <div className="flex w-[96px] items-center justify-between gap-1">
              <Button
                variant={variant}
                size="icon"
                className="aspect-square h-6 w-6 rounded-full p-0"
                onClick={handleStopTimer}
              >
                <TimerOff className="h-4 w-4" />
              </Button>
              <Button variant={variant} size="sm" className="h-6 flex-1 text-xs" disabled={true}>
                {Math.ceil(timeLeft / 1000)}s
              </Button>
            </div>
          </div>
        );
      }
      return (
        <div className="flex w-[96px] flex-col gap-px">
          <Button
            ref={timerButtonRef}
            variant={variant}
            size="sm"
            className="h-6 w-[96px] text-xs"
            onClick={() => handleStartTimer(timerDuration * 60 * 1000)}
            disabled={disabled || isScheduling}
          >
            {isScheduling ? t("scheduling") : t("start")}
          </Button>
        </div>
      );
    }

    // Timer mode with count > 0: Show decrement and timer controls
    return (
      <div className="flex w-[96px] flex-col gap-px">
        <div className="flex w-[96px] items-center justify-between">
          <Button
            variant={variant}
            size="icon"
            className="aspect-square h-6 w-6 rounded-full p-0"
            onClick={handleDecrement}
            disabled={disabled}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-[72px] text-center font-medium">
            <NumberFlow value={count} format={{ style: "decimal" }} />
          </span>
          {timeLeft !== null ? (
            <Button
              variant={variant}
              size="icon"
              className="aspect-square h-6 w-6 rounded-full p-0"
              onClick={handleStopTimer}
              disabled={disabled}
            >
              <TimerOff className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              ref={timerButtonRef}
              variant={variant}
              size="icon"
              className="aspect-square h-6 w-6 rounded-full p-0"
              onClick={() => handleStartTimer(timerDuration * 60 * 1000)}
              disabled={disabled || isScheduling}
            >
              <Timer className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Non-timer mode with count = 0: Show complete button
  if (count === 0) {
    return (
      <div className="flex w-[96px] flex-col gap-px">
        <ConfettiButton
          variant={variant}
          size="sm"
          className="h-6 w-[96px] text-xs"
          onClick={handleIncrement}
          options={getConfettiOptions()}
          disabled={disabled}
        >
          {t("complete")}
        </ConfettiButton>
      </div>
    );
  }

  // Non-timer mode with count > 0: Show increment/decrement controls
  return (
    <div className="flex w-[96px] flex-col gap-px">
      <div className="flex w-[96px] items-center justify-between">
        <Button
          variant={variant}
          size="icon"
          className="aspect-square h-6 w-6 rounded-full p-0"
          onClick={handleDecrement}
          disabled={disabled}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-[72px] text-center font-medium">
          <NumberFlow value={count} format={{ style: "decimal" }} />
        </span>
        <ConfettiButton
          variant={variant}
          size="icon"
          className="aspect-square h-6 w-6 rounded-full p-0"
          onClick={handleIncrement}
          options={getConfettiOptions()}
          disabled={disabled}
        >
          <Plus className="h-4 w-4" />
        </ConfettiButton>
      </div>
    </div>
  );
}
