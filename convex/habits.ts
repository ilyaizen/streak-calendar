import { v } from "convex/values";

import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { internalMutation, mutation, query } from "./_generated/server";

/**
 * Habit management operations for tracking user habits within calendars.
 * This module provides CRUD operations for habits with position management and completion tracking.
 *
 * Key features:
 * - Position-based ordering within calendars
 * - Multiple completion tracking per day
 * - Cascading deletions (habit -> completions)
 * - Timer duration support for timed habits
 */

/**
 * Lists habits for the authenticated user, optionally filtered by calendar.
 * Results are sorted by position to maintain user-defined order.
 *
 * @param {Id<"calendars">} [calendarId] - Optional calendar ID to filter habits
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Doc<"habits">[]>} List of habits, sorted by position
 */
export const list = query({
  args: {
    calendarId: v.optional(v.id("calendars")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let q = ctx.db.query("habits").filter((q) => q.eq(q.field("userId"), identity.subject));

    if (args.calendarId) {
      q = q.filter((q) => q.eq(q.field("calendarId"), args.calendarId));
    }

    const habits = await q.collect();
    return habits.sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));
  },
});

/**
 * Creates a new habit in the specified calendar.
 * Automatically assigns a position value based on existing habits in the calendar.
 *
 * @param {string} name - Display name for the habit
 * @param {Id<"calendars">} calendarId - Calendar to create habit in
 * @param {number} [timerDuration] - Optional duration in milliseconds for timed habits
 * @throws {Error} If user is not authenticated or calendar not found/owned by user
 * @returns {Promise<Id<"habits">>} ID of the newly created habit
 */
export const create = mutation({
  args: {
    name: v.string(),
    calendarId: v.id("calendars"),
    timerDuration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify calendar belongs to user
    const calendar = await ctx.db.get(args.calendarId);
    if (!calendar || calendar.userId !== identity.subject) {
      throw new Error("Calendar not found");
    }

    // Get max position for this calendar
    const habits = await ctx.db
      .query("habits")
      .filter((q) => q.eq(q.field("calendarId"), args.calendarId))
      .collect();

    const maxPosition = habits.reduce((max, habit) => Math.max(max, habit.position || 0), 0);

    return await ctx.db.insert("habits", {
      name: args.name,
      userId: identity.subject,
      calendarId: args.calendarId,
      timerDuration: args.timerDuration,
      position: maxPosition + 1,
    });
  },
});

/**
 * Marks a habit as complete for a specific date, with support for multiple completions per day.
 * Can increase or decrease completion count for the specified date.
 *
 * @param {Id<"habits">} habitId - Habit to mark complete
 * @param {number} completedAt - Timestamp for the completion
 * @param {number} [count] - Optional target completion count, if not provided increments by 1
 * @throws {Error} If user is not authenticated or habit not found/owned by user
 */
export const markComplete = mutation({
  args: {
    habitId: v.id("habits"),
    completedAt: v.number(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Verify habit belongs to user
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== identity.subject) {
      throw new Error("Habit not found");
    }

    // Get all completions for this habit on this date
    const date = new Date(args.completedAt);
    date.setHours(0, 0, 0, 0);
    const startOfDay = date.getTime();
    date.setHours(23, 59, 59, 999);
    const endOfDay = date.getTime();

    const existingCompletions = await ctx.db
      .query("completions")
      .filter((q) => q.eq(q.field("habitId"), args.habitId))
      .filter((q) => q.and(q.gte(q.field("completedAt"), startOfDay), q.lte(q.field("completedAt"), endOfDay)))
      .collect();

    const currentCount = existingCompletions.length;
    // If count is provided, use it directly. Otherwise increment by 1
    const targetCount = args.count ?? currentCount + 1;

    if (targetCount < currentCount) {
      // Remove completions from the end until we reach target count
      const numToRemove = currentCount - targetCount;
      const toRemove = existingCompletions.slice(-numToRemove);
      await Promise.all(toRemove.map((completion) => ctx.db.delete(completion._id)));
    } else if (targetCount > currentCount) {
      // Check if the completion is for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isToday = date.getTime() === today.getTime();

      // Use current timestamp for today's completions, otherwise use the provided date
      const baseTimestamp = isToday ? Date.now() : args.completedAt;

      const newCompletions = Array.from({ length: targetCount - currentCount }, (_, index) => ({
        habitId: args.habitId,
        userId: identity.subject,
        completedAt: baseTimestamp + index * 1000, // Add 1 second between each completion if multiple
      }));
      await Promise.all(newCompletions.map((completion) => ctx.db.insert("completions", completion)));
    }

    return null;
  },
});

