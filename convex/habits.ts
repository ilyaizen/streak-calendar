import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';

/**
 * Creates a new habit for the authenticated user.
 * Each habit has a name, target frequency (times per week), and tracks creation time.
 */
export const create = mutation({
  args: {
    name: v.string(),
    targetFrequency: v.number(),
  },
  handler: async (ctx, args) => {
    // Verify user authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    return await ctx.db.insert('habits', {
      name: args.name,
      targetFrequency: args.targetFrequency,
      userId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

/**
 * Retrieves all habits for the authenticated user.
 * Used for displaying the user's habit list.
 */
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    return await ctx.db
      .query('habits')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .collect();
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

/**
 * Generates comprehensive dashboard statistics for all habits.
 * Includes weekly completions, trends, best streaks, and per-habit stats.
 */
export const getDashboardStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Fetch all habits and completions for the user
    const habits = await ctx.db
      .query('habits')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .collect();

    const completions = await ctx.db
      .query('completions')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .collect();

    // Calculate weekly completions (last 7 days)
    const weekStart = startOfWeek(new Date()).getTime();
    const weeklyCompletions = completions.filter((c) => c.completedAt >= weekStart).length;

    // Calculate overall completion rate
    const totalPossibleCompletions = habits.reduce((acc, habit) => acc + habit.targetFrequency, 0);
    const completionRate = totalPossibleCompletions > 0 ? weeklyCompletions / totalPossibleCompletions : 0;

    // Find best streak across all habits
    const bestStreak = Math.max(
      ...habits.map((habit) => {
        const habitCompletions = completions
          .filter((c) => c.habitId === habit._id)
          .map((c) => new Date(c.completedAt).setHours(0, 0, 0, 0))
          .sort((a, b) => a - b);

        let maxStreak = 0;
        let currentStreak = 1;

        // Calculate longest streak for this habit
        for (let i = 1; i < habitCompletions.length; i++) {
          if (habitCompletions[i] - habitCompletions[i - 1] === 86400000) {
            currentStreak++;
          } else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
          }
        }
        return Math.max(maxStreak, currentStreak);
      }),
      0
    );

    // Generate weekly trend data (last 8 weeks)
    const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(new Date(), i)).getTime();
      const weekEnd = endOfWeek(subWeeks(new Date(), i)).getTime();

      return {
        week: weekStart,
        completions: completions.filter((c) => c.completedAt >= weekStart && c.completedAt <= weekEnd).length,
      };
    }).reverse();

    // Calculate per-habit statistics
    const habitStats = await Promise.all(
      habits.map(async (habit) => {
        const habitCompletions = completions.filter((c) => c.habitId === habit._id);
        const weeklyTarget = habit.targetFrequency;
        const actualCompletions = habitCompletions.filter((c) => c.completedAt >= weekStart).length;
        const completionRate = weeklyTarget > 0 ? actualCompletions / weeklyTarget : 0;

        // Calculate current streak for this habit
        const sortedDates = habitCompletions
          .map((c) => new Date(c.completedAt).setHours(0, 0, 0, 0))
          .sort((a, b) => b - a);

        let currentStreak = 0;
        const today = new Date().setHours(0, 0, 0, 0);
        const yesterday = today - 86400000;

        for (let i = 0; i < sortedDates.length; i++) {
          const date = sortedDates[i];
          if (i === 0 && date !== today && date !== yesterday) break;
          if (i > 0 && sortedDates[i - 1] - date > 86400000) break;
          currentStreak++;
        }

        return {
          id: habit._id,
          name: habit.name,
          targetFrequency: habit.targetFrequency,
          currentStreak,
          completionRate,
        };
      })
    );

    return {
      weeklyCompletions,
      completionRate,
      bestStreak,
      weeklyTrend,
      habitStats,
    };
  },
});

/**
 * Generates detailed statistics for the stats page.
 * Includes time-of-day analysis, day-of-week patterns, and per-habit performance.
 */
