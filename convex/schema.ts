import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  habits: defineTable({
    name: v.string(),
    targetFrequency: v.number(),
    userId: v.string(),
    createdAt: v.number(),
  }),
  completions: defineTable({
    habitId: v.id('habits'),
    userId: v.string(),
    completedAt: v.number(), // Unix timestamp
  }).index('by_habit', ['habitId']),
});
