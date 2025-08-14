import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsert = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal('SUPER_ADMIN'), v.literal('KITCHEN')),
    brandSlug: v.optional(v.string()),
    kitchenId: v.optional(v.id('kitchens')),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('users').withIndex('by_email', q => q.eq('email', args.email)).unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role, brandSlug: args.brandSlug, kitchenId: args.kitchenId });
      return existing._id;
    }
    return await ctx.db.insert('users', { ...args, createdAt: now });
  }
});

export const me = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query('users').withIndex('by_email', q => q.eq('email', args.email)).unique();
  }
});


