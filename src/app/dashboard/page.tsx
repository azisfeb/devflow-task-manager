"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Header } from "@/components/header";
import { TaskList } from "@/components/tasks/task-list";
import { CommandPalette } from "@/components/tasks/command-palette";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function DashboardPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="flex h-full flex-col">
                    <Header />
                    <main className="flex-1 overflow-auto p-6">
                        <TaskList />
                    </main>
                </div>
            </SidebarInset>
            <CommandPalette />
        </SidebarProvider>
    );
}
