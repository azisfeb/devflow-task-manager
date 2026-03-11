import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called store without authentication present");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (user !== null) {
            if (user.name !== identity.name || user.email !== identity.email) {
                await ctx.db.patch(user._id, {
                    name: identity.name ?? "",
                    email: identity.email ?? "",
                    imageUrl: identity.pictureUrl ?? undefined,
                });
            }
            return user._id;
        }

        return await ctx.db.insert("users", {
            tokenIdentifier: identity.tokenIdentifier,
            name: identity.name ?? "",
            email: identity.email ?? "",
            imageUrl: identity.pictureUrl ?? undefined,
        });
    },
});

export const current = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        return await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();
    },
});
