/* eslint-disable check-file/filename-naming-convention */
import { v } from "convex/values";

import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

/**
 * Exports all user's calendars with their habits and completions.
 * Structure:
 * {
 *   calendars: [{
 *     name: string,
 *     colorTheme: string,
 *     habits: [{
 *       name: string,
 *       completions: [{ completedAt: number }]
 *     }]
 *   }]
 * }
 */

export const exportCalendarsAndHabits = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const calendars = await ctx.db
      .query("calendars")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const allHabits = await ctx.db
      .query("habits")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Build the export structure without _id fields
    const exportedCalendars = calendars.map((calendar) => {
      const calendarHabits = allHabits.filter((h) => h.calendarId === calendar._id);
      const exportedHabits = calendarHabits.map((habit) => ({
        name: habit.name,
        position: habit.position,
        timerDuration: habit.timerDuration,
        completions: [], // Will be filled by exportCompletions
      }));

      return {
        name: calendar.name,
        colorTheme: calendar.colorTheme,
        position: calendar.position,
        habits: exportedHabits,
      };
    });

    return { calendars: exportedCalendars };
  },
});

export const exportCompletions = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { completionsByHabit: {} };

    try {
      // Get all habits first to map IDs to names
      const habits = await ctx.db
        .query("habits")
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .collect();

      const habitIdToName = new Map(habits.map((h) => [h._id, h.name]));

      // Get all completions
      const completions = await ctx.db
        .query("completions")
        .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject))
        .collect();

      // Group completions by habit name
      const completionsByHabit = new Map();
      for (const completion of completions) {
        const habitName = habitIdToName.get(completion.habitId);
        if (!habitName) continue;

        const encodedName = encodeURIComponent(habitName);
        const habitCompletions = completionsByHabit.get(encodedName) || [];
        habitCompletions.push({ completedAt: completion.completedAt });
        completionsByHabit.set(encodedName, habitCompletions);
      }

      return { completionsByHabit: Object.fromEntries(completionsByHabit) };
    } catch (error) {
      console.error("Error in exportCompletions:", error);
      return { completionsByHabit: {} };
    }
  },
});

/**
 * Imports calendar data with habits and completions.
 * For existing calendars (matched by name):
 * - Updates the calendar's color theme
 * - Adds new habits or updates existing ones
 * - Adds only new completions (avoids duplicates)
 *
 * For new calendars:
 * - Creates the calendar with all habits and completions
 */
export const importData = mutation({
  args: {
    data: v.object({
      calendars: v.array(
        v.object({
          name: v.string(),
          colorTheme: v.string(),
          position: v.optional(v.number()),
          habits: v.array(
            v.object({
              name: v.string(),
              timerDuration: v.optional(v.number()),
              position: v.optional(v.number()),
              completions: v.array(v.object({ completedAt: v.number() })),
            })
          ),
        })
      ),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { calendars } = args.data;

    // Size limits to prevent resource exhaustion
    if (calendars.length > 50) throw new Error("Too many calendars (max 50)");
    const totalHabits = calendars.reduce((sum, c) => sum + c.habits.length, 0);
    if (totalHabits > 200) throw new Error("Too many habits (max 200)");
    const totalCompletions = calendars.reduce(
      (sum, c) => sum + c.habits.reduce((hSum, h) => hSum + h.completions.length, 0),
      0
    );
    if (totalCompletions > 10000) throw new Error("Too many completions (max 10,000)");

    // Clean the input data to only use fields we need
    const cleanedCalendars = args.data.calendars.map((calendar) => ({
      ...calendar,
      habits: calendar.habits.map((habit) => ({
        name: habit.name,
        timerDuration: "timerDuration" in habit ? habit.timerDuration : undefined,
        position: "position" in habit ? habit.position : undefined,
        completions: "completions" in habit ? habit.completions : [],
      })),
    }));

    const existingCalendars = await ctx.db
      .query("calendars")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Continue with the rest of the import using cleanedCalendars
    const sortedCalendars = [...cleanedCalendars].sort((a, b) => (a.position ?? Infinity) - (b.position ?? Infinity));

    for (const calendarData of sortedCalendars) {
      const existingCalendar = existingCalendars.find((cal) => cal.name === calendarData.name);
      const calendarId = existingCalendar?._id;

      if (calendarId) {
        // Update existing calendar
        await ctx.db.patch(calendarId, {
          colorTheme: calendarData.colorTheme,
          position: calendarData.position,
        });

        const existingHabits = await ctx.db
          .query("habits")
          .filter((q) => q.eq(q.field("calendarId"), calendarId))
          .collect();

        const sortedHabits = [...calendarData.habits].sort(
          (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)
        );

        for (const habitData of sortedHabits) {
          const { name, completions, timerDuration, position } = habitData;

          const existingHabit = existingHabits.find((h) => h.name === name);
          let habitId: Id<"habits">;

          if (existingHabit) {
            habitId = existingHabit._id;
            await ctx.db.patch(habitId, {
              position: position ?? existingHabits.indexOf(existingHabit) + 1,
              timerDuration,
            });
          } else {
            habitId = await ctx.db.insert("habits", {
              name,
              userId: identity.subject,
              calendarId,
              timerDuration,
              position: position ?? existingHabits.length + 1,
            });
          }

          // Process completions in batches of 100
          const existingCompletions = await ctx.db
            .query("completions")
            .filter((q) => q.eq(q.field("habitId"), habitId))
            .collect();

          const existingCompletionTimes = new Set(existingCompletions.map((c) => c.completedAt));

          // Process completions in chunks of 100
          for (let i = 0; i < completions.length; i += 100) {
            const batch = completions.slice(i, i + 100);
            const newCompletions = batch.filter(
              (c: { completedAt: number }) => !existingCompletionTimes.has(c.completedAt)
            );

            if (newCompletions.length > 0) {
              await Promise.all(
                newCompletions.map((completion: { completedAt: number }) =>
                  ctx.db.insert("completions", {
                    habitId,
                    userId: identity.subject,
                    completedAt: completion.completedAt,
                  })
                )
              );
            }
          }
        }
      } else {
        // Create new calendar
        const newCalendarId = await ctx.db.insert("calendars", {
          name: calendarData.name,
          userId: identity.subject,
          colorTheme: calendarData.colorTheme,
          position: calendarData.position ?? existingCalendars.length + 1,
        });

        const sortedHabits = [...calendarData.habits].sort(
          (a, b) => (a.position ?? Infinity) - (b.position ?? Infinity)
        );

        for (const habitData of sortedHabits) {
          const { name, completions, timerDuration, position } = habitData;

          const habitId = await ctx.db.insert("habits", {
            name,
            userId: identity.subject,
            calendarId: newCalendarId,
            timerDuration,
            position: position ?? calendarData.habits.indexOf(habitData) + 1,
          });

          // Process completions in batches of 100
          for (let i = 0; i < completions.length; i += 100) {
            const batch = completions.slice(i, i + 100);
            await Promise.all(
              batch.map((completion: { completedAt: number }) =>
                ctx.db.insert("completions", {
                  habitId,
                  userId: identity.subject,
                  completedAt: completion.completedAt,
                })
              )
            );
          }
        }
      }
    }
  },
});
