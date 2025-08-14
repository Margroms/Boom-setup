// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Better Auth requires a users table with app-specific fields
  users: defineTable({
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal('SUPER_ADMIN'), v.literal('KITCHEN'), v.literal('CUSTOMER'))),
    brandSlug: v.optional(v.string()),
    // Optional binding of a user to a specific kitchen
    kitchenId: v.optional(v.id('kitchens')),
    createdAt: v.optional(v.number()),
  }).index('by_email', ['email']),

  // Table for different kitchen locations
  kitchens: defineTable({
    name: v.string(),
    brandSlug: v.optional(v.string()), // 'nippu-kodi' | 'el-chaplo' | 'booms-pizza'
  }),

  // Table for menu items, linked to a specific kitchen
  menuItems: defineTable({
    name: v.string(),
    price: v.number(),
    kitchenId: v.id("kitchens"), // This creates a relationship to the 'kitchens' table
    imageUrl: v.optional(v.string()),
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

  // Discounts: can apply globally, by brand slug, or by kitchen
  discounts: defineTable({
    code: v.string(),
    scope: v.union(v.literal("GLOBAL"), v.literal("BRAND"), v.literal("KITCHEN")),
    brandSlug: v.optional(v.string()),
    kitchenId: v.optional(v.id("kitchens")),
    description: v.optional(v.string()),
    type: v.union(v.literal("PERCENT"), v.literal("AMOUNT")),
    value: v.number(), // percent as 0-100 for PERCENT; currency units for AMOUNT
    startsAt: v.optional(v.number()), // epoch ms
    endsAt: v.optional(v.number()),
    maxRedemptions: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    createdAt: v.optional(v.number()),
  })
    .index("by_code", ["code"]) 
    .index("by_scope_brand", ["scope", "brandSlug"]) 
    .index("by_scope_kitchen", ["scope", "kitchenId"]),

  // Transactions ledger (no provider integration yet)
  transactions: defineTable({
    kitchenId: v.optional(v.id("kitchens")),
    brandSlug: v.optional(v.string()),
    amount: v.number(),
    currency: v.optional(v.string()),
    status: v.union(
      v.literal("PENDING"),
      v.literal("SUCCESS"),
      v.literal("FAILED"),
      v.literal("CANCELLED")
    ),
    idempotencyKey: v.string(),
    notes: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_idem", ["idempotencyKey"]),


});