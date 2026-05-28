"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSelectedProject } from "@/app/dashboard/layout";
import { TaskItem } from "./task-item";
import { AddTaskForm } from "./add-task-form";
import { ClipboardList, Clock, Loader2, CheckCircle2 } from "lucide-react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COLUMNS = [
    {
        id: "pending",
        title: "Pending",
        icon: Clock,
        color: "text-muted-foreground",
        wrapperColor: "border-border/50 bg-muted/5",
        wrapperDragColor: "bg-muted/10 border-muted-foreground/30",
        scrollbarClass: "scrollbar-pending",
    },
    {
        id: "in_progress",
        title: "In Progress",
        icon: Loader2,
        color: "text-blue-400",
        wrapperColor: "border-blue-400/20 bg-blue-500/[0.03]",
        wrapperDragColor: "bg-blue-500/[0.07] border-blue-400/40",
        scrollbarClass: "scrollbar-in-progress",
    },
    {
        id: "completed",
        title: "Completed",
        icon: CheckCircle2,
        color: "text-emerald-400",
        wrapperColor: "border-emerald-400/20 bg-emerald-500/[0.03]",
        wrapperDragColor: "bg-emerald-500/[0.07] border-emerald-400/40",
        scrollbarClass: "scrollbar-completed",
    },
] as const;

export function TaskList() {
    const { selectedProjectId } = useSelectedProject();
    const tasks = useQuery(api.tasks.list, {
        projectId: selectedProjectId ?? undefined,
    });
    const projects = useQuery(api.projects.list);
    const updateStatus = useMutation(api.tasks.updateStatus);

    if (tasks === undefined) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="w-80 flex-shrink-0 space-y-3">
                        <div className="h-8 w-32 animate-pulse rounded-md bg-muted/30" />
                        {Array.from({ length: 3 }).map((_, j) => (
                            <div
                                key={j}
                                className="h-20 animate-pulse rounded-lg bg-muted/20"
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as "pending" | "in_progress" | "completed";
        
        try {
            // Optimistic UI updates are handled by Convex, but we trigger the mutation
            await updateStatus({
                id: draggableId as any,
                status: newStatus,
            });
        } catch (error) {
            toast.error("Failed to update task status");
        }
    };

    return (
        <div className="flex h-full flex-col gap-6">
            {/* Add Task */}
            {selectedProjectId && (
                <div className="mx-auto w-full max-w-3xl flex-shrink-0">
                    <AddTaskForm projectId={selectedProjectId} />
                </div>
            )}

            {!selectedProjectId && projects && projects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 ring-1 ring-primary/10">
                        <ClipboardList className="h-8 w-8 text-primary/40" />
                    </div>
                    <h3 className="mb-1 text-sm font-medium text-foreground/80">
                        Welcome to DevFlow
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Create a project from the sidebar to get started.
                    </p>
                </div>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex min-h-0 flex-1 gap-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {COLUMNS.map((column) => {
                        const columnTasks = tasks.filter((t) => t.status === column.id);

                        return (
                            <div key={column.id} className="flex min-h-0 min-w-[320px] flex-1 flex-col gap-4">
                                <div className="flex flex-shrink-0 items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <column.icon className={cn("h-4 w-4", column.color)} />
                                        <h2 className="text-sm font-semibold text-foreground/80">
                                            {column.title}
                                        </h2>
                                        <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                            {columnTasks.length}
                                        </span>
                                    </div>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={cn(
                                                "flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-dashed p-2 transition-colors overflow-y-auto",
                                                column.wrapperColor,
                                                column.scrollbarClass,
                                                snapshot.isDraggingOver && column.wrapperDragColor
                                            )}
                                        >
                                            {columnTasks.map((task, index) => (
                                                <TaskItem
                                                    key={task._id}
                                                    task={task}
                                                    index={index}
                                                    showProject={!selectedProjectId}
                                                    projects={projects ?? []}
                                                />
                                            ))}
                                            {provided.placeholder}
                                            
                                            {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                                                <div className="flex flex-1 flex-col items-center justify-center py-10 opacity-40">
                                                    <p className="text-[10px] font-medium uppercase tracking-wider">
                                                        Empty
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            {tasks.length === 0 && selectedProjectId && (
                <div className="flex flex-shrink-0 flex-col items-center justify-center py-16">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/30">
                        <ClipboardList className="h-7 w-7 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm text-muted-foreground/70">
                        No tasks yet. Add one above!
                    </p>
                </div>
            )}
        </div>
    );
}
