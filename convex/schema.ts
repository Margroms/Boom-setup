// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Table for different kitchen locations
  kitchens: defineTable({
    name: v.string(),
  }),

  // Table for menu items, linked to a specific kitchen
  menuItems: defineTable({
    name: v.string(),
    price: v.number(),
    kitchenId: v.id("kitchens"), // This creates a relationship to the 'kitchens' table
  }).index("by_kitchen", ["kitchenId"]), // An index for quickly finding items by kitchen

  // Table for customer orders
  orders: defineTable({
    kitchenId: v.id("kitchens"),
    // An array of objects, where each object is an item in the order
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        name: v.string(), // Storing name and price here avoids extra lookups
        quantity: v.number(),
        price: v.number(),
      })
    ),
    totalAmount: v.number(),
    // The order's status must be one of these specific strings
    status: v.union(
      v.literal("placed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served")
    ),
  }).index("by_kitchen", ["kitchenId"]), // Index for quickly finding orders by kitchen
});