/**
 * Response type for paginated completion queries
 */
type CompletionsResponse = {
  completions: Doc<"completions">[];
  cursor: string | null;
  hasMore: boolean;
};

/**
 * Retrieves paginated completions within a date range.
 * Uses the by_user_and_date index for efficient querying.
 *
 * @param {number} startDate - Start of date range (timestamp)
 * @param {number} endDate - End of date range (timestamp)
 * @param {string} [cursor] - Pagination cursor from previous query
 * @param {number} [limit] - Max completions to return (default 100, max 100)
 * @throws {Error} If user is not authenticated
 * @returns {Promise<CompletionsResponse>} Paginated completions with cursor
 */
export const getCompletions = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<CompletionsResponse> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Use a high limit to get all completions in one query for now
    // TODO: Implement proper pagination in the UI later
    const limit = 10000;

    const queryBuilder = ctx.db
      .query("completions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", identity.subject).gte("completedAt", args.startDate).lte("completedAt", args.endDate)
      )
      .order("desc");

    const page = await queryBuilder.paginate({ numItems: limit, cursor: args.cursor ?? null });

    return {
      completions: page.page,
      cursor: page.continueCursor,
      hasMore: page.isDone === false,
    };
  },
});

/**
 * Updates a habit's properties including name, timer duration, calendar, and position.
 * Handles position management when moving habits within or between calendars.
 *
 * Position update scenarios:
 * 1. Moving to different calendar: Place at end of target calendar
 * 2. Moving within same calendar: Adjust positions of habits in between
 * 3. No position change: Update other properties only
 *
 * @param {Id<"habits">} id - Habit ID to update
 * @param {string} name - New habit name
 * @param {number} [timerDuration] - Optional new timer duration
 * @param {Id<"calendars">} calendarId - Calendar to move/keep habit in
 * @param {number} [position] - Optional new position in calendar
 * @throws {Error} If user not authenticated, habit/calendar not found, or invalid position
 */
