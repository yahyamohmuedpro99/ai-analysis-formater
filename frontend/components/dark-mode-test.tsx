"use client"

import { useEffect, useState } from "react"

export function DarkModeTest() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial theme
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      checkDarkMode()
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Dark Mode Status</h3>
      <p className="text-sm text-gray-700 dark:text-slate-300">
        Current mode: <span className="font-mono">{isDark ? 'Dark' : 'Light'}</span>
      </p>
      <div className="mt-3 flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${isDark ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        <span className="text-xs text-gray-600 dark:text-slate-400">
          {isDark ? 'Dark mode is active' : 'Light mode is active'}
        </span>
      </div>
    </div>
  )
}