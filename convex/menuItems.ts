// convex/menuItems.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all menu items for a specific kitchen
export const getByKitchen = query({
  args: { kitchenId: v.id("kitchens") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_kitchen", (q) => q.eq("kitchenId", args.kitchenId))
      .collect();
  },
});

// Mutation for the Super Admin to add a new menu item
export const create = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    kitchenId: v.id("kitchens"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("menuItems", args);
  },
});

// Bulk create same item for all kitchens
export const createForAll = mutation({
  args: {
    name: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const kitchens = await ctx.db.query("kitchens").collect();
    if (kitchens.length === 0) {
      return { inserted: 0, ids: [] as any[] };
    }
    const ids = [] as any[]; // Id<'menuItems'>[] but keeping generic for runtime
    for (const k of kitchens) {
      const newId = await ctx.db.insert("menuItems", {
        name: args.name,
        price: args.price,
        kitchenId: k._id,
      });
      ids.push(newId); // newId itself is the Id
    }
    return { inserted: ids.length, ids };
  },
});

// Mutation for the Super Admin to remove a menu item
export const remove = mutation({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.menuItemId);
  },
});