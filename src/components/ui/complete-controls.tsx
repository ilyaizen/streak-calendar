"use client";

import { Button } from "@/components/ui/button";
import { ConfettiButton } from "@/components/ui/confetti";
import { xLogoPath } from "@/components/ui/x-logo";
import NumberFlow from "@number-flow/react";
import confettiLib from "canvas-confetti";
import { Minus, Plus, Timer } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * A versatile control component that handles completion tracking with optional timer functionality.
 * Supports increment/decrement operations and displays confetti animations on completion.
 */

interface CompleteControlsProps {
  /** Current count value */
  count: number;
  /** Callback to increment the count */
  onIncrement: () => void;
  /** Callback to decrement the count */
  onDecrement: () => void;
  /** Visual style variant for the buttons */
  variant?: "default" | "ghost";
  /** Timer duration in minutes (optional) */
  timerDuration?: number;
  /** Callback triggered on completion (increment/decrement/timer finish) */
  onComplete?: () => void;
}

export function CompleteControls({
  count,
  onIncrement,
  onDecrement,
  variant = "default",
  timerDuration,
  onComplete,
}: CompleteControlsProps) {
  // Timer state management
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerButtonRef = useRef<HTMLButtonElement>(null);

  // Handlers for increment/decrement with completion callback
  const handleIncrement = useCallback(() => {
    onIncrement();
    onComplete?.();
  }, [onIncrement, onComplete]);

  const handleDecrement = useCallback(() => {
    onDecrement();
    onComplete?.();
  }, [onDecrement, onComplete]);

  // Create custom X-shaped confetti particle
  const confettiShape = useMemo(() => confettiLib.shapeFromPath(xLogoPath), []);

  /**
   * Configures confetti animation options
   * @param origin Optional origin point for the confetti animation
   */
  const getConfettiOptions = useCallback(
    (origin?: { x: number; y: number }) => ({
      angle: 90 + (Math.random() - 0.5) * 90,
      particleCount: 17,
      spread: 45,
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

  // Initialize timer with duration in minutes converted to seconds
  const startTimer = useCallback(() => {
    if (timerDuration) {
      setTimeLeft(timerDuration * 60);
      setIsTimerRunning(true);
    }
  }, [timerDuration]);

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          // Trigger confetti at the timer button's position
          if (timerButtonRef.current) {
            const rect = timerButtonRef.current.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = rect.top / window.innerHeight;
            confettiLib(getConfettiOptions({ x, y }));
          }
          onIncrement();
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, onIncrement, getConfettiOptions, onComplete]);

  /**
   * Formats seconds into MM:SS display format
   */
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Timer mode with count = 0: Show start button
  if (timerDuration) {
    if (count === 0) {
      return (
        <div className="flex w-[96px] flex-col gap-px">
          <Button
            ref={timerButtonRef}
            variant={variant}
            size="sm"
            className="flex h-6 w-[96px] items-center justify-center text-xs"
            onClick={startTimer}
            disabled={isTimerRunning}
          >
            {isTimerRunning ? (
              <>
                <Timer className="h-3 w-3" />
                {formatTime(timeLeft)}
              </>
            ) : (
              "Start"
            )}
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
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-[72px] text-center font-medium">
            <NumberFlow value={count} format={{ style: "decimal" }} />
          </span>
          <Button
            ref={timerButtonRef}
            variant={variant}
            size="icon"
            className="aspect-square h-6 w-6 rounded-full p-0"
            onClick={startTimer}
            disabled={isTimerRunning}
          >
            {isTimerRunning ? (
              <span className="text-[10px] font-medium">{formatTime(timeLeft)}</span>
            ) : (
              <Timer className="h-4 w-4" />
            )}
          </Button>
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
        >
          Complete
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
        >
          <Plus className="h-4 w-4" />
        </ConfettiButton>
      </div>
    </div>
  );
}
