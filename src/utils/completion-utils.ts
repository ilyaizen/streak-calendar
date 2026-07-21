import { Id } from "@server/convex/_generated/dataModel";

/**
 * Utility functions for handling habit completion calculations.
 * Provides date-based filtering and counting of habit completions.
 */

/**
 * Calculates the number of times a habit was completed on a specific date.
 *
 * @param date - The date to check completions for (in ISO string format)
 * @param habitId - The ID of the habit to check
 * @param completions - Array of completion records with habit IDs and timestamps
 * @returns Number of times the habit was completed on the specified date
 *
 * Note: Uses UTC for date boundaries for consistency across timezones
 */
export function getCompletionCount(
  date: string,
  habitId: Id<"habits">,
  completions:
    | Array<{
        habitId: Id<"habits">;
        completedAt: number;
      }>
    | null
    | undefined
) {
  if (!Array.isArray(completions)) return 0;

  // Use UTC for date boundaries
  const day = new Date(date);
  const dayStartTime = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0, 0);
  const dayEndTime = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 23, 59, 59, 999);

  return completions.filter(
    (completion) =>
      completion.habitId === habitId && completion.completedAt >= dayStartTime && completion.completedAt <= dayEndTime
  ).length;
}
