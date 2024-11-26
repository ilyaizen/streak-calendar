import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  calendars: defineTable({
    name: v.string(),
    userId: v.string(),
    colorTheme: v.string(),
    isDefault: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  habits: defineTable({
    name: v.string(),
    targetFrequency: v.number(),
    userId: v.string(),
    calendarId: v.optional(v.id("calendars")),
    createdAt: v.number(),
  }).index("by_calendar", ["calendarId"]),

  completions: defineTable({
    habitId: v.id("habits"),
    userId: v.string(),
    completedAt: v.number(),
  }).index("by_habit", ["habitId"]),
});
