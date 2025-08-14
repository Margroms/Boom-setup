import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Simple auth functions using Convex
export const signUp = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    // Simple user creation - in production, hash the password
    const existing = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).unique();
    if (existing) throw new Error("User already exists");
    
    return await ctx.db.insert("users", {
      email: args.email,
      role: "CUSTOMER",
      createdAt: Date.now(),
    });
  },
});

export const signIn = query({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    // Simple auth check - in production, verify password hash
    const user = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).unique();
    if (!user) throw new Error("User not found");
    
    return { user: { id: user._id, email: user.email, role: user.role } };
  },
});

export const getSession = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("by_email", q => q.eq("email", args.email)).unique();
    if (!user) return null;
    
    return { user: { id: user._id, email: user.email, role: user.role } };
  },
});
