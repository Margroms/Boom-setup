// convex/kitchens.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query for the Super Admin to get a list of all kitchens
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("kitchens").collect();
  },
});

// Mutation to create a new kitchen
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const trimmed = args.name.trim();
    if (!trimmed) throw new Error("Name required");
    // Optional: prevent duplicates (case-insensitive)
    const existing = await ctx.db.query("kitchens").collect();
    if (existing.some(k => k.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error("Kitchen with that name already exists");
    }
    return await ctx.db.insert("kitchens", { name: trimmed });
  },
});