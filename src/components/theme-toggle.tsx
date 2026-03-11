"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch by only rendering after mounting
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg border-sidebar-border/50">
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 rounded-lg border-sidebar-border/50 hover:bg-sidebar-accent transition-colors"
            title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
        >
            {theme === "light" ? (
                <Moon className="h-4 w-4 text-primary" />
            ) : (
                <Sun className="h-4 w-4 text-primary" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