export const update = mutation({
  args: {
    id: v.id("habits"),
    name: v.string(),
    timerDuration: v.optional(v.number()),
    calendarId: v.id("calendars"),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const habit = await ctx.db.get(args.id);
    if (!habit || habit.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Verify calendar belongs to user
    const calendar = await ctx.db.get(args.calendarId);
    if (!calendar || calendar.userId !== identity.subject) {
      throw new Error("Calendar not found");
    }

    // Handle position update if provided or if calendar changed
    if (args.position !== undefined || args.calendarId !== habit.calendarId) {
      const habits = await ctx.db
        .query("habits")
        .filter((q) => q.eq(q.field("calendarId"), args.calendarId))
        .collect();

      // Calculate new position based on scenario
      let newPosition: number;
      if (args.calendarId !== habit.calendarId) {
        // Moving to different calendar - put at end
        newPosition = habits.length + 1;
      } else if (args.position !== undefined) {
        // Staying in same calendar with specified position
        newPosition = args.position;
      } else {
        // Staying in same calendar without position - keep current
        newPosition = habit.position ?? habits.length + 1;
      }

      // Validate position
      if (newPosition < 1 || newPosition > habits.length + 1) {
        throw new Error("Invalid position");
      }

      // Update positions of other habits if needed
      const oldPosition = habit.position ?? 0;

      if (args.calendarId === habit.calendarId && oldPosition !== newPosition) {
        if (oldPosition < newPosition) {
          // Moving down: decrease positions of habits in between
          for (const h of habits) {
            const hPos = h.position ?? 0;
            if (hPos > oldPosition && hPos <= newPosition) {
              await ctx.db.patch(h._id, { position: hPos - 1 });
            }
          }
        } else {
          // Moving up: increase positions of habits in between
          for (const h of habits) {
            const hPos = h.position ?? 0;
            if (hPos >= newPosition && hPos < oldPosition) {
              await ctx.db.patch(h._id, { position: hPos + 1 });
            }
          }
        }
      }

      // Update the habit with new position
      await ctx.db.patch(args.id, {
        name: args.name,
        timerDuration: args.timerDuration,
        calendarId: args.calendarId,
        position: newPosition,
      });
      return;
    }

    // Update the habit's properties without position change
    await ctx.db.patch(args.id, {
      name: args.name,
      timerDuration: args.timerDuration,
      calendarId: args.calendarId,
      ...(args.position !== undefined && { position: args.position }),
    });
  },
});

/**
 * Removes a habit and all its completions.
 * Performs cascading deletion in this order:
 * 1. Delete all completions for the habit
 * 2. Delete the habit itself
 *
 * @param {Id<"habits">} id - Habit ID to delete
 * @throws {Error} If user not authenticated or habit not found/owned by user
 */
export const remove = mutation({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const habit = await ctx.db.get(args.id);
    if (!habit || habit.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    // Delete all completions for this habit
    const completions = await ctx.db
      .query("completions")
      .filter((q) => q.eq(q.field("habitId"), args.id))
      .collect();

    await Promise.all(completions.map((completion) => ctx.db.delete(completion._id)));

    // Delete the habit
    await ctx.db.delete(args.id);
  },
});

/**
 * Retrieves a single habit by ID.
 * Note: This query doesn't check ownership, as it's typically used after list()
 * which already filters by user.
 *
 * @param {Id<"habits">} id - Habit ID to retrieve
 * @throws {Error} If habit not found
 * @returns {Promise<Doc<"habits">>} The requested habit
 */
export const get = query({
  args: { id: v.id("habits") },
  handler: async (ctx, args) => {
    const habit = await ctx.db.get(args.id);
    if (!habit) throw new Error("Habit not found");
    return habit;
  },
});

export const scheduleHabitIncrement = mutation({
  args: {
    habitId: v.id("habits"),
    durationMs: v.number(),
    clientNow: v.number(),
  },
  handler: async (ctx, args): Promise<Id<"_scheduled_functions">> => {
    console.log("Starting schedule mutation for habit:", args.habitId);

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== identity.subject) {
      console.error("Habit not found or unauthorized:", args.habitId);
      throw new Error("Habit not found or unauthorized");
    }

    const serverNow = Date.now();
    const timeDrift = serverNow - args.clientNow;
    const completionTime = serverNow + args.durationMs - timeDrift;
    console.log("Scheduling with:", {
      clientNow: args.clientNow,
      serverNow,
      timeDrift,
      scheduledDelay: args.durationMs - timeDrift,
      completionTime,
    });

    if (habit.scheduledTimer) {
      console.log("Cancelling existing timer:", habit.scheduledTimer);
      await ctx.scheduler.cancel(habit.scheduledTimer);
    }

    try {
      const scheduledId = await ctx.scheduler.runAfter(
        args.durationMs - timeDrift,
        internal.habits.incrementHabitCount,
        {
          habitId: args.habitId,
          completionTime,
        }
      );
      console.log("Scheduled successfully with ID:", scheduledId);

      await ctx.db.patch(args.habitId, {
        scheduledTimer: scheduledId,
        timerEnd: completionTime,
      });
      console.log("Updated habit with scheduled timer");

      return scheduledId;
    } catch {
      throw new Error("Failed to schedule timer");
    }
  },
});

export const cancelScheduledIncrement = mutation({
  args: { habitId: v.id("habits") },
  handler: async (ctx, { habitId }) => {
    const habit = await ctx.db.get(habitId);
    if (!habit || !habit.scheduledTimer) return;

    // Cancel the scheduled job
    await ctx.scheduler.cancel(habit.scheduledTimer);

    // Update the habit document
    await ctx.db.patch(habitId, {
      scheduledTimer: undefined,
      timerEnd: undefined,
    });
  },
});

export const incrementHabitCount = internalMutation({
  args: {
    habitId: v.id("habits"),
    completionTime: v.number(),
  },
  handler: async (ctx, { habitId, completionTime }) => {
    const habit = await ctx.db.get(habitId);
    if (!habit) throw new Error("Habit not found");

    // Use the pre-calculated completion time
    await ctx.db.insert("completions", {
      habitId,
      userId: habit.userId,
      completedAt: completionTime,
    });

    await ctx.db.patch(habitId, {
      scheduledTimer: undefined,
      timerEnd: undefined,
    });
  },
});
