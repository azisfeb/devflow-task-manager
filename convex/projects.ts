import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        return await ctx.db
            .query("projects")
            .withIndex("by_user", (q) =>
                q.eq("userId", identity.tokenIdentifier)
            )
            .collect();
    },
});

export const get = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.db.insert("projects", {
            userId: identity.tokenIdentifier,
            name: args.name,
            color: args.color,
        });
    },
});

export const rename = mutation({
    args: {
        id: v.id("projects"),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.id);
        if (!project || project.userId !== identity.tokenIdentifier) {
            throw new Error("Project not found or unauthorized");
        }

        await ctx.db.patch(args.id, { name: args.name });
    },
});

export const updateColor = mutation({
    args: {
        id: v.id("projects"),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.id);
        if (!project || project.userId !== identity.tokenIdentifier) {
            throw new Error("Project not found or unauthorized");
        }

        await ctx.db.patch(args.id, { color: args.color });
    },
});

export const remove = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const project = await ctx.db.get(args.id);
        if (!project || project.userId !== identity.tokenIdentifier) {
            throw new Error("Project not found or unauthorized");
        }

        // Cascade delete all tasks in this project
        const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_project", (q) => q.eq("projectId", args.id))
            .collect();

        for (const task of tasks) {
            await ctx.db.delete(task._id);
        }

        await ctx.db.delete(args.id);
    },
});
