"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9"
    >
      <Sun className="h-4 w-4 scale-100 dark:scale-0" />
      <Moon className="absolute h-4 w-4 scale-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
