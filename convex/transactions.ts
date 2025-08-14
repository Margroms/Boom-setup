import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    amount: v.number(),
    currency: v.optional(v.string()),
    brandSlug: v.optional(v.string()),
    kitchenId: v.optional(v.id("kitchens")),
    idempotencyKey: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("transactions")
      .withIndex("by_idem", (q) => q.eq("idempotencyKey", args.idempotencyKey))
      .unique();
    if (existing) return existing._id;
    const now = Date.now();
    return await ctx.db.insert("transactions", {
      amount: args.amount,
      currency: args.currency ?? "INR",
      brandSlug: args.brandSlug,
      kitchenId: args.kitchenId,
      idempotencyKey: args.idempotencyKey,
      status: "PENDING",
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const markStatus = mutation({
  args: {
    transactionId: v.id("transactions"),
    status: v.union(v.literal("SUCCESS"), v.literal("FAILED"), v.literal("CANCELLED")),
  },
  handler: async (ctx, args) => {
    const tx = await ctx.db.get(args.transactionId);
    if (!tx) throw new Error("Transaction not found");
    return await ctx.db.patch(args.transactionId, { status: args.status, updatedAt: Date.now() });
  },
});

export const listByKitchen = query({
  args: { kitchenId: v.id("kitchens") },
  handler: async (ctx, args) => {
    return await ctx.db.query("transactions").filter((q) => q.eq(q.field("kitchenId"), args.kitchenId)).collect();
  },
});