export const getDetailedStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Get all habits and completions
    const habits = await ctx.db
      .query('habits')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .collect();

    const completions = await ctx.db
      .query('completions')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .collect();

    // Calculate day of week distribution
    const dayDistribution = Array(7).fill(0);
    completions.forEach((completion) => {
      const day = new Date(completion.completedAt).getDay();
      dayDistribution[day]++;
    });

    // Find most productive day
    const mostProductiveDay = dayDistribution.indexOf(Math.max(...dayDistribution));

    // Calculate time of day distribution
    const timeDistribution = {
      morning: 0, // 6-12
      afternoon: 0, // 12-17
      evening: 0, // 17-22
      night: 0, // 22-6
    };

    completions.forEach((completion) => {
      const hour = new Date(completion.completedAt).getHours();
      if (hour >= 6 && hour < 12) timeDistribution.morning++;
      else if (hour >= 12 && hour < 17) timeDistribution.afternoon++;
      else if (hour >= 17 && hour < 22) timeDistribution.evening++;
      else timeDistribution.night++;
    });

    // Calculate perfect days (all habits completed)
    const dailyCompletions = new Map<string, Set<string>>();
    completions.forEach((completion) => {
      const dateKey = new Date(completion.completedAt).toDateString();
      if (!dailyCompletions.has(dateKey)) {
        dailyCompletions.set(dateKey, new Set());
      }
      dailyCompletions.get(dateKey)?.add(completion.habitId);
    });

    const perfectDays = Array.from(dailyCompletions.values()).filter(
      (habitsCompleted) => habitsCompleted.size === habits.length
    ).length;

    // Calculate per-habit statistics
    const habitStats = await Promise.all(
      habits.map(async (habit) => {
        const habitCompletions = completions.filter((c) => c.habitId === habit._id);

        // Calculate success rate
        const totalDays = Math.ceil((Date.now() - habit.createdAt) / (1000 * 60 * 60 * 24));
        const successRate = habitCompletions.length / (totalDays * (habit.targetFrequency / 7));

        // Find best time of day
        const timeCount = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        habitCompletions.forEach((completion) => {
          const hour = new Date(completion.completedAt).getHours();
          if (hour >= 6 && hour < 12) timeCount.morning++;
          else if (hour >= 12 && hour < 17) timeCount.afternoon++;
          else if (hour >= 17 && hour < 22) timeCount.evening++;
          else timeCount.night++;
        });

        const bestTimeOfDay = Object.entries(timeCount).reduce((a, b) => (b[1] > a[1] ? b : a))[0];

        // Find best day of week
        const dayCount = Array(7).fill(0);
        habitCompletions.forEach((completion) => {
          const day = new Date(completion.completedAt).getDay();
          dayCount[day]++;
        });
        const bestDay = dayCount.indexOf(Math.max(...dayCount));

        return {
          id: habit._id,
          name: habit.name,
          successRate,
          bestTimeOfDay: bestTimeOfDay.charAt(0).toUpperCase() + bestTimeOfDay.slice(1),
          bestDay,
        };
      })
    );

    // Calculate average daily completions
    const totalDays = Math.ceil((Date.now() - Math.min(...habits.map((h) => h.createdAt))) / (1000 * 60 * 60 * 24));
    const averageDailyCompletions = completions.length / totalDays;

    // Calculate current streak (days with at least one completion)
    let currentStreak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    const sortedDates = Array.from(dailyCompletions.keys())
      .map((date) => new Date(date).getTime())
      .sort((a, b) => b - a);

    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      if (i === 0 && date !== today && date !== today - 86400000) break;
      if (i > 0 && sortedDates[i - 1] - date > 86400000) break;
      currentStreak++;
    }

    return {
      dayDistribution,
      timeDistribution,
      mostProductiveDay,
      perfectDays,
      currentStreak,
      averageDailyCompletions,
      habitStats,
    };
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
