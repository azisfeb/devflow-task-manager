"use client";

import { useState, createContext, useContext, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@clerk/nextjs";

type ProjectContextType = {
    selectedProjectId: Id<"projects"> | null;
    setSelectedProjectId: (id: Id<"projects"> | null) => void;
};

const ProjectContext = createContext<ProjectContextType>({
    selectedProjectId: null,
    setSelectedProjectId: () => { },
});

export const useSelectedProject = () => useContext(ProjectContext);

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const [selectedProjectId, setSelectedProjectId] =
        useState<Id<"projects"> | null>(null);
    const storeUser = useMutation(api.users.store);
    const { isSignedIn } = useAuth();

    useEffect(() => {
        if (isSignedIn) {
            storeUser();
        }
    }, [isSignedIn, storeUser]);

    return (
        <ProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId }}>
            <div className="flex h-screen overflow-hidden bg-background">
                {children}
            </div>
        </ProjectContext.Provider>
    );
}
