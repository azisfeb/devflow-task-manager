"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AddTaskFormProps = {
    projectId: Id<"projects">;
};

const priorities = [
    { value: "high" as const, label: "High", icon: ArrowUp, color: "text-red-400" },
    { value: "med" as const, label: "Med", icon: ArrowRight, color: "text-amber-400" },
    { value: "low" as const, label: "Low", icon: ArrowDown, color: "text-emerald-400" },
];

export function AddTaskForm({ projectId }: AddTaskFormProps) {
    const [text, setText] = useState("");
    const [priority, setPriority] = useState<"low" | "med" | "high">("med");
    const [isLoading, setIsLoading] = useState(false);
    const createTask = useMutation(api.tasks.create);

    const currentPriority = priorities.find((p) => p.value === priority)!;
    const PriorityIcon = currentPriority.icon;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsLoading(true);
        try {
            await createTask({
                projectId,
                text: text.trim(),
                priority,
            });
            setText("");
        } catch {
            toast.error("Failed to create task");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/30 p-2 transition-colors focus-within:border-primary/30 focus-within:bg-card/50"
        >
            <Plus className="ml-1 h-4 w-4 shrink-0 text-muted-foreground/40" />
            <Input
                placeholder="Add a task..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="h-8 border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0"
            />

            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs"
                    >
                        <PriorityIcon className={cn("h-3 w-3", currentPriority.color)} />
                        <span className="hidden sm:inline">{currentPriority.label}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                    {priorities.map((p) => (
                        <DropdownMenuItem
                            key={p.value}
                            onClick={() => setPriority(p.value)}
                            className="gap-2 text-xs"
                        >
                            <p.icon className={cn("h-3.5 w-3.5", p.color)} />
                            {p.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                type="submit"
                size="sm"
                disabled={!text.trim() || isLoading}
                className="h-7 px-3 text-xs bg-primary/90 hover:bg-primary"
            >
                Add
            </Button>
        </form>
    );
}
