"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSelectedProject } from "@/app/dashboard/layout";
import { Id } from "../../../convex/_generated/dataModel";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateProjectDialog } from "@/components/sidebar/create-project-dialog";
import { useState } from "react";
import {
    Layers,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Palette,
    Code2,
    FolderKanban,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

const PROJECT_COLORS = [
    "#a78bfa", // violet
    "#60a5fa", // blue
    "#34d399", // emerald
    "#fbbf24", // amber
    "#f87171", // red
    "#fb923c", // orange
    "#e879f9", // fuchsia
    "#2dd4bf", // teal
];

export function AppSidebar() {
    const projects = useQuery(api.projects.list);
    const removeProject = useMutation(api.projects.remove);
    const updateColor = useMutation(api.projects.updateColor);
    const { selectedProjectId, setSelectedProjectId } = useSelectedProject();
    const [createOpen, setCreateOpen] = useState(false);

    const handleDelete = async (id: Id<"projects">, name: string) => {
        try {
            await removeProject({ id });
            if (selectedProjectId === id) setSelectedProjectId(null);
            toast.success(`Deleted "${name}"`);
        } catch {
            toast.error("Failed to delete project");
        }
    };

    return (
        <Sidebar collapsible="icon" className="border-r-0">
            <SidebarHeader className="border-b border-sidebar-border/50 px-4 py-3 flex-row justify-between items-center group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
                <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 glow-violet">
                        <Code2 className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold tracking-tight glow-text">
                            DevFlow
                        </h2>
                        <p className="text-[10px] text-muted-foreground">Task Manager</p>
                    </div>
                </div>
                <ThemeToggle />
            </SidebarHeader>

            <SidebarContent>
                {/* All Tasks */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => setSelectedProjectId(null)}
                                    isActive={selectedProjectId === null}
                                    className="gap-2.5"
                                >
                                    <Layers className="h-4 w-4" />
                                    <span>All Tasks</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Projects */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
                        Projects
                    </SidebarGroupLabel>
                    <SidebarGroupAction
                        title="New Project"
                        onClick={() => setCreateOpen(true)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                    </SidebarGroupAction>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {projects?.map((project) => (
                                <SidebarMenuItem key={project._id}>
                                    <SidebarMenuButton
                                        onClick={() => setSelectedProjectId(project._id)}
                                        isActive={selectedProjectId === project._id}
                                        className="gap-2.5"
                                    >
                                        <div
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{
                                                backgroundColor: project.color,
                                                boxShadow: `0 0 6px ${project.color}40`,
                                            }}
                                        />
                                        <span className="truncate">{project.name}</span>
                                    </SidebarMenuButton>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger render={<SidebarMenuAction className="opacity-0 group-hover/menu-item:opacity-100 transition-opacity" />}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            side="right"
                                            align="start"
                                            className="w-48"
                                        >
                                            <DropdownMenuItem className="gap-2">
                                                <Pencil className="h-3.5 w-3.5" />
                                                Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <div className="px-2 py-1.5">
                                                <p className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Palette className="h-3 w-3" />
                                                    Color
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {PROJECT_COLORS.map((color) => (
                                                        <button
                                                            key={color}
                                                            className="h-5 w-5 rounded-full ring-1 ring-offset-1 ring-offset-popover transition-transform hover:scale-110"
                                                            style={{
                                                                backgroundColor: color,
                                                                "--ring-color":
                                                                    project.color === color
                                                                        ? color
                                                                        : "transparent",
                                                            } as React.CSSProperties}
                                                            onClick={() =>
                                                                updateColor({ id: project._id, color })
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="gap-2 text-destructive focus:text-destructive"
                                                onClick={() =>
                                                    handleDelete(project._id, project.name)
                                                }
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            ))}

                            {projects?.length === 0 && (
                                <div className="px-3 py-6 text-center">
                                    <FolderKanban className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                                    <p className="text-xs text-muted-foreground/60">
                                        No projects yet
                                    </p>
                                </div>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/50 p-3">
                <p className="text-center text-[10px] text-muted-foreground/40">
                    DevFlow v1.0
                </p>
            </SidebarFooter>

            <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
        </Sidebar>
    );
}
