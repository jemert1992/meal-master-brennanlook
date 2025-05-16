import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"

import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light")
  }, [theme, setTheme])

  return (
    <div className="inline-flex items-center">
      <button 
        onClick={toggleTheme}
        className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 p-1 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        <span 
          className={`${
            theme === "dark" ? "translate-x-6" : "translate-x-0"
          } inline-block h-6 w-6 rounded-full bg-white shadow-md ring-0 transition-transform dark:bg-gray-800`}
        >
          {theme === "dark" ? (
            <MoonIcon className="h-4 w-4 text-primary m-1" />
          ) : (
            <SunIcon className="h-4 w-4 text-amber-500 m-1" />
          )}
        </span>
      </button>
    </div>
  )
}