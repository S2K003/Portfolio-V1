"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-6 right-6 z-50 p-3 rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg flex items-center justify-center transition-colors hover:bg-black/40 dark:hover:bg-white/20"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-6 w-6 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]" />
      ) : (
        <Moon className="h-6 w-6 text-slate-800" />
      )}
    </motion.button>
  );
}
