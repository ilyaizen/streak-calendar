import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

/**
 * Calendar operations for managing user calendars and their associated habits/completions.
 * This module provides CRUD operations for calendars with proper position management and cascading deletions.
 *
 * Key features:
 * - Position-based ordering of calendars
 * - Cascading deletions (calendar -> habits -> completions)
 * - User-specific calendar management
 * - Authentication checks on all operations
 */

/**
 * Retrieves all calendars for the authenticated user, ordered by position ascending.
 * This ensures calendars maintain their user-defined order in the UI.
 *
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Calendar[]>} List of calendars owned by the user
 */
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db
      .query("calendars")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("asc")
      .collect();
  },
});

/**
 * Creates a new calendar with specified name and color theme.
 * Automatically assigns a position value based on existing calendars count.
 *
 * @param {string} name - Display name for the calendar
 * @param {string} colorTheme - Color theme identifier for UI customization
 * @throws {Error} If user is not authenticated
 * @returns {Promise<Id<"calendars">>} ID of the newly created calendar
 */
export const create = mutation({
  args: {
    name: v.string(),
    colorTheme: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Position is 1-based and determined by number of existing calendars
    const existingCalendars = await ctx.db
      .query("calendars")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return await ctx.db.insert("calendars", {
      name: args.name,
      userId: identity.subject,
      colorTheme: args.colorTheme,
      position: existingCalendars.length + 1,
    });
  },
});

/**
 * Removes a calendar and all associated data in a specific order to maintain referential integrity.
 * Performs cascading deletion in this order:
 * 1. Deletes all completions for each habit in the calendar
 * 2. Deletes all habits belonging to the calendar
 * 3. Updates positions of remaining calendars to maintain order
 * 4. Deletes the calendar itself
 *
 * @param {Id<"calendars">} id - ID of calendar to delete
 * @throws {Error} If user is not authenticated or calendar not found/owned by user
 */
export const remove = mutation({
  args: {
    id: v.id("calendars"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const calendar = await ctx.db.get(args.id);
    if (!calendar || calendar.userId !== identity.subject) {
      throw new Error("Calendar not found");
    }

    // Step 1 & 2: Delete habits and their completions
    const habits = await ctx.db
      .query("habits")
      .filter((q) => q.eq(q.field("calendarId"), args.id))
      .collect();

    const habitIds = habits.map((h) => h._id);

    // Batch-delete all completions for these habits in one query per habit
    // (Convex mutations are atomic within a single mutation call)
    for (const habitId of habitIds) {
      const completions = await ctx.db
        .query("completions")
        .filter((q) => q.eq(q.field("habitId"), habitId))
        .collect();

      await Promise.all(completions.map((c) => ctx.db.delete(c._id)));
    }

    // Delete all habits
    await Promise.all(habitIds.map((id) => ctx.db.delete(id)));

    // Step 3: Update positions of remaining calendars
    const allCalendars = await ctx.db
      .query("calendars")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const deletedPosition = calendar.position ?? allCalendars.length;

    // Decrement position of all calendars that were after the deleted one
    for (const otherCalendar of allCalendars) {
      if (otherCalendar._id === args.id) continue;

      const currentPosition = otherCalendar.position ?? allCalendars.length;
      if (currentPosition > deletedPosition) {
        await ctx.db.patch(otherCalendar._id, { position: currentPosition - 1 });
      }
    }

    // Step 4: Delete the calendar
    await ctx.db.delete(args.id);
  },
});

/**
 * Updates a calendar's properties including its position in the list.
 * When position changes, other calendars' positions are adjusted to maintain order.
 *
 * Position update logic:
 * - Moving down: Decrement positions of calendars between old and new position
 * - Moving up: Increment positions of calendars between new and old position
 *
 * @param {Id<"calendars">} id - Calendar ID to update
 * @param {string} name - New calendar name
 * @param {string} colorTheme - New color theme
 * @param {number} position - New position in the list
 * @throws {Error} If user is not authenticated or calendar not found/owned by user
 */
export const update = mutation({
  args: {
    id: v.id("calendars"),
    name: v.string(),
    colorTheme: v.string(),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const calendar = await ctx.db.get(args.id);
    if (!calendar || calendar.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    const allCalendars = await ctx.db
      .query("calendars")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Handle position updates if position changed
    if (calendar.position !== args.position) {
      const oldPosition = calendar.position ?? allCalendars.length;
      const newPosition = args.position;

      for (const otherCalendar of allCalendars) {
        if (otherCalendar._id === args.id) continue;

        const currentPosition = otherCalendar.position ?? allCalendars.length;
        if (oldPosition < newPosition) {
          // Moving down: shift affected calendars up
          if (currentPosition > oldPosition && currentPosition <= newPosition) {
            await ctx.db.patch(otherCalendar._id, { position: currentPosition - 1 });
          }
        } else {
          // Moving up: shift affected calendars down
          if (currentPosition >= newPosition && currentPosition < oldPosition) {
            await ctx.db.patch(otherCalendar._id, { position: currentPosition + 1 });
          }
        }
      }
    }

    // Update the calendar's properties
    await ctx.db.patch(args.id, {
      name: args.name,
      colorTheme: args.colorTheme,
      position: args.position,
    });
  },
});

/**
 * Retrieves a single calendar by ID.
 * Verifies the requesting user owns the calendar.
 *
 * @param {Id<"calendars">} id - Calendar ID to retrieve
 * @throws {Error} If user not authenticated or calendar not found/owned by user
 * @returns {Promise<Calendar>} The requested calendar
 */
export const get = query({
  args: { id: v.id("calendars") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const calendar = await ctx.db.get(args.id);
    if (!calendar || calendar.userId !== identity.subject) throw new Error("Calendar not found");
    return calendar;
  },
});
