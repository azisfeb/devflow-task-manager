"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Clock,
    Loader2,
    CheckCircle2,
    ArrowUp,
    ArrowRight,
    ArrowDown,
    ChevronDown,
    CalendarDays,
    CheckCheck,
    Trash2,
    FolderOpen,
    Maximize2,
    Minimize2,
    PanelRightClose,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

type TaskDetailSheetProps = {
    task: Doc<"tasks"> | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectName?: string;
    projectColor?: string;
};

const statusConfig = {
    pending: { label: "Pending", icon: Clock, color: "text-muted-foreground", badge: "border-border/50 text-muted-foreground" },
    in_progress: { label: "In Progress", icon: Loader2, color: "text-blue-400", badge: "border-blue-400/40 text-blue-400 bg-blue-500/10" },
    completed: { label: "Completed", icon: CheckCircle2, color: "text-emerald-400", badge: "border-emerald-400/40 text-emerald-400 bg-emerald-500/10" },
};

const priorityConfig = {
    high: { label: "High", icon: ArrowUp, color: "text-red-400", badge: "border-red-500/30 text-red-400 bg-red-500/10" },
    med: { label: "Med", icon: ArrowRight, color: "text-amber-400", badge: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
    low: { label: "Low", icon: ArrowDown, color: "text-emerald-400", badge: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" },
};

export function TaskDetailSheet({
    task,
    open,
    onOpenChange,
    projectName,
    projectColor,
}: TaskDetailSheetProps) {
    const updateDescription = useMutation(api.tasks.updateDescription);
    const updateText = useMutation(api.tasks.update);
    const updateStatus = useMutation(api.tasks.updateStatus);
    const setPriority = useMutation(api.tasks.setPriority);
    const removeTask = useMutation(api.tasks.remove);
    const toggleCancel = useMutation(api.tasks.toggleCancel);

    const [titleValue, setTitleValue] = useState(task?.text ?? "");
    const [isTitleEditing, setIsTitleEditing] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const titleRef = useRef<HTMLTextAreaElement>(null);

    const [prevTaskId, setPrevTaskId] = useState(task?._id);
    if (task?._id !== prevTaskId) {
        setPrevTaskId(task?._id);
        setTitleValue(task?.text ?? "");
        if (task?.isCancelled) {
            setIsTitleEditing(false);
        }
    }

    const handleToggleCancel = async () => {
        if (!task) return;
        try {
            await toggleCancel({ id: task._id });
            toast.success(task.isCancelled ? "Task restored" : "Task cancelled");
        } catch {
            toast.error(task.isCancelled ? "Failed to restore task" : "Failed to cancel task");
        }
    };



    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Add a description, notes, or any extra context…",
            }),
        ],
        content: task?.description ?? "",
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none min-h-[160px] focus:outline-none text-sm leading-relaxed",
            },
        },
        onBlur: async ({ editor }) => {
            if (!task) return;
            const html = editor.getHTML();
            try {
                await updateDescription({ id: task._id, description: html });
            } catch {
                toast.error("Failed to save description");
            }
        },
    });

    // Reset editor content when a different task opens
    useEffect(() => {
        if (editor && task?._id) {
            const currentHtml = editor.getHTML();
            const newHtml = task?.description ?? "";
            if (currentHtml !== newHtml) {
                editor.commands.setContent(newHtml);
            }
        }
    }, [task?._id, task?.description, editor]);

    useEffect(() => {
        if (editor) {
            editor.setEditable(!task?.isCancelled);
        }
    }, [editor, task?.isCancelled]);

    const handleTitleSave = async () => {
        if (!task || titleValue.trim() === task.text) {
            setIsTitleEditing(false);
            return;
        }
        try {
            await updateText({ id: task._id, text: titleValue.trim() });
        } catch {
            toast.error("Failed to update title");
            setTitleValue(task.text);
        }
        setIsTitleEditing(false);
    };

    const handleDelete = async () => {
        if (!task) return;
        try {
            await removeTask({ id: task._id });
            toast.success("Task deleted");
            onOpenChange(false);
        } catch {
            toast.error("Failed to delete task");
        }
    };

    if (!task) return null;

    const status = statusConfig[task.status];
    const priority = priorityConfig[task.priority];
    const StatusIcon = status.icon;
    const PriorityIcon = priority.icon;

    return (
        <Sheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) setIsFullscreen(false); onOpenChange(nextOpen); }}>
            <SheetContent
                side="right"
                showCloseButton={false}
                className={cn(
                    "flex w-full flex-col gap-0 p-0 transition-[width,max-width] duration-300 ease-in-out",
                    isFullscreen ? "sm:max-w-full" : "sm:max-w-2xl"
                )}
                style={isFullscreen ? { width: "100vw", maxWidth: "100vw" } : undefined}
            >
                {/* Header */}
                <SheetHeader className="border-b border-border/40 bg-muted/20 px-6 py-4">
                    <div className="flex items-start gap-3">
                        {/* Title area */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            {isTitleEditing ? (
                                <textarea
                                    ref={titleRef}
                                    value={titleValue}
                                    onChange={(e) => setTitleValue(e.target.value)}
                                    onBlur={handleTitleSave}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleTitleSave();
                                        }
                                        if (e.key === "Escape") {
                                            setTitleValue(task.text);
                                            setIsTitleEditing(false);
                                        }
                                    }}
                                    className="w-full resize-none bg-transparent text-xl font-semibold leading-snug text-foreground focus:outline-none"
                                    rows={2}
                                    autoFocus
                                />
                            ) : (
                                <SheetTitle
                                    className={cn(
                                        "text-left text-xl font-semibold leading-snug text-foreground hover:text-foreground/80 transition-colors",
                                        task.isCancelled ? "cursor-default" : "cursor-text",
                                        task.isCancelled && "line-through text-muted-foreground/60"
                                    )}
                                    onClick={() => {
                                        if (task.isCancelled) return;
                                        setIsTitleEditing(true);
                                        setTimeout(() => titleRef.current?.focus(), 0);
                                    }}
                                >
                                    {task.text}
                                </SheetTitle>
                            )}
                        </div>

                        {/* Header action buttons */}
                        <div className="flex items-center gap-0.5 shrink-0">
                            <button
                                onClick={() => setIsFullscreen((prev) => !prev)}
                                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="h-3.5 w-3.5" />
                                ) : (
                                    <Maximize2 className="h-3.5 w-3.5" />
                                )}
                            </button>
                            <button
                                onClick={() => onOpenChange(false)}
                                title="Close panel"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                                <PanelRightClose className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </SheetHeader>

                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-2 border-b border-border/40 px-6 py-3">
                    {/* Status */}
                    <DropdownMenu>
                        <DropdownMenuTrigger disabled={task.isCancelled}>
                            <div className={cn("flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition-opacity hover:opacity-80", status.badge, task.isCancelled && "pointer-events-none opacity-50")}>
                                <StatusIcon className="h-3 w-3" />
                                {status.label}
                                <ChevronDown className="h-2.5 w-2.5 opacity-60" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-40">
                            {(Object.entries(statusConfig) as [keyof typeof statusConfig, typeof statusConfig[keyof typeof statusConfig]][]).map(([key, cfg]) => (
                                <DropdownMenuItem
                                    key={key}
                                    className="gap-2 text-xs"
                                    onClick={() => updateStatus({ id: task._id, status: key })}
                                >
                                    <cfg.icon className={cn("h-3.5 w-3.5", cfg.color)} />
                                    {cfg.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Priority */}
                    <DropdownMenu>
                        <DropdownMenuTrigger disabled={task.isCancelled}>
                            <div className={cn("flex h-6 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition-opacity hover:opacity-80", priority.badge, task.isCancelled && "pointer-events-none opacity-50")}>
                                <PriorityIcon className="h-3 w-3" />
                                {priority.label}
                                <ChevronDown className="h-2.5 w-2.5 opacity-60" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-40">
                            {(Object.entries(priorityConfig) as [keyof typeof priorityConfig, typeof priorityConfig[keyof typeof priorityConfig]][]).map(([key, cfg]) => (
                                <DropdownMenuItem
                                    key={key}
                                    className="gap-2 text-xs"
                                    onClick={() => setPriority({ id: task._id, priority: key })}
                                >
                                    <cfg.icon className={cn("h-3.5 w-3.5", cfg.color)} />
                                    {cfg.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Details row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-border/40 bg-muted/10 px-6 py-3">
                    {projectName && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FolderOpen className="h-3.5 w-3.5 shrink-0" />
                            <div className="flex items-center gap-1.5">
                                {projectColor && (
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: projectColor }}
                                    />
                                )}
                                <span className="font-medium text-foreground/70">{projectName}</span>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        <span>Created {new Date(task._creationTime).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                    </div>
                    {task.completedAt && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-500">
                            <CheckCheck className="h-3.5 w-3.5 shrink-0" />
                            <span>Completed {new Date(task.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                        </div>
                    )}
                </div>

                {task.isCancelled && (
                    <div className="flex items-center justify-between gap-4 border-b border-rose-500/20 bg-rose-500/5 px-6 py-2.5 text-xs text-rose-500 shrink-0">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            <span>This task has been cancelled.</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
                            onClick={handleToggleCancel}
                        >
                            Restore
                        </Button>
                    </div>
                )}

                {/* Description editor */}
                <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                        Description
                    </p>

                    {/* Toolbar */}
                    {!task.isCancelled && (
                        <div className="mb-2 flex flex-wrap items-center gap-1 rounded-lg border border-border/50 bg-muted/20 p-1.5">
                            {[
                                { label: "B", action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive("bold"), title: "Bold" },
                                { label: "I", action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive("italic"), title: "Italic" },
                                { label: "S", action: () => editor?.chain().focus().toggleStrike().run(), active: editor?.isActive("strike"), title: "Strikethrough" },
                            ].map((btn) => (
                                <button
                                    key={btn.label}
                                    title={btn.title}
                                    onMouseDown={(e) => { e.preventDefault(); btn.action(); }}
                                    className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded text-xs font-semibold transition-colors",
                                        btn.active
                                            ? "bg-foreground/10 text-foreground"
                                            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                                    )}
                                >
                                    {btn.label}
                                </button>
                             ))}
                            <Separator orientation="vertical" className="h-4" />
                            {[
                                { label: "H1", action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), active: editor?.isActive("heading", { level: 1 }), title: "Heading 1" },
                                { label: "H2", action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive("heading", { level: 2 }), title: "Heading 2" },
                            ].map((btn) => (
                                <button
                                    key={btn.label}
                                    title={btn.title}
                                    onMouseDown={(e) => { e.preventDefault(); btn.action(); }}
                                    className={cn(
                                        "flex h-6 items-center justify-center rounded px-1.5 text-[10px] font-semibold transition-colors",
                                        btn.active
                                            ? "bg-foreground/10 text-foreground"
                                            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                                    )}
                                >
                                    {btn.label}
                                </button>
                            ))}
                            <Separator orientation="vertical" className="h-4" />
                            {[
                                { label: "• List", action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive("bulletList"), title: "Bullet List" },
                                { label: "1. List", action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive("orderedList"), title: "Ordered List" },
                            ].map((btn) => (
                                <button
                                    key={btn.label}
                                    title={btn.title}
                                    onMouseDown={(e) => { e.preventDefault(); btn.action(); }}
                                    className={cn(
                                        "flex h-6 items-center justify-center rounded px-1.5 text-[10px] font-medium transition-colors",
                                        btn.active
                                            ? "bg-foreground/10 text-foreground"
                                            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                                    )}
                                >
                                    {btn.label}
                                </button>
                            ))}
                            <Separator orientation="vertical" className="h-4" />
                            <button
                                title="Code Block"
                                onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleCodeBlock().run(); }}
                                className={cn(
                                    "flex h-6 items-center justify-center rounded px-1.5 font-mono text-[10px] transition-colors",
                                    editor?.isActive("codeBlock")
                                        ? "bg-foreground/10 text-foreground"
                                        : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                                )}
                            >
                                {"</>"}
                            </button>
                        </div>
                    )}

                    {/* Editor area */}
                    <div
                        className={cn(
                            "flex-1 rounded-lg border px-4 py-3 transition-colors",
                            task.isCancelled
                                ? "border-border/20 bg-muted/5 pointer-events-none opacity-60"
                                : "cursor-text border-border/40 bg-muted/5 focus-within:border-border/70 focus-within:bg-background"
                        )}
                        onClick={() => editor?.commands.focus()}
                    >
                        <EditorContent editor={editor} />
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground/40">
                        Auto-saved on focus loss
                    </p>
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-border/40 bg-muted/10 px-6 py-4">
                    <button
                        onClick={handleToggleCancel}
                        className={cn(
                            "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-medium transition-colors",
                            task.isCancelled
                                ? "border-muted-foreground/20 bg-muted-foreground/5 text-muted-foreground hover:bg-muted-foreground/10"
                                : "border-rose-500/20 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10"
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
            </SheetContent>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>Delete task?</DialogTitle>
                        <DialogDescription>
                            &ldquo;{task.text}&rdquo; will be permanently deleted. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                setDeleteDialogOpen(false);
                                await handleDelete();
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Sheet>
    );
}
