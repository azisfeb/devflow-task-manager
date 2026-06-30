# Design Spec: Cancel Task Feature

## Overview
This feature allows users to cancel a task in the DevFlow TodoList app. Cancelled tasks will remain in their original column on the Kanban board (Pending, In Progress, Completed), but they will be styled to appear inactive (strikethrough title, muted colors) to distinguish them from active tasks.

## 1. Database Schema Changes
We will add an optional `isCancelled` boolean field to the `tasks` table.

### `convex/schema.ts`
```typescript
tasks: defineTable({
  // ... other fields
  isCancelled: v.optional(v.boolean()),
})
```

## 2. API Mutations
We will implement a new mutation in `convex/tasks.ts` to toggle the cancellation status.

### `convex/tasks.ts`
```typescript
export const toggleCancel = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity || task.userId !== identity.tokenIdentifier) {
      throw new Error("Not authenticated or unauthorized");
    }

    await ctx.db.patch(args.id, {
      isCancelled: !task.isCancelled,
    });
  },
});
```

## 3. UI Changes & Styling

### Task Item Component (`src/components/tasks/task-item.tsx`)
- **Card Styling**: When `task.isCancelled` is true, the card will render with:
  - Dimmed, translucent, and dashed border styling (`bg-muted/20 border-dashed border-muted-foreground/20 opacity-60`).
  - The color strip/accent on the left is changed to a neutral gray.
- **Title Text**: Styled with `line-through text-muted-foreground/60`.
- **Checkbox**: Disabled when cancelled.
- **Dropdown Menu**: Add an action item to toggle cancel status ("Cancel Task" / "Restore Task").

### Task Detail Sheet Component (`src/components/tasks/task-detail-sheet.tsx`)
- **Title**: Rendered with `line-through text-muted-foreground/60` when cancelled.
- **Top Banner**: Render a noticeable status banner when the task is cancelled:
  - Background: Muted red/gray.
  - Text: "This task is cancelled."
  - Button: "Restore" to uncancel it.
- **Action**: Add a "Cancel Task" (or "Restore Task") button in the footer or detail section.
