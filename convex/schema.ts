import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  projects: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.string(),
    icon: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  tasks: defineTable({
    projectId: v.id("projects"),
    userId: v.string(),
    text: v.string(),
    isCompleted: v.boolean(),
    priority: v.union(v.literal("low"), v.literal("med"), v.literal("high")),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    completedAt: v.optional(v.number()),
    description: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_user_and_project", ["userId", "projectId"]),
});
