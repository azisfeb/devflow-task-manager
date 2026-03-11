"use client";

import { UserButton, ClerkLoading, ClerkLoaded } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSelectedProject } from "@/app/dashboard/layout";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Layers, Zap } from "lucide-react";

export function Header() {
    const { selectedProjectId } = useSelectedProject();
    const projects = useQuery(api.projects.list);
    const selectedProject = projects?.find((p) => p._id === selectedProjectId);

    return (
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-background/80 px-4 backdrop-blur-sm">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
            <Separator orientation="vertical" className="h-5 bg-border/50" />

            <div className="flex items-center gap-2">
                {selectedProject ? (
                    <>
                        <div
                            className="h-2.5 w-2.5 rounded-full ring-2 ring-offset-1 ring-offset-background animate-pulse-subtle"
                            style={{
                                backgroundColor: selectedProject.color,
                                boxShadow: `0 0 0 2px var(--tw-ring-color), 0 0 8px ${selectedProject.color}60`,
                                ["--tw-ring-color" as any]: selectedProject.color,
                            }}
                        />
                        <h1 className="text-sm font-semibold tracking-tight">
                            {selectedProject.name}
                        </h1>
                    </>
                ) : (
                    <>
                        <Layers className="h-4 w-4 text-primary" />
                        <h1 className="text-sm font-semibold tracking-tight">All Tasks</h1>
                    </>
                )}
            </div>

            <div className="ml-auto flex items-center gap-3">
                <div className="hidden items-center gap-1.5 rounded-md border border-border/50 bg-muted/50 px-2 py-1 text-xs text-muted-foreground sm:flex">
                    <Zap className="h-3 w-3 text-primary" />
                    <kbd className="font-mono">⌘K</kbd>
                    <span>Quick Add</span>
                </div>
                <ClerkLoading>
                    <div className="h-7 w-7 rounded-full bg-muted animate-pulse" />
                </ClerkLoading>
                <ClerkLoaded>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox:
                                    "h-7 w-7 ring-2 ring-primary/20 hover:ring-primary/40 transition-all",
                            },
                        }}
                    />
                </ClerkLoaded>
            </div>
        </header>
    );
}
