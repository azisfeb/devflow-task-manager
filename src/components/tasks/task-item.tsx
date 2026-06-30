"use client";

import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Trash2,
    ArrowUp,
    ArrowRight,
    ArrowDown,
    Clock,
    Loader2,
    CheckCircle2,
    Plus,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { TaskDetailSheet } from "./task-detail-sheet";

type TaskItemProps = {
    task: Doc<"tasks">;
    index: number;
    showProject: boolean;
    projects: Doc<"projects">[];
};

const priorityConfig = {
    high: {
        label: "High",
        color: "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20",
        icon: ArrowUp,
    },
    med: {
        label: "Med",
        color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
        icon: ArrowRight,
    },
    low: {
        label: "Low",
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        icon: ArrowDown,
    },
};

const statusConfig = {
    pending: { label: "Pending", icon: Clock, color: "text-muted-foreground" },
    in_progress: {
        label: "In Progress",
        icon: Loader2,
        color: "text-blue-600 dark:text-blue-300",
    },
    completed: {
        label: "Completed",
        icon: CheckCircle2,
        color: "text-emerald-600 dark:text-emerald-300",
    },
};

const statusCardConfig = {
    pending: {
        card: "border-border/30 bg-card/50 hover:border-border/60 hover:bg-card/80",
        accent: "[box-shadow:inset_3px_0_0_rgb(194_194_194_/_0.75)]",
    },
    in_progress: {
        card: "border-blue-400/30 bg-blue-500/[0.04] hover:border-blue-400/50 hover:bg-blue-500/[0.07]",
        accent: "[box-shadow:inset_3px_0_0_rgb(96_165_250_/_0.75)]",
    },
    completed: {
        card: "border-emerald-400/30 bg-emerald-500/[0.04] hover:border-emerald-400/50 hover:bg-emerald-500/[0.07]",
        accent: "[box-shadow:inset_3px_0_0_rgb(52_211_153_/_0.75)]",
    },
};

export function TaskItem({ task, index, showProject, projects }: TaskItemProps) {
    const toggleCompleted = useMutation(api.tasks.toggleCompleted);
    const updateStatus = useMutation(api.tasks.updateStatus);
    const setPriority = useMutation(api.tasks.setPriority);
    const removeTask = useMutation(api.tasks.remove);
    const toggleCancel = useMutation(api.tasks.toggleCancel);

    const [detailOpen, setDetailOpen] = useState(false);

    const project = projects.find((p) => p._id === task.projectId);
    const priority = priorityConfig[task.priority];
    const PriorityIcon = priority.icon;
    const status = statusConfig[task.status];

    const handleToggle = async () => {
        try {
            await toggleCompleted({ id: task._id });
        } catch {
            toast.error("Failed to update task");
        }
    };

    const handleDelete = async () => {
        try {
            await removeTask({ id: task._id });
            toast.success("Task deleted");
        } catch {
            toast.error("Failed to delete task");
        }
    };

    const handleToggleCancel = async () => {
        try {
            await toggleCancel({ id: task._id });
            toast.success(task.isCancelled ? "Task restored" : "Task cancelled");
        } catch {
            toast.error(task.isCancelled ? "Failed to restore task" : "Failed to cancel task");
        }
    };

    return (
        <Draggable draggableId={task._id} index={index}>
            {(provided, snapshot) => (
                <>
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn(
                        "group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all cursor-pointer",
                        task.isCancelled 
                            ? "border-muted/50 bg-muted/10 opacity-60 hover:opacity-80 [box-shadow:none]"
                            : statusCardConfig[task.status].card,
                        !task.isCancelled && statusCardConfig[task.status].accent,
                        task.isCompleted && !task.isCancelled && "opacity-70",
                        snapshot.isDragging && "shadow-xl border-primary/50 bg-card z-50 ring-2 ring-primary/20"
                    )}
                    style={{
                        ...provided.draggableProps.style,
                    }}
                    onClick={() => setDetailOpen(true)}
                >
                    <Checkbox
                        checked={task.isCompleted}
                        onCheckedChange={handleToggle}
                        onClick={(e) => e.stopPropagation()}
                        disabled={task.isCancelled}
                        className="h-4.5 w-4.5 rounded-full border-muted-foreground/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />

                    <div className="flex-1 min-w-0">
                        <p
                            className={cn(
                                "text-sm leading-tight font-medium",
                                task.isCancelled && "line-through text-muted-foreground/60"
                            )}
                        >
                            {task.text}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            {showProject && project && (
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{ backgroundColor: project.color }}
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                        {project.name}
                                    </span>
                                </div>
                            )}
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Plus className="h-2.5 w-2.5 opacity-50" />
                                Created {new Date(task._creationTime).toLocaleDateString()}
                            </span>
                            {task.isCompleted && task.completedAt && (
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                    Completed {new Date(task.completedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Badge
                            variant="outline"
                            className={cn(
                                "h-5 gap-1 border px-1.5 text-[10px] font-medium",
                                priority.color
                            )}
                        >
                            <PriorityIcon className="h-2.5 w-2.5" />
                            <span className="hidden sm:inline">{priority.label}</span>
                        </Badge>
                        <Badge
                            variant="outline"
                            className={cn(
                                "h-5 gap-1 border px-1.5 text-[10px] font-medium",
                                status.color
                            )}
                        >
                            <status.icon className="h-2.5 w-2.5" />
                            <span className="hidden sm:inline">{status.label}</span>
                        </Badge>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                            <div className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-all hover:bg-muted group-hover:opacity-100">
                                <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-2 text-xs" disabled={task.isCancelled}>
                                    <status.icon className={cn("h-3.5 w-3.5", status.color)} />
                                    Status
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {(
                                        Object.entries(statusConfig) as [
                                            "pending" | "in_progress" | "completed",
                                            (typeof statusConfig)[keyof typeof statusConfig],
                                        ][]
                                    ).map(([key, cfg]) => (
                                        <DropdownMenuItem
                                            key={key}
                                            className="gap-2 text-xs"
                                            onClick={() => updateStatus({ id: task._id, status: key })}
                                        >
                                            <cfg.icon className={cn("h-3.5 w-3.5", cfg.color)} />
                                            {cfg.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-2 text-xs" disabled={task.isCancelled}>
                                    <PriorityIcon className="h-3.5 w-3.5" />
                                    Priority
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {(
                                        Object.entries(priorityConfig) as [
                                            "low" | "med" | "high",
                                            (typeof priorityConfig)[keyof typeof priorityConfig],
                                        ][]
                                    ).map(([key, cfg]) => (
                                        <DropdownMenuItem
                                            key={key}
                                            className="gap-2 text-xs"
                                            onClick={() => setPriority({ id: task._id, priority: key })}
                                        >
                                            <cfg.icon className={cn("h-3.5 w-3.5", cfg.color.split(" ")[0])} />
                                            {cfg.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="gap-2 text-xs"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCancel();
                                }}
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                {task.isCancelled ? "Restore Task" : "Cancel Task"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="gap-2 text-xs text-destructive focus:text-destructive"
                                onClick={handleDelete}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <TaskDetailSheet
                    task={task}
                    open={detailOpen}
                    onOpenChange={setDetailOpen}
                    projectName={project?.name}
                    projectColor={project?.color}
                />
                </>
            )}
        </Draggable>
    );
}
