import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';

export const create = mutation({
  args: {
    name: v.string(),
    targetFrequency: v.number(),
  },
  handler: async (ctx, args) => {
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

export const markComplete = mutation({
  args: { habitId: v.id('habits') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    // Verify habit belongs to user
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== identity.subject) {
      throw new Error('Habit not found');
    }

    return await ctx.db.insert('completions', {
      habitId: args.habitId,
      userId: identity.subject,
      completedAt: Date.now(),
    });
  },
});

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

export const getHabitStats = query({
  args: { habitId: v.id('habits') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== identity.subject) {
      throw new Error('Habit not found');
    }

    // Get all completions for this habit
    const completions = await ctx.db
      .query('completions')
      .filter((q) => q.eq(q.field('habitId'), args.habitId))
      .collect();

    // Sort completions by date
    const sortedDates = completions.map((c) => new Date(c.completedAt).setHours(0, 0, 0, 0)).sort((a, b) => b - a);

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000; // 24 hours in milliseconds

    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];

      if (i === 0 && date !== today && date !== yesterday) {
        break;
      }

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
        currentCount++;
      } else {
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

export const getDashboardStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

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

    // Calculate completion rate
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

        // Calculate current streak
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
