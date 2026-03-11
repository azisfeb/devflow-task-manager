"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

import { ThemeProvider } from "next-themes";

const convex = new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider
            appearance={{
                variables: {
                    colorPrimary: "#8b5cf6",
                },
            }}
        >
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                    <TooltipProvider>
                        {children}
                        <Toaster
                            position="bottom-right"
                        />
                    </TooltipProvider>
                </ConvexProviderWithClerk>
            </ThemeProvider>
        </ClerkProvider>
    );
}
