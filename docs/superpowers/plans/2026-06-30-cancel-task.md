# Cancel Task Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the ability to cancel tasks, styling cancelled task cards in columns with a strikethrough title and dimmed colors.

**Architecture:** Add a new optional `isCancelled` boolean field to the database schema, expose a mutation to toggle this state, and update task card components (`TaskItem` and `TaskDetailSheet`) to respect and display this state.

**Tech Stack:** Convex, Next.js, React, TailwindCSS, Lucide Icons

---

### Task 1: Update Schema
**Files:**
- Modify: `convex/schema.ts`

- [ ] **Step 1: Add isCancelled field to schema**
  Modify `convex/schema.ts` around line 32 to include `isCancelled: v.optional(v.boolean())`.
  
  ```typescript
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
    isCancelled: v.optional(v.boolean()),
  })
  ```

- [ ] **Step 2: Run verification**
  Run typecheck command:
  `npx tsc --noEmit`
  Expected output: Success (exit 0)

- [ ] **Step 3: Commit**
  ```bash
  git add convex/schema.ts
  git commit -m "schema: add isCancelled field to tasks"
  ```

---

### Task 2: Create toggleCancel Mutation
**Files:**
- Modify: `convex/tasks.ts`

- [ ] **Step 1: Implement toggleCancel mutation**
  Add the `toggleCancel` mutation to `convex/tasks.ts`:
  
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

- [ ] **Step 2: Run verification**
  Run typecheck command:
  `npx tsc --noEmit`
  Expected output: Success (exit 0)

- [ ] **Step 3: Commit**
  ```bash
  git add convex/tasks.ts
  git commit -m "feat: add toggleCancel mutation to tasks"
  ```

---

### Task 3: Style TaskItem and Add Cancel Action
**Files:**
- Modify: `src/components/tasks/task-item.tsx`

- [ ] **Step 1: Add toggleCancel mutation and Cancel/Restore dropdown items**
  Add mutation import/use and add the action to the dropdown menu.
  
  Import and setup mutation:
  ```typescript
  const toggleCancel = useMutation(api.tasks.toggleCancel);
  ```
  
  Add dropdown items (e.g., around line 255):
  ```typescript
  <DropdownMenuSeparator />
  <DropdownMenuItem
      className="gap-2 text-xs"
      onClick={(e) => {
          e.stopPropagation();
          toggleCancel({ id: task._id });
      }}
  >
      <XCircle className="h-3.5 w-3.5" />
      {task.isCancelled ? "Restore Task" : "Cancel Task"}
  </DropdownMenuItem>
  ```
  *(Make sure `XCircle` is imported from `lucide-react`)*

- [ ] **Step 2: Adjust TaskItem card and text styling**
  Modify card styles and title styles.
  
  For card wrapper classes:
  ```typescript
  className={cn(
      "group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all cursor-pointer",
      task.isCancelled 
          ? "border-muted/50 bg-muted/10 opacity-60 hover:opacity-80 [box-shadow:none]"
          : statusCardConfig[task.status].card,
      !task.isCancelled && statusCardConfig[task.status].accent,
      task.isCompleted && !task.isCancelled && "opacity-70",
      snapshot.isDragging && "shadow-xl border-primary/50 bg-card z-50 ring-2 ring-primary/20"
  )}
  ```
  
  For title text classes:
  ```typescript
  className={cn(
      "text-sm leading-tight font-medium",
      task.isCancelled && "line-through text-muted-foreground/60"
  )}
  ```
  
  For the checkbox element, disable it if the task is cancelled:
  ```typescript
  disabled={task.isCancelled}
  ```

- [ ] **Step 3: Run verification**
  Run compiler and next build commands:
  `npx tsc --noEmit && npx next build`
  Expected output: Success (exit 0)

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/tasks/task-item.tsx
  git commit -m "feat: add cancel/restore toggle and update styling in TaskItem"
  ```

---

### Task 4: Handle Cancellation in TaskDetailSheet
**Files:**
- Modify: `src/components/tasks/task-detail-sheet.tsx`

- [ ] **Step 1: Import and setup toggleCancel mutation**
  Setup mutation:
  ```typescript
  const toggleCancel = useMutation(api.tasks.toggleCancel);
  ```
  *(Ensure `XCircle` or similar icon is imported if needed)*

- [ ] **Step 2: Strikethrough for Title in Detail Sheet**
  Find the `SheetTitle` component and apply strikethrough if `task.isCancelled` is true:
  
  ```typescript
  className={cn(
      "cursor-text text-left text-xl font-semibold leading-snug text-foreground hover:text-foreground/80 transition-colors",
      task.isCancelled && "line-through text-muted-foreground/60"
  )}
  ```

- [ ] **Step 3: Add Cancellation Status Banner**
  Above the Description/Details section, show a banner warning if the task is cancelled:
  
  ```typescript
  {task.isCancelled && (
      <div className="flex items-center justify-between gap-4 border-b border-rose-500/20 bg-rose-500/5 px-6 py-2.5 text-xs text-rose-500">
          <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              <span>This task has been cancelled.</span>
          </div>
          <Button
              variant="outline"
              size="sm"
              className="h-7 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
              onClick={() => toggleCancel({ id: task._id })}
          >
              Restore
          </Button>
      </div>
  )}
  ```

- [ ] **Step 4: Add Cancel Button in Footer**
  In the footer, add a Cancel/Restore button next to the Delete Task button (e.g. around line 406):
  
  ```typescript
  {/* Footer */}
  <div className="flex gap-3 border-t border-border/40 bg-muted/10 px-6 py-4">
      <button
          onClick={() => toggleCancel({ id: task._id })}
          className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors",
              task.isCancelled
                  ? "border-muted-foreground/20 bg-muted-foreground/5 text-muted-foreground hover:bg-muted-foreground/10"
                  : "border-amber-500/20 bg-amber-500/5 text-amber-500 hover:bg-amber-500/10"
          )}
      >
          <XCircle className="h-3.5 w-3.5" />
          {task.isCancelled ? "Restore Task" : "Cancel Task"}
      </button>
      <button
          onClick={() => setDeleteDialogOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 hover:border-destructive/40"
      >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Task
      </button>
  </div>
  ```

- [ ] **Step 5: Run verification**
  Run:
  `npx tsc --noEmit && npx next build`
  Expected output: Success (exit 0)

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/tasks/task-detail-sheet.tsx
  git commit -m "feat: handle cancelled state styling and actions in TaskDetailSheet"
  ```
