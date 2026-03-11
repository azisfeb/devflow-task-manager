import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {
        projectId: v.optional(v.id("projects")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        if (args.projectId) {
            return await ctx.db
                .query("tasks")
                .withIndex("by_user_and_project", (q) =>
                    q
                        .eq("userId", identity.tokenIdentifier)
                        .eq("projectId", args.projectId!)
                )
                .collect();
        }

        return await ctx.db
            .query("tasks")
            .withIndex("by_user", (q) =>
                q.eq("userId", identity.tokenIdentifier)
            )
            .collect();
    },
});

export const create = mutation({
    args: {
        projectId: v.id("projects"),
        text: v.string(),
        priority: v.union(v.literal("low"), v.literal("med"), v.literal("high")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        return await ctx.db.insert("tasks", {
            projectId: args.projectId,
            userId: identity.tokenIdentifier,
            text: args.text,
            isCompleted: false,
            priority: args.priority,
            status: "pending",
        });
    },
});

export const toggleCompleted = mutation({
    args: { id: v.id("tasks") },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.id);
        if (!task) throw new Error("Task not found");

        const identity = await ctx.auth.getUserIdentity();
        if (!identity || task.userId !== identity.tokenIdentifier) {
            throw new Error("Not authenticated or unauthorized");
        }

        const newCompleted = !task.isCompleted;
        await ctx.db.patch(args.id, {
            isCompleted: newCompleted,
            status: newCompleted ? "completed" : "pending",
            completedAt: newCompleted ? Date.now() : undefined,
        });
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("tasks"),
        status: v.union(
            v.literal("pending"),
            v.literal("in_progress"),
            v.literal("completed")
        ),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.id);
        if (!task) throw new Error("Task not found");

        const identity = await ctx.auth.getUserIdentity();
        if (!identity || task.userId !== identity.tokenIdentifier) {
            throw new Error("Not authenticated or unauthorized");
        }

        await ctx.db.patch(args.id, {
            status: args.status,
            isCompleted: args.status === "completed",
            completedAt: args.status === "completed" ? Date.now() : undefined,
        });
    },
});

export const setPriority = mutation({
    args: {
        id: v.id("tasks"),
        priority: v.union(v.literal("low"), v.literal("med"), v.literal("high")),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.id);
        if (!task) throw new Error("Task not found");

        const identity = await ctx.auth.getUserIdentity();
        if (!identity || task.userId !== identity.tokenIdentifier) {
            throw new Error("Not authenticated or unauthorized");
        }

        await ctx.db.patch(args.id, { priority: args.priority });
    },
});

export const update = mutation({
    args: {
        id: v.id("tasks"),
        text: v.string(),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.id);
        if (!task) throw new Error("Task not found");

        const identity = await ctx.auth.getUserIdentity();
        if (!identity || task.userId !== identity.tokenIdentifier) {
            throw new Error("Not authenticated or unauthorized");
        }

        await ctx.db.patch(args.id, { text: args.text });
    },
});

export const remove = mutation({
    args: { id: v.id("tasks") },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.id);
        if (!task) throw new Error("Task not found");

        const identity = await ctx.auth.getUserIdentity();
        if (!identity || task.userId !== identity.tokenIdentifier) {
            throw new Error("Not authenticated or unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});
