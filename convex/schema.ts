import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Database schema for the streak calendar application.
 * Defines the structure of tables and their relationships for tracking habits,
 * calendars, and completion records.
 */

export default defineSchema({
  // Stores calendar configurations for users
  // Each user can have multiple calendars with different themes
  calendars: defineTable({
    name: v.string(), // Display name of the calendar
    userId: v.string(), // Owner of the calendar
    colorTheme: v.string(), // Theme identifier for calendar styling
    position: v.optional(v.number()), // Optional display order in the UI
  }).index("by_user", ["userId"]), // Index to quickly fetch user's calendars

  // Stores habit definitions that users want to track
  // Each habit belongs to a specific calendar
  habits: defineTable({
    name: v.string(), // Display name of the habit
    userId: v.string(), // Owner of the habit
    calendarId: v.id("calendars"), // Reference to parent calendar
    timerDuration: v.optional(v.number()), // Optional duration for timed habits (in seconds)
    position: v.optional(v.number()), // Optional display order in the UI
    scheduledTimer: v.optional(v.id("_scheduled_functions")),
    timerEnd: v.optional(v.number()),
  })
    .index("by_calendar", ["calendarId"])
    .index("scheduledTimer", ["scheduledTimer"]), // Index to fetch habits for a calendar

  // Records each time a habit is completed
  // Tracks the completion history for streak calculations
  completions: defineTable({
    habitId: v.id("habits"), // Reference to the completed habit
    userId: v.string(), // User who completed the habit
    completedAt: v.number(), // Timestamp of completion (Unix timestamp)
  })
    .index("by_habit", ["habitId"]) // Index to fetch all completions for a habit
    .index("by_user_and_date", ["userId", "completedAt"]), // Index for date-based queries
});
