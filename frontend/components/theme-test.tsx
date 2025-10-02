"use client"

import { useTheme } from "next-themes"

export function ThemeTest() {
  const { theme, systemTheme } = useTheme()
  
  return (
    <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <p className="text-sm text-gray-700 dark:text-slate-300">
        Current theme: <span className="font-mono">{theme}</span>
      </p>
      {systemTheme && (
        <p className="text-sm text-gray-700 dark:text-slate-300">
          System theme: <span className="font-mono">{systemTheme}</span>
        </p>
      )}
      <p className="text-sm text-gray-700 dark:text-slate-300 mt-2">
        This text should change color in dark mode
      </p>
    </div>
  )
}