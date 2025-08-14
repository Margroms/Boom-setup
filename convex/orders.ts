// convex/orders.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Mutation for a customer to create a new order
export const create = mutation({
  args: {
    kitchenId: v.id("kitchens"),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Calculate total and get item details on the backend for security
    let totalAmount = 0;
    const detailedItems = [];

    for (const item of args.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item not found`);
      }
      totalAmount += menuItem.price * item.quantity;
      detailedItems.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });
    }

    return await ctx.db.insert("orders", {
      kitchenId: args.kitchenId,
      items: detailedItems,
      totalAmount,
      status: "placed", // Default status for a new order
    });
  },
});

// Query for a kitchen to view all its orders
export const getByKitchen = query({
  args: { kitchenId: v.id("kitchens") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_kitchen", (q) => q.eq("kitchenId", args.kitchenId))
      .order("desc") // Show newest orders first
      .collect();
  },
});

// Mutation for a kitchen to update an order's status
export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("placed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, { status: args.status });
  },
});