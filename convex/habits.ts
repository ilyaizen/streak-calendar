import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Creates a new habit for the authenticated user.
 * Each habit has a name, target frequency (times per week), and tracks creation time.
 */
export const create = mutation({
  args: {
    name: v.string(),
    targetFrequency: v.number(),
    calendarId: v.id('calendars'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Verify calendar belongs to user
    const calendar = await ctx.db.get(args.calendarId);
    if (!calendar || calendar.userId !== identity.subject) {
      throw new Error('Calendar not found');
    }

    return await ctx.db.insert('habits', {
      name: args.name,
      targetFrequency: args.targetFrequency,
      userId: identity.subject,
      calendarId: args.calendarId,
      createdAt: Date.now(),
    });
  },
});

/**
 * Retrieves all habits for the authenticated user.
 * Used for displaying the user's habit list.
 */
export const list = query({
  args: {
    calendarId: v.optional(v.id('calendars')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    let q = ctx.db.query('habits').filter((q) => q.eq(q.field('userId'), identity.subject));

    if (args.calendarId) {
      q = q.filter((q) => q.eq(q.field('calendarId'), args.calendarId));
    }

    return await q.collect();
  },
});

/**
 * Records a completion for a specific habit.
 * Verifies habit ownership before recording completion.
 */
export const markComplete = mutation({
  args: {
    habitId: v.id('habits'),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Verify habit belongs to user
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== identity.subject) {
      throw new Error('Habit not found');
    }

    const completionId = await ctx.db.insert('completions', {
      habitId: args.habitId,
      userId: identity.subject,
      completedAt: args.completedAt || Date.now(),
    });

    return completionId;
  },
});

/**
 * Retrieves habit completions within a specified date range.
 * Used for calendar views and streak calculations.
 */
export const getCompletions = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    return await ctx.db
      .query('completions')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .filter((q) => q.and(q.gte(q.field('completedAt'), args.startDate), q.lte(q.field('completedAt'), args.endDate)))
      .collect();
  },
});

/**
 * Calculates detailed statistics for a specific habit.
 * Includes current streak, longest streak, weekly progress, and total completions.
 */
export const getHabitStats = query({
  args: { habitId: v.id('habits') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Verify habit ownership
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== identity.subject) {
      throw new Error('Habit not found');
    }

    // Get all completions for this habit
    const completions = await ctx.db
      .query('completions')
      .filter((q) => q.eq(q.field('habitId'), args.habitId))
      .collect();

    // Sort completions by date (newest first) and normalize to start of day
    const sortedDates = completions.map((c) => new Date(c.completedAt).setHours(0, 0, 0, 0)).sort((a, b) => b - a);

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000; // 24 hours in milliseconds

    // Iterate through dates to find consecutive days
    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];

      // Break if first completion isn't today or yesterday
      if (i === 0 && date !== today && date !== yesterday) {
        break;
      }

      // Break if gap between dates is more than one day
      if (i > 0) {
        const prevDate = sortedDates[i - 1];
        if (prevDate - date > 86400000) {
          break;
        }
      }

      currentStreak++;
    }

    // Calculate longest streak
    let longestStreak = 0;
    let currentCount = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const diff = sortedDates[i - 1] - sortedDates[i];

      if (diff === 86400000) {
        // Consecutive days
        currentCount++;
      } else {
        // Break in streak, update longest if current is higher
        longestStreak = Math.max(longestStreak, currentCount);
        currentCount = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentCount);

    // Calculate this week's progress
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday = 0

    const weeklyCompletions = completions.filter((c) => c.completedAt >= startOfWeek.getTime()).length;
    const weeklyTarget = habit!.targetFrequency;
    const weeklyProgress = Math.min(weeklyCompletions / weeklyTarget, 1);

    return {
      currentStreak,
      longestStreak,
      totalCompletions: completions.length,
      weeklyCompletions,
      weeklyTarget,
      weeklyProgress,
    };
  },
});

/**
 * Deletes a habit and all its associated completions.
 * Ensures atomic deletion of both habit and completion records.
 */
export const deleteHabit = mutation({
  args: { habitId: v.id('habits') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Verify habit belongs to user
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== identity.subject) {
      throw new Error('Habit not found');
    }

    // Delete associated completions first
    await ctx.db
      .query('completions')
      .filter((q) => q.eq(q.field('habitId'), args.habitId))
      .collect()
      .then((completions) => {
        return Promise.all(completions.map((completion) => ctx.db.delete(completion._id)));
      });

    // Delete the habit
    await ctx.db.delete(args.habitId);
  },
});

/**
 * Updates the name of an existing habit.
 * Verifies habit ownership before allowing the update.
 */
export const renameHabit = mutation({
  args: {
    habitId: v.id('habits'),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Verify habit belongs to user
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== identity.subject) {
      throw new Error('Habit not found');
    }

    await ctx.db.patch(args.habitId, { name: args.name });
  },
});

// Add new mutation to delete a completion
export const deleteCompletion = mutation({
  args: { completionId: v.id('completions') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Verify completion belongs to user
    const completion = await ctx.db.get(args.completionId);
    if (!completion || completion.userId !== identity.subject) {
      throw new Error('Completion not found');
    }

    await ctx.db.delete(args.completionId);
  },
});

// Add new mutation
export const updateTargetFrequency = mutation({
  args: {
    habitId: v.id('habits'),
    targetFrequency: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== identity.subject) {
      throw new Error('Habit not found');
    }

    if (args.targetFrequency < 1 || args.targetFrequency > 7) {
      throw new Error('Target frequency must be between 1 and 7');
    }

    await ctx.db.patch(args.habitId, { targetFrequency: args.targetFrequency });
  },
});
