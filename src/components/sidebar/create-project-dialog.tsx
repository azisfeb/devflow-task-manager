"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const PROJECT_COLORS = [
    "#a78bfa",
    "#60a5fa",
    "#34d399",
    "#fbbf24",
    "#f87171",
    "#fb923c",
    "#e879f9",
    "#2dd4bf",
];

type CreateProjectDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function CreateProjectDialog({
    open,
    onOpenChange,
}: CreateProjectDialogProps) {
    const [name, setName] = useState("");
    const [color, setColor] = useState(PROJECT_COLORS[0]);
    const [isLoading, setIsLoading] = useState(false);
    const createProject = useMutation(api.projects.create);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            await createProject({ name: name.trim(), color });
            toast.success(`Created "${name.trim()}"`);
            setName("");
            setColor(PROJECT_COLORS[0]);
            onOpenChange(false);
        } catch {
            toast.error("Failed to create project");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-base">New Project</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Create a new workspace for your tasks.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="project-name" className="text-xs">
                            Project Name
                        </Label>
                        <Input
                            id="project-name"
                            placeholder="e.g. frontend-redesign"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-9 bg-background/50 text-sm"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs">Color</Label>
                        <div className="flex gap-2">
                            {PROJECT_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className="h-7 w-7 rounded-full transition-all hover:scale-110"
                                    style={{
                                        backgroundColor: c,
                                        boxShadow:
                                            color === c
                                                ? `0 0 0 2px var(--background), 0 0 0 4px ${c}`
                                                : "none",
                                    }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!name.trim() || isLoading}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isLoading ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
