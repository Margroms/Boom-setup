import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    code: v.string(),
    scope: v.union(v.literal("GLOBAL"), v.literal("BRAND"), v.literal("KITCHEN")),
    brandSlug: v.optional(v.string()),
    kitchenId: v.optional(v.id("kitchens")),
    description: v.optional(v.string()),
    type: v.union(v.literal("PERCENT"), v.literal("AMOUNT")),
    value: v.number(),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    maxRedemptions: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const exists = await ctx.db
      .query("discounts")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (exists) throw new Error("Code already exists");
    return await ctx.db.insert("discounts", { ...args, createdAt: now, isActive: args.isActive ?? true });
  },
});

export const list = query({
  args: {
    scope: v.optional(v.union(v.literal("GLOBAL"), v.literal("BRAND"), v.literal("KITCHEN"))),
    brandSlug: v.optional(v.string()),
    kitchenId: v.optional(v.id("kitchens")),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("discounts");
    if (args.scope === "GLOBAL") {
      q = q.withIndex("by_scope_brand", (qi) => qi.eq("scope", "GLOBAL").eq("brandSlug", undefined as any));
    } else if (args.scope === "BRAND" && args.brandSlug) {
      q = q.withIndex("by_scope_brand", (qi) => qi.eq("scope", "BRAND").eq("brandSlug", args.brandSlug!));
    } else if (args.scope === "KITCHEN" && args.kitchenId) {
      q = q.withIndex("by_scope_kitchen", (qi) => qi.eq("scope", "KITCHEN").eq("kitchenId", args.kitchenId!));
    }
    return await q.collect();
  },
});

export const validateAndPrice = query({
  args: {
    code: v.string(),
    brandSlug: v.optional(v.string()),
    kitchenId: v.optional(v.id("kitchens")),
    subtotal: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const disc = await ctx.db
      .query("discounts")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .unique();
    if (!disc || disc.isActive === false) return { valid: false, reason: "invalid" } as const;
    if (disc.startsAt && disc.startsAt > now) return { valid: false, reason: "not_started" } as const;
    if (disc.endsAt && disc.endsAt < now) return { valid: false, reason: "expired" } as const;

    if (disc.scope === "BRAND" && args.brandSlug && disc.brandSlug !== args.brandSlug) {
      return { valid: false, reason: "scope_mismatch" } as const;
    }
    if (disc.scope === "KITCHEN" && args.kitchenId && disc.kitchenId !== args.kitchenId) {
      return { valid: false, reason: "scope_mismatch" } as const;
    }

    let discountAmount = 0;
    if (disc.type === "PERCENT") {
      discountAmount = Math.round((disc.value / 100) * args.subtotal);
    } else {
      discountAmount = disc.value;
    }
    const total = Math.max(0, args.subtotal - discountAmount);
    return { valid: true, discountAmount, total } as const;
  },
});


