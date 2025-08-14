// convex/kitchens.ts
import { query } from "./_generated/server";

// Query for the Super Admin to get a list of all kitchens
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("kitchens").collect();
  },
});