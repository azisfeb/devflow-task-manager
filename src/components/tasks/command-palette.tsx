"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { useSelectedProject } from "@/app/dashboard/layout";
import { ArrowUp, ArrowRight, ArrowDown, FolderKanban } from "lucide-react";
import { toast } from "sonner";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [taskText, setTaskText] = useState("");
    const [priority, setPriority] = useState<"low" | "med" | "high">("med");
    const [targetProjectId, setTargetProjectId] =
        useState<Id<"projects"> | null>(null);

    const { selectedProjectId } = useSelectedProject();
    const projects = useQuery(api.projects.list);
    const createTask = useMutation(api.tasks.create);

    useEffect(() => {
        setTargetProjectId(selectedProjectId);
    }, [selectedProjectId]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleCreate = async () => {
        if (!taskText.trim() || !targetProjectId) return;

        try {
            await createTask({
                projectId: targetProjectId,
                text: taskText.trim(),
                priority,
            });
            toast.success("Task created");
            setTaskText("");
            setPriority("med");
            setOpen(false);
        } catch {
            toast.error("Failed to create task");
        }
    };

    const targetProject = projects?.find((p) => p._id === targetProjectId);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <Command>
                <CommandInput
                    placeholder="Type a task and press Enter..."
                    value={taskText}
                    onValueChange={setTaskText}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && taskText.trim() && targetProjectId) {
                            e.preventDefault();
                            handleCreate();
                        }
                    }}
                />
                <CommandList>
                    <CommandEmpty>
                        {taskText.trim()
                            ? targetProjectId
                                ? 'Press Enter to create task'
                                : "Select a project first"
                            : "Start typing a task..."}
                    </CommandEmpty>

                    {/* Project Selector */}
                    <CommandGroup heading="Project">
                        {projects?.map((project) => (
                            <CommandItem
                                key={project._id}
                                onSelect={() => setTargetProjectId(project._id)}
                                className="gap-2"
                            >
                                <div
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                        backgroundColor: project.color,
                                        boxShadow:
                                            targetProjectId === project._id
                                                ? `0 0 6px ${project.color}`
                                                : "none",
                                    }}
                                />
                                <span>{project.name}</span>
                                {targetProjectId === project._id && (
                                    <span className="ml-auto text-[10px] text-primary">
                                        Selected
                                    </span>
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandSeparator />

                    {/* Priority */}
                    <CommandGroup heading="Priority">
                        <CommandItem
                            onSelect={() => setPriority("high")}
                            className="gap-2"
                        >
                            <ArrowUp className="h-3.5 w-3.5 text-red-400" />
                            High
                            {priority === "high" && (
                                <span className="ml-auto text-[10px] text-primary">●</span>
                            )}
                        </CommandItem>
                        <CommandItem
                            onSelect={() => setPriority("med")}
                            className="gap-2"
                        >
                            <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                            Medium
                            {priority === "med" && (
                                <span className="ml-auto text-[10px] text-primary">●</span>
                            )}
                        </CommandItem>
                        <CommandItem
                            onSelect={() => setPriority("low")}
                            className="gap-2"
                        >
                            <ArrowDown className="h-3.5 w-3.5 text-emerald-400" />
                            Low
                            {priority === "low" && (
                                <span className="ml-auto text-[10px] text-primary">●</span>
                            )}
                        </CommandItem>
                    </CommandGroup>
                </CommandList>

                {targetProject && taskText.trim() && (
                    <div className="border-t border-border/50 px-3 py-2 text-xs text-muted-foreground">
                        Press <kbd className="rounded bg-muted px-1 font-mono">Enter</kbd> to
                        add to{" "}
                        <span className="font-medium text-foreground">
                            {targetProject.name}
                        </span>
                    </div>
                )}
            </Command>
        </CommandDialog>
    );
}